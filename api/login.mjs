import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { email, password } = req.body;

  // Validate the input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log('Error during login:');
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  if (data){
    console.log('Login successful:');
    res.setHeader('Set-Cookie', 'token=' + data.session.access_token + '; HttpOnly; Path=/; Max-Age=3600');
    return res.status(200).json({ message: 'Login successful'});
  }
}
