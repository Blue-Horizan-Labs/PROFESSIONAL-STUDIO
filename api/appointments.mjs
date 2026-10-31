import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        console.error("Supabase environment variables are not configured.");
        return res.status(500).json({ error: "Server configuration error" });
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    );

    try {
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
            return res.status(500).json({ error: "Unable to retrieve appointments" });
        }

        if (!userData) {
            return res.status(404).json({ error: "User profile not found" });
        }

        const { data: appointments, error: appointmentsError } = await supabase
            .from("appointment")
            .select("*")
            .eq("studio_id", userData.id);

        if (appointmentsError) {
            console.error("Failed to retrieve appointments:", appointmentsError);
            return res.status(500).json({ error: "Unable to retrieve appointments" });
        }

        return res.status(200).json({ appointments });
    } catch (error) {
        console.error("Unexpected error retrieving appointments:", error);
        return res.status(500).json({ error: "Unable to retrieve appointments" });
    }
}