import express from 'express'
import jwt from 'jsonwebtoken'
const router = express.Router()

const auth =
  (roles = []) =>
  (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token' })
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      if (roles.length && !roles.includes(decoded.role))
        return res.status(403).json({ error: 'Prohibido' })
      req.user = decoded
      next()
    } catch {
      return res.status(401).json({ error: 'Token inválido' })
    }
  }

router.get('/admin/data', auth(['admin']), (req, res) => {
  res.json({ msg: 'Solo admin puede ver esto', user: req.user })
})

router.get('/user/data', auth(['user', 'admin']), (req, res) => {
  res.json({ msg: 'Usuario o admin puede ver', user: req.user })
})

export default router
