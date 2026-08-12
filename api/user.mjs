// protfolio delivery with /user/:id route

export default async function handler(req, res) {
    const { id } = req.query;
    const decodedId = atob(id);
    res.status(200).json({ message: `Portfolio for user with ID: ${decodedId}` });
}