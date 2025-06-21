// app.js
const express = require('express')
const cors = require('cors')

const app = express()

// Configuración CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

app.use(express.json())

// Rutas aquí...
app.use('/api/auth', require('./routes/authRoutes'))

// Exportar app para server.js
module.exports = app
