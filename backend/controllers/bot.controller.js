import Reserva from '../models/reservas.model.js'
import Pedido from '../models/pedidos.model.js'

// Middleware para validar origen del bot (opcional - más seguridad)
const validarOrigenBot = (req, res, next) => {
  // Puedes agregar validación adicional aquí
  // Por ejemplo, verificar un token específico del bot o IP
  const botToken = req.headers['x-bot-token']
  const expectedToken =
    process.env.BOT_SECRET_TOKEN || 'mi_token_secreto_del_bot'

  if (botToken && botToken !== expectedToken) {
    return res.status(403).json({ error: 'Token de bot inválido' })
  }

  next()
}

// Crear reserva desde el bot
const crearReserva = async (req, res) => {
  try {
    const { fecha, nombre, numeroHuespedes, diasEstadia } = req.body

    // Validar datos recibidos
    if (!fecha || !nombre || !numeroHuespedes || !diasEstadia) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios',
        campos: ['fecha', 'nombre', 'numeroHuespedes', 'diasEstadia'],
      })
    }

    // Crear nueva reserva con origen del bot
    const nuevaReserva = new Reserva({
      fecha,
      nombre,
      numeroHuespedes,
      diasEstadia,
      origen: 'whatsapp-bot', // Marcar que viene del bot
      estado: 'pendiente',
    })

    await nuevaReserva.save()

    // Log para auditoria
    console.log('📱 Nueva reserva desde WhatsApp Bot:', {
      id: nuevaReserva._id,
      nombre,
      fecha,
      numeroHuespedes,
      diasEstadia,
    })

    // Emitir evento si tienes Socket.IO configurado
    if (req.io) {
      req.io.emit('nueva-reserva-bot', nuevaReserva)
    }

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente desde WhatsApp',
      data: nuevaReserva,
    })
  } catch (error) {
    console.error('❌ Error al crear reserva desde bot:', error)
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar la reserva',
    })
  }
}

// Crear pedido desde el bot
const crearPedido = async (req, res) => {
  try {
    const { tipoPedido, detalleProducto, numeroHabitacion, cantidad } = req.body

    // Validar datos recibidos
    if (!tipoPedido || !detalleProducto || !numeroHabitacion || !cantidad) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios',
        campos: [
          'tipoPedido',
          'detalleProducto',
          'numeroHabitacion',
          'cantidad',
        ],
      })
    }

    // Crear nuevo pedido con origen del bot
    const nuevoPedido = new Pedido({
      tipoPedido,
      detalleProducto,
      numeroHabitacion,
      cantidad,
      origen: 'whatsapp-bot', // Marcar que viene del bot
      estado: 'pendiente',
    })

    await nuevoPedido.save()

    // Log para auditoria
    console.log('📱 Nuevo pedido desde WhatsApp Bot:', {
      id: nuevoPedido._id,
      tipoPedido,
      detalleProducto,
      numeroHabitacion,
      cantidad,
    })

    // Emitir evento si tienes Socket.IO configurado
    if (req.io) {
      req.io.emit('nuevo-pedido-bot', nuevoPedido)
    }

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente desde WhatsApp',
      data: nuevoPedido,
    })
  } catch (error) {
    console.error('❌ Error al crear pedido desde bot:', error)
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar el pedido',
    })
  }
}

export { crearReserva, crearPedido, validarOrigenBot }
