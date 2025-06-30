import express from 'express'
import {
  generarInforme,
  obtenerEstadisticasGenerales,
} from '../controllers/informes.controller.js'

// Importar middlewares de autenticación
import {
  verifyActiveToken,
  verifyActiveAdmin,
} from '../middleware/jwt.middleware.js'

const router = express.Router()

// Aplicar middleware de autenticación a todas las rutas
// Solo usuarios autenticados pueden acceder a informes
router.use(verifyActiveToken)

// Rutas para informes (todas protegidas)
router.post('/', generarInforme) // Generar informe por fechas
router.get('/estadisticas', obtenerEstadisticasGenerales) // Estadísticas generales

// Si quieres que solo los ADMIN puedan ver informes, cambia por:
// router.use(verifyActiveAdmin) // Descomenta esta línea y comenta la línea 15

export default router
