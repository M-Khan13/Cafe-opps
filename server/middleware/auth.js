const jwt = require('jsonwebtoken')

// verifies the token, attaches the user payload to req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'no token' })

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload            // { id, role, cafeId }
    next()
  } catch {
    return res.status(401).json({ error: 'invalid token' })
  }
}

// must run AFTER requireAuth (needs req.user)
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'admin only' })
  next()
}

module.exports = { requireAuth, requireAdmin }