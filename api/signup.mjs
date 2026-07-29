import {createClient} from "@supabase/supabase-js";

export default async function handler(req, res) {
  const { email, password } = req.body;

  // Validate the input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error('Error during signup:', error);
    return res.status(400).json({ message: 'Error during signup.' });
  }
  if (data){
    console.log('Signup successful:', data);
    res.setHeader('Set-Cookie', 'token=' + data.session.access_token + '; HttpOnly; Path=/; Max-Age=3600');
    return res.status(200).json({ message: '200'});
  }
}   