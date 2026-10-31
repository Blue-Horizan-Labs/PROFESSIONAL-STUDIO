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

    const { service_name, description, amount, advanced_amount } = body;

    if (
        typeof service_name !== "string" ||
        !service_name.trim() ||
        service_name.trim().length > 100 ||
        (description !== undefined &&
            (typeof description !== "string" || description.length > 500)) ||
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        (advanced_amount !== undefined &&
            advanced_amount !== null &&
            (typeof advanced_amount !== "number" ||
                !Number.isFinite(advanced_amount) ||
                advanced_amount < 0))
    ) {
        return res.status(400).json({ error: "Service details are invalid" });
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
            return res.status(500).json({ error: "Unable to register service" });
        }

        if (!userData) {
            return res.status(404).json({ error: "User profile not found" });
        }

        const { data: service, error: serviceError } = await supabase
            .from("services")
            .insert({
                studio_id: userData.id,
                name: service_name.trim(),
                description: description?.trim() ?? "",
                amount,
                advanced: advanced_amount ?? null
            })
            .select("*")
            .single();

        if (serviceError) {
            console.error("Failed to register service:", serviceError);
            return res.status(500).json({ error: "Unable to register service" });
        }

        return res.status(201).json({ service });
    } catch (error) {
        console.error("Unexpected error registering service:", error);
        return res.status(500).json({ error: "Unable to register service" });
    }
}