// user info update endpoint. to be authorised by user token

import { createClient } from "@supabase/supabase-js";

export default async function updateUser(req, res) {

    //check if token exists
    if (!req.cookies.token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    //check payload
    const req_data = req.body;
    if (!req_user || !req_user.email) {
        res.status(400).json({ error: "Bad Request: Missing user data" });
        return;
    }
    const req_user = JSON.parse(req_data);

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    // get user from auth token
    const { data: user, error: userError } = await supabase.auth.getUser( 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjAxOWI5NzMxLTAyZTQtNGRiOS1hZDEzLWM2NzIzMTliZmVmMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL25mZXVxYmZhZmRiZXp2amh3ZHNqLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0MDI0YmRlMC02ZWVmLTQxNDItODdhYy00N2U0ZjFmOTJiMjciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg1NDMzOTg1LCJpYXQiOjE3ODU0MzAzODUsImVtYWlsIjoidmVkYW50bWFnYXJlOEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidmVkYW50bWFnYXJlOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI0MDI0YmRlMC02ZWVmLTQxNDItODdhYy00N2U0ZjFmOTJiMjcifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc4NTQzMDM4NX1dLCJzZXNzaW9uX2lkIjoiZjQ2MDQxYzctYzZhNi00OTQ5LWI5MDQtYjVlMjc0M2ViOTYzIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.hhd3rcwM2aig9wGNnmeh6QCbOx8rWNEXF0JnAWH5CdBf5LiWNJCKiu5rdAw8qILmf3W1pbaHn_LceTQQNsrZMA' );
    // if no user is found
    if (userError) {
        console.error("Error fetching user info:", userError);
        return res.status(401).json({ error: "Unauthorized" });
    }

    // get user data of email linked with auth token
    const user_data = await supabase.from("user_data").select("*").eq("email", user.user.email).single();
    if (user_data.error.code === 400){
        // first time user, create a new entry in user_data table
        const new_entry = await supabase.from('user_data').insert({ email: req_user.email})
    }
}