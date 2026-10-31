import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    // if (req.headers["sec-fetch-site"] === "cross-site") {
    //     return res.status(403).json({ error: "Cross-site requests are not allowed" });
    // }

    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const query = JSON.parse(JSON.stringify(req.query ?? {}));
    const { id, status } = query;

    if (typeof id !== "string" || !id.trim()) {
        return res.status(400).json({ error: "A valid appointment id is required" });
    }

    if (status !== "accepted" && status !== "denied") {
        return res.status(400).json({
            error: "Status must be either accepted or denied"
        });
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
            return res.status(500).json({ error: "Unable to update appointment" });
        }

        if (!userData) {
            return res.status(404).json({ error: "User profile not found" });
        }

        const { data: appointment, error: appointmentError } = await supabase
            .from("appointment")
            .update({ status })
            .eq("id", id.trim())
            .eq("studio_id", userData.id)
            .eq("status", "pending/unpaid")
            .select("*")
            .maybeSingle();

        if (appointmentError) {
            console.error("Failed to update appointment:", appointmentError);
            return res.status(500).json({ error: "Unable to update appointment" });
        }

        if (!appointment) {
            return res.status(409).json({
                error: "Appointment was not found or is no longer pending"
            });
        }

        return res.status(200).json({ appointment });
    } catch (error) {
        console.error("Unexpected error updating appointment:", error);
        return res.status(500).json({ error: "Unable to update appointment" });
    }
}