import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ error: "A JSON request body is required" });
    }

    const serviceId = body.service_id;
    if (
        (typeof serviceId !== "string" && typeof serviceId !== "number") ||
        !String(serviceId).trim()
    ) {
        return res.status(400).json({ error: "A valid service_id is required" });
    }

    const authorization = req.headers?.authorization;
    const bearerToken =
        typeof authorization === "string" && authorization.startsWith("Bearer ")
            ? authorization.slice(7).trim()
            : "";
    const token = req.cookies?.token || bearerToken;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
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
            return res.status(500).json({ error: "Unable to delete service" });
        }

        if (!userData) {
            return res.status(404).json({ error: "User profile not found" });
        }

        const { data: service, error: serviceError } = await supabase
            .from("services")
            .delete()
            .eq("id", String(serviceId).trim())
            .eq("studio_id", userData.id)
            .select("*")
            .maybeSingle();

        if (serviceError) {
            console.error("Failed to delete service:", serviceError);
            return res.status(500).json({ error: "Unable to delete service" });
        }

        if (!service) {
            return res.status(404).json({
                error: "Service not found for this studio"
            });
        }

        return res.status(200).json({ service });
    } catch (error) {
        console.error("Unexpected error deleting service:", error);
        return res.status(500).json({ error: "Unable to delete service" });
    }
}