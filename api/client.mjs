// protfolio delivery with /user?id=<ID> route
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
        // get user template from database
        const temp = user.data.template;
        if (temp){
            const substitute = ['std_name', 'full_name', 'std_tag', 'tagline', 'about', 'phone', 'email', 'std_address'];
            let html  = fs.readFileSync(path.join(process.cwd(), 'templates', temp, `${temp}.html`), 'utf8');
            try {
                substitute.forEach((sub) => {
                    if (user[sub] && user[sub] !== '') {
                        html = html.replaceAll(sub, user[sub]);
                    } else {
                        html = html.replaceAll(sub, 'Not Available');
                    }

                });
            } catch (error) {
                console.error('Error substituting values in HTML:', error);
                res.status(500).json({ error: error.message || 'Internal server error' });
                return;
            }
            html = html.replaceAll('decodedid', id);
            res.status(200).send(html);
            return;
        } 

        res.setHeader('Set-Cookie', 'id=' + decodedId + '; HttpOnly; Path=/; Max-Age=3600');
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}