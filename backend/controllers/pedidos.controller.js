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

    res.status(201).json(nuevoPedido)
  } catch (error) {
    console.error('Error al crear pedido:', error)
    res.status(500).json({ error: 'Error al crear el pedido' })
  }
}

// Obtener todos los pedidos (excluyendo confirmados si es necesario)
const obtenerPedidos = async (req, res) => {
  try {
    // Obtener todos los pedidos sin filtrar por estado
    // Si quieres excluir algunos estados, descomenta la línea de abajo
    // const pedidos = await Pedido.find({ estado: { $ne: 'confirmado' } })
    const pedidos = await Pedido.find({}).sort({ fechaCreacion: -1 })
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

    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'confirmado', 'entregado', 'cancelado']
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', '),
      })
    }

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    )

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

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

    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'confirmado', 'entregado', 'cancelado']
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', '),
      })
    }

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

// Obtener un pedido por ID
const obtenerPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    res.json(pedido)
  } catch (error) {
    console.error('Error al obtener pedido:', error)
    res.status(500).json({ error: 'Error al obtener el pedido' })
  }
}

// Eliminar un pedido (opcional, si lo necesitas)
const eliminarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id)

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    res.json({ message: 'Pedido eliminado exitosamente', pedido })
  } catch (error) {
    console.error('Error al eliminar pedido:', error)
    res.status(500).json({ error: 'Error al eliminar el pedido' })
  }
}

export {
  crearPedido,
  obtenerPedidos,
  actualizarEstadoPedido,
  actualizarPedidoCompleto,
  obtenerPedidoPorId,
  eliminarPedido,
}
