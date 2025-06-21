// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken')

const protectRoute =
  (roles = []) =>
  (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const token = authHeader.split(' ')[1]

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      req.user = decoded
      next()
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' })
    }
  }

module.exports = protectRoute
