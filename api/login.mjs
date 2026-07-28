export default function handler(req, res) {
  // 1. Changed 'pwd' to 'password' to match the frontend
  const { email, password } = req.body;

  // Validate the input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Mock database
  const users = {
    '1': { email: 'vedantmagare8@gmail.com', password: 'password123' }
  };

  // Check credentials
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email && user.password === password) {
      console.log(`User ${userId} logged in successfully.`);
      return res.status(200).json({ message: 'Login successful', userId });
    } 
  }

  // 2. Added a failure response if the loop finishes without finding a match
  console.log(`Failed login attempt for email: ${email}`);
  return res.status(401).json({ message: 'Invalid email or password.' });
}
