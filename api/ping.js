// Ping handler at url/api/ping

export default function handler(req, res) {
  res.status(200).json({ message: 'SaaS Pinged!!!' })
}
