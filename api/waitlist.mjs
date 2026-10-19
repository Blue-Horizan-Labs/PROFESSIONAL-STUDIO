import { createClient } from "@supabase/supabase-js";

export default async function waitlist(req, res){
    if (!req.body.email){
        return res.status(400).json({ error: "Bad Request: Missing email" });
    }
    const email = req.body.email
    // Process the waitlist request with the provided email
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const {data, error} = await supabase.from("Waitlist").insert({ email: email }).select();
    if (error) {
        console.error("Error adding to waitlist:", error);
        return res.status(500).json({ error: "Internal Server Error: Could not add to waitlist" });
    }
    return res.status(200).json({ message: "Successfully added to waitlist" });

}