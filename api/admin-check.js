// api/admin-check.js
// GET → returns { authed: true } if valid session cookie present
// Called by admin/index.html on every page load before rendering anything

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  const token = cookies['vd_admin_session'];

  if (!token || !process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ authed: false });
  }

  try {
    const decoded  = Buffer.from(token, 'base64').toString('utf8');
    const [ts, pw] = decoded.split(':');

    const validPassword = pw === process.env.ADMIN_PASSWORD;
    const notExpired    = Date.now() - parseInt(ts) < 28800 * 1000; // 8 hours

    if (validPassword && notExpired) {
      return res.status(200).json({ authed: true });
    }
  } catch {
    // malformed token
  }

  // Clear invalid cookie
  res.setHeader('Set-Cookie', 'vd_admin_session=; HttpOnly; Secure; Path=/admin; Max-Age=0');
  return res.status(401).json({ authed: false });
}
