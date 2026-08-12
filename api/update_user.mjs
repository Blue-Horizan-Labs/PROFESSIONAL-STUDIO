// user info update endpoint. to be authorised by user token

import { createClient } from "@supabase/supabase-js";

export default async function updateUser(req, res) {

    //check if token exists
    if (!req.cookies.token) {
      return res.status(401).json({ error: "Unauthorized: No token provided", redirect: '/login'});
    }

    //check payload
    const req_data = req.body;
    console.log("Request data:", req_data);
    const req_user = req_data;
    if (!req_user || !req_user.email) {
        res.status(400).json({ error: "Bad Request: Missing user data" });
        return;
    }
    

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    // get user from auth token
    const { data: user, error: userError } = await supabase.auth.getUser(req.cookies.token);
    // if no user is found
    if (userError) {
        console.error("Error fetching user info:", userError);
        if (userError.code === '403') {
            // session expired, redirect to login page
            return res.status(403).json({ error: "Session expired. Please log in again.", redirect: '/login' });
        }
        return res.status(401).json({ error: userError });
    }

    // get user data of email linked with auth token
    const user_data = await supabase.from("user_data").select("*").eq("email", user.user.email).single();
    console.log('error is:', user_data.error);

    
    if (user_data.error && user_data.error.code === 'PGRST116'){
        // first time user, create a new entry in user_data table
        const new_entry = await supabase.from('user_data').insert({ 
            std_name: req_user.std_name,
            std_tag: req_user.std_tag,
            full_name: req_user.full_name,
            experience: req_user.experience,
            specialization: req_user.specialization,
            about: req_user.about,
            email: user.user.email,
            phone: req_user.phone,
            std_address: req_user.std_address,
            insta_handle: req_user.insta_handle,
            facebook_handle: req_user.facebook_handle,
            yt_handle: req_user.yt_handle,
        }).select();
        console.log('new entry created:', new_entry);
    } else {
        // update user data
        const  update_entry = await supabase.from('user_data').update({
            std_name: req_user.std_name,
            std_tag: req_user.std_tag,
            full_name: req_user.full_name,
            experience: req_user.experience,
            specialization: req_user.specialization,
            about: req_user.about,
            email: user.user.email,
            phone: req_user.phone,
            std_address: req_user.std_address,
            insta_handle: req_user.insta_handle,
            facebook_handle: req_user.facebook_handle,
            yt_handle: req_user.yt_handle,
        }).eq('email', user.user.email).select();

        console.log('update entry:', update_entry);
    }

    res.status(200).json({ message: "User info updated successfully", redirect: '/user.html' });
}