import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  }

  try {
    const { email, password } = req.body || {};

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    // Validate Supabase configuration
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.error("Missing Supabase environment variables.");

      return res.status(500).json({
        success: false,
        message: "Server configuration error."
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    // Supabase returned an authentication error
    if (error) {
      console.error("Error during signup:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Unable to create account."
      });
    }

    // Account was created successfully
    console.log("Signup successful:", data);

    /*
      A session may be null when Supabase requires
      email confirmation before login.
    */
    if (data?.session?.access_token) {
      res.setHeader(
        "Set-Cookie",
        `token=${data.session.access_token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`
      );
    }

    return res.status(200).json({
      success: true,
      message: "200",
      requiresEmailConfirmation: !data?.session
    });

  } catch (error) {
    console.error("Signup server error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account."
    });
  }
}