import express from 'express'
import { crearReserva, crearPedido } from '../controllers/bot.controller.js'

const router = express.Router()

// Rutas públicas para el bot de WhatsApp (sin autenticación)
router.post('/reservas', crearReserva) // Bot puede crear reservas
router.post('/pedidos', crearPedido) // Bot puede crear pedidos

export default router
