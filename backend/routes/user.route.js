import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'
import {
  verifyActiveToken,
  verifyActiveAdmin,
  verifyOwner,
} from '../middleware/jwt.middleware.js'

const router = Router()

// Rutas públicas (sin autenticación)
router.post('/login', UserController.login)

// Rutas protegidas - Solo ADMIN puede registrar usuarios
router.post('/register', verifyActiveAdmin, UserController.register)

// Rutas para usuarios autenticados
router.get('/profile', verifyActiveToken, UserController.profile)

// Rutas protegidas - Solo ADMIN
router.get(
  '/',
  (req, res, next) => {
    console.log('🔍 Step 1: Entrando a ruta GET /api/users')
    console.log(
      '📋 Headers:',
      req.headers.authorization ? 'Token presente' : 'Sin token'
    )
    next()
  },
  verifyActiveAdmin,
  (req, res, next) => {
    console.log('✅ Step 2: Middlewares pasados exitosamente')
    console.log('👤 req.role:', req.role)
    console.log('🆔 req.uid:', req.uid)
    next()
  },
  UserController.findAll
)

// CORRECCIÓN: Cambiar rutas para que coincidan con el frontend
// Cambiar rol (ascender/degradar)
router.put('/:uid/role', verifyActiveAdmin, UserController.updateRole)

// Activar/desactivar usuario
router.put('/:uid/status', verifyActiveAdmin, UserController.toggleUserStatus)

// Eliminar usuario
router.delete('/:uid', verifyActiveAdmin, UserController.deleteUser)

export default router
