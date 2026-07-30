// user info update endpoint. to be authorised by user token
//import { } from "cookie-parser";
import { createClient } from "@supabase/supabase-js";

export default async function updateUser(req, res) {
    if (!req.cookies.token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    const { data: user, error: userError } = await supabase.auth.getUser( 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjAxOWI5NzMxLTAyZTQtNGRiOS1hZDEzLWM2NzIzMTliZmVmMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL25mZXVxYmZhZmRiZXp2amh3ZHNqLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0MDI0YmRlMC02ZWVmLTQxNDItODdhYy00N2U0ZjFmOTJiMjciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg1NDMzOTg1LCJpYXQiOjE3ODU0MzAzODUsImVtYWlsIjoidmVkYW50bWFnYXJlOEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidmVkYW50bWFnYXJlOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI0MDI0YmRlMC02ZWVmLTQxNDItODdhYy00N2U0ZjFmOTJiMjcifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc4NTQzMDM4NX1dLCJzZXNzaW9uX2lkIjoiZjQ2MDQxYzctYzZhNi00OTQ5LWI5MDQtYjVlMjc0M2ViOTYzIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.hhd3rcwM2aig9wGNnmeh6QCbOx8rWNEXF0JnAWH5CdBf5LiWNJCKiu5rdAw8qILmf3W1pbaHn_LceTQQNsrZMA' );
    if (userError) {
        console.error("Error fetching user info:", userError);
        return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(typeof(user));
    console.log(user.user.email);
    const user_data = await supabase.from("user_data").select("*").eq("email", user.user.email).single();
    res.status(200).json({ user: user_data });
}