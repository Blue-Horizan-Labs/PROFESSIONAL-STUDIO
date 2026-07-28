import fs from 'fs';

export default async function handler(req, res) {
    const file = new URL('../auth/login-new.html', import.meta.url);
    const html = await fs.promises.readFile(file, 'utf8');
    res.send(html);
}