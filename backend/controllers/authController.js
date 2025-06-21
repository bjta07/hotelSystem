// controllers/authController.js
const pool = require('../utils/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userSchema = require('../validators/userSchema')

const register = async (req, res) => {
  try {
    const parsed = userSchema.parse(req.body)
    const { name, username, password, email, phone } = parsed
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (name, username, password, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, username, hashedPassword, email, phone]
    )

    res.status(201).json({ message: 'User created', user: result.rows[0] })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const login = async (req, res) => {
  const { username, password } = req.body

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [
    username,
  ])

  if (result.rows.length === 0)
    return res.status(400).json({ error: 'User not found' })

  const user = result.rows[0]
  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) return res.status(400).json({ error: 'Incorrect password' })

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  res.json({ token, user: { id: user.id, name: user.name, role: user.role } })
}

module.exports = { register, login }
