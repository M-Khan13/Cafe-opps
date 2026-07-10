const jwt = require('jsonwebtoken')

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, cafeId: user.cafeId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = { signToken }