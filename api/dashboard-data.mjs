import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    );

    const { data: user, error: userError } = await supabase.auth.getUser(token);
    if (userError) { return res.status(401).json({ message: "Unauthorized" }); }
    const email = user.user.email;
    const { data: userData, error: userDataError } = await supabase
        .from("user_data")
        .select("*")
        .eq("email", email)
        .single();
    const link = btoa(userData.email);
    const name = userData.full_name;
    console.log("User data:", userData);
    res.status(200).json({ link, name });

}