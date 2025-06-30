import 'dotenv/config'
import cors from 'cors'
import express from 'express'

import botRoutes from './routes/bot.routes.js'
import userRouter from './routes/user.route.js'
import publicRouter from './routes/public.route.js'
import reservasRoutes from './routes/reservas.route.js'
import reservasPedidos from './routes/pedidos.route.js'
import informeRoutes from './routes/informes.route.js'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use('/api/bot', botRoutes)

app.use('/', publicRouter)
app.use('/api/users', userRouter)
app.use('/api/reservas', reservasRoutes)
app.use('/api/pedidos', reservasPedidos)
app.use('/api/informes', informeRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log('Servidor andando en ' + PORT))
