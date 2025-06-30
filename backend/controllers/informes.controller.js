import Reserva from '../models/reservas.model.js'
import Pedido from '../models/pedidos.model.js'

// Generar informe por rango de fechas
const generarInforme = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.body

    // Validar que las fechas sean proporcionadas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        message: 'Las fechas de inicio y fin son requeridas',
      })
    }

    // Validar formato de fechas
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        message: 'Formato de fecha inválido. Use formato YYYY-MM-DD',
      })
    }

    // Validar que la fecha de inicio no sea mayor que la fecha fin
    if (inicio > fin) {
      return res.status(400).json({
        message: 'La fecha de inicio no puede ser mayor que la fecha fin',
      })
    }

    // Configurar las fechas para incluir todo el día
    inicio.setHours(0, 0, 0, 0) // Inicio del día
    fin.setHours(23, 59, 59, 999) // Final del día

    console.log('📅 Generando informe:')
    console.log('  - Fecha Inicio:', inicio)
    console.log('  - Fecha Fin:', fin)

    // Buscar reservas en el rango de fechas
    const reservas = await Reserva.find({
      creadaEn: { $gte: inicio, $lte: fin },
    }).sort({ creadaEn: -1 }) // Ordenar por fecha de creación descendente

    console.log(`📊 Reservas encontradas: ${reservas.length}`)

    // Buscar pedidos en el rango de fechas
    const pedidos = await Pedido.find({
      fechaCreacion: { $gte: inicio, $lte: fin },
    }).sort({ fechaCreacion: -1 }) // Ordenar por fecha de creación descendente

    console.log(`📊 Pedidos encontrados: ${pedidos.length}`)

    // Calcular estadísticas adicionales
    const estadisticas = {
      totalReservas: reservas.length,
      totalPedidos: pedidos.length,
      reservasPorEstado: {
        pendiente: reservas.filter((r) => r.estado === 'pendiente').length,
        confirmado: reservas.filter((r) => r.estado === 'confirmado').length,
        noShow: reservas.filter((r) => r.estado === 'No Show').length,
      },
      pedidosPorTipo: pedidos.reduce((acc, pedido) => {
        acc[pedido.tipoPedido] = (acc[pedido.tipoPedido] || 0) + 1
        return acc
      }, {}),
      totalHuespedes: reservas.reduce(
        (sum, reserva) => sum + reserva.numeroHuespedes,
        0
      ),
      rangoFechas: {
        inicio: fechaInicio,
        fin: fechaFin,
      },
    }

    res.json({
      success: true,
      message: 'Informe generado exitosamente',
      estadisticas,
      reservas,
      pedidos,
    })
  } catch (error) {
    console.error('❌ Error al generar informe:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar el informe',
    })
  }
}

// Obtener estadísticas generales (sin filtro de fechas)
const obtenerEstadisticasGenerales = async (req, res) => {
  try {
    console.log('📈 Obteniendo estadísticas generales...')

    const totalReservas = await Reserva.countDocuments()
    const totalPedidos = await Pedido.countDocuments()

    const reservasPorEstado = await Reserva.aggregate([
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 },
        },
      },
    ])

    const pedidosPorTipo = await Pedido.aggregate([
      {
        $group: {
          _id: '$tipoPedido',
          count: { $sum: 1 },
        },
      },
    ])

    const estadisticasGenerales = {
      totalReservas,
      totalPedidos,
      reservasPorEstado: reservasPorEstado.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      pedidosPorTipo: pedidosPorTipo.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
    }

    res.json({
      success: true,
      message: 'Estadísticas generales obtenidas exitosamente',
      estadisticas: estadisticasGenerales,
    })
  } catch (error) {
    console.error('❌ Error al obtener estadísticas generales:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas',
    })
  }
}

export { generarInforme, obtenerEstadisticasGenerales }
