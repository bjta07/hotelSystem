import express from 'express'
import {
  crearPedido,
  obtenerPedidos,
  actualizarEstadoPedido,
  actualizarPedidoCompleto,
} from '../controllers/pedidos.controller.js'

// Importar middlewares de autenticación
import {
  verifyActiveToken,
  verifyActiveAdmin,
} from '../middleware/jwt.middleware.js'

const router = express.Router()

// Aplicar middleware de autenticación a todas las rutas
// Solo usuarios autenticados pueden acceder
router.use(verifyActiveToken)

// Rutas para pedidos (todas protegidas)
router.post('/', crearPedido) // Crear pedido
router.get('/', obtenerPedidos) // Obtener pedidos
router.patch('/:id', actualizarEstadoPedido) // Actualizar estado
router.put('/:id', actualizarPedidoCompleto) // Actualizar completo

// Si quieres que solo los ADMIN puedan eliminar pedidos, puedes agregar:
//router.delete('/:id', verifyActiveAdmin, eliminarPedido)

export default router
