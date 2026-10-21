// protfolio delivery with /user?id=<ID> route
import { createClient } from '@supabase/supabase-js';
import 'fs';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    
    const { id } = req.query;
    try {
        if (!id) {
            res.status(400).json({ error: 'Missing id parameter' });
            return;
        }
    
    const decodedId = atob(id);
    // res.status(200).json({ message: `Portfolio for user with ID: ${decodedId}` });
    const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('email', decodedId);
    console.log('data is:', data);
    console.log('error is:', error);
    if (error) {
        throw error;
    }
    const user = data[0];
    console.log('user is:', user);
    res.setHeader('Set-Cookie', 'id=' + decodedId + '; HttpOnly; Path=/; Max-Age=3600');
    res.status(200).json({ user });
} catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
}
}