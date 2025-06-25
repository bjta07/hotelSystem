import 'dotenv/config'
import cors from 'cors'
import express from 'express'

import userRouter from './routes/user.route.js'
import publicRouter from './routes/public.route.js'

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

app.use('/', publicRouter)
app.use('/api/users', userRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log('Servidor andando en ' + PORT))
