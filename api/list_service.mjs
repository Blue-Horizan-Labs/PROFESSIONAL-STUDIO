import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const requestedStudioId = req.query?.studio_id;
    if (
        requestedStudioId !== undefined &&
        (typeof requestedStudioId !== "string" || !requestedStudioId.trim())
    ) {
        return res.status(400).json({ error: "A valid studio_id is required" });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        console.error("Supabase environment variables are not configured.");
        return res.status(500).json({ error: "Server configuration error" });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        );
        let studioId = requestedStudioId?.trim();

        if (!studioId) {
            const authorization = req.headers?.authorization;
            const bearerToken =
                typeof authorization === "string" &&
                authorization.startsWith("Bearer ")
                    ? authorization.slice(7).trim()
                    : "";
            const token = req.cookies?.token || bearerToken;

            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const { data: authData, error: authError } =
                await supabase.auth.getUser(token);

            if (authError || !authData.user?.email) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const { data: userData, error: userDataError } = await supabase
                .from("user_data")
                .select("id")
                .eq("email", authData.user.email)
                .maybeSingle();

            if (userDataError) {
                console.error("Failed to look up user_data:", userDataError);
                return res.status(500).json({ error: "Unable to retrieve services" });
            }

            if (!userData) {
                return res.status(404).json({ error: "User profile not found" });
            }

            studioId = userData.id;
        }

        const { data: services, error: servicesError } = await supabase
            .from("services")
            .select("id, name, description, amount, advanced")
            .eq("studio_id", studioId);

        if (servicesError) {
            console.error("Failed to retrieve services:", servicesError);
            return res.status(500).json({ error: "Unable to retrieve services" });
        }

        return res.status(200).json(services ?? []);
    } catch (error) {
        console.error("Unexpected error retrieving services:", error);
        return res.status(500).json({ error: "Unable to retrieve services" });
    }
}