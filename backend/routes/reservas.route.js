import express from 'express'
import {
  crearReserva,
  obtenerReservas,
  actualizarEstadoReserva,
  actualizarReservaCompleta,
} from '../controllers/reservas.controller.js'

// Importar middlewares de autenticación
import {
  verifyActiveToken,
  verifyActiveAdmin,
} from '../middleware/jwt.middleware.js'

const router = express.Router()

// Aplicar middleware de autenticación a todas las rutas
// Solo usuarios autenticados pueden acceder
router.use(verifyActiveToken)

// Rutas para reservas (todas protegidas)
router.post('/', crearReserva) // Crear reserva
router.get('/', obtenerReservas) // Obtener reservas
router.patch('/:id', actualizarEstadoReserva) // Actualizar estado
router.put('/:id', actualizarReservaCompleta) // Actualizar completa

// Si quieres que solo los ADMIN puedan eliminar reservas, puedes agregar:
// router.delete('/:id', verifyActiveAdmin, eliminarReserva)

export default router
