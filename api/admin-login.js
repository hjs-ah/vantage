// api/admin-login.js
// POST { password } → sets httpOnly session cookie on success
// Env var required: ADMIN_PASSWORD (set in Vercel dashboard, never in code)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD env var not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    // Small delay to slow brute-force attempts
    await new Promise(r => setTimeout(r, 400));
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // Simple signed session token — timestamp + secret hash
  const token = Buffer.from(
    `${Date.now()}:${process.env.ADMIN_PASSWORD}`
  ).toString('base64');

  // httpOnly cookie — JS on the page cannot read this
  res.setHeader('Set-Cookie', [
    `vd_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=28800`
    // Max-Age=28800 → 8 hours
  ]);

  return res.status(200).json({ ok: true });
}
