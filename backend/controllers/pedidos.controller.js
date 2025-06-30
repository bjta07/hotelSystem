import Pedido from '../models/pedidos.model.js'

// Crear un nuevo pedido
const crearPedido = async (req, res) => {
  try {
    const {
      tipoPedido,
      detalleProducto,
      numeroHabitacion,
      cantidad,
      fechaCreacion,
    } = req.body

    // Validar datos recibidos
    if (!tipoPedido || !detalleProducto || !numeroHabitacion || !cantidad) {
      return res
        .status(400)
        .json({ error: 'Todos los campos son obligatorios' })
    }

    // Crear un nuevo pedido
    const nuevoPedido = new Pedido({
      tipoPedido,
      detalleProducto,
      numeroHabitacion,
      cantidad,
      fechaCreacion,
    })

    await nuevoPedido.save()

    // Emitir evento de nuevo pedido a los clientes
    req.io.emit('nuevo-pedido', nuevoPedido)

    res.status(201).json(nuevoPedido)
  } catch (error) {
    console.error('Error al crear pedido:', error)
    res.status(500).json({ error: 'Error al crear el pedido' })
  }
}

// Obtener todos los pedidos (excluyendo confirmados)
const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ estado: { $ne: 'confirmado' } })
    res.json(pedidos)
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    res.status(500).json({ error: 'Error al obtener los pedidos' })
  }
}

// Actualizar el estado de un pedido (PATCH)
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { estado } = req.body
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    )

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    req.io.emit('pedido-actualizado', pedido)

    res.json(pedido)
  } catch (error) {
    console.error('Error al actualizar pedido:', error)
    res.status(500).json({ error: 'Error al actualizar el pedido' })
  }
}

// Actualizar el estado de un pedido (PUT)
const actualizarPedidoCompleto = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const pedido = await Pedido.findByIdAndUpdate(id, { estado }, { new: true })

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    res.json(pedido)
  } catch (error) {
    console.error('Error al actualizar pedido completo:', error)
    res.status(500).json({ error: 'Error al actualizar el pedido' })
  }
}

export {
  crearPedido,
  obtenerPedidos,
  actualizarEstadoPedido,
  actualizarPedidoCompleto,
}
