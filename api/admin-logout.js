// api/admin-logout.js
// POST → clears the session cookie

export default async function handler(req, res) {
  res.setHeader('Set-Cookie',
    'vd_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=0'
  );
  return res.status(200).json({ ok: true });
}
