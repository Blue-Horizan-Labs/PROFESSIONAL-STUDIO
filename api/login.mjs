// login endpoint reciving emial and password from the user

export default function handler(req, res) {
  const { email, pwd } = req.body;

  //
  //  Validate the input
  if (!email || !pwd) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // mock database
  const users = {
    '1': { email: 'vedantmagare8@gmail.com', password: 'password123' }
  };

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email && user.password === pwd) {
      return res.status(200).json({ message: 'Login successful', userId });
    } 
    
  }

}
