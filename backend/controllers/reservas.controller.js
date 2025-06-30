import Reserva from '../models/reservas.model.js'

// Crear una nueva reserva
const crearReserva = async (req, res) => {
  try {
    const { fecha, nombre, numeroHuespedes, diasEstadia } = req.body

    // Validar datos recibidos (opcional - puedes agregar más validaciones si necesitas)
    if (!fecha || !nombre || !numeroHuespedes || !diasEstadia) {
      return res
        .status(400)
        .json({ error: 'Todos los campos son obligatorios' })
    }

    const nuevaReserva = new Reserva({
      fecha,
      nombre,
      numeroHuespedes,
      diasEstadia,
    })

    await nuevaReserva.save()

    res.status(201).json(nuevaReserva)
  } catch (error) {
    console.error('Error al crear reserva:', error)
    res.status(500).json({ error: 'Error al crear la reserva' })
  }
}

// Obtener todas las reservas (excluyendo confirmadas)
const obtenerReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find({ estado: { $ne: 'confirmado' } })
    res.json(reservas)
  } catch (error) {
    console.error('Error al obtener las reservas:', error)
    res.status(500).json({ error: 'Error al obtener las reservas' })
  }
}

// Actualizar el estado de una reserva (PATCH)
const actualizarEstadoReserva = async (req, res) => {
  try {
    const { estado } = req.body

    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'confirmado', 'No Show']
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        error:
          'Estado no válido. Los estados permitidos son: pendiente, confirmado, No Show',
      })
    }

    const reserva = await Reserva.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    )

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }
    res.json(reserva)
  } catch (error) {
    console.error('Error al actualizar estado de reserva:', error)
    res
      .status(500)
      .json({ error: 'Error al actualizar el estado de la reserva' })
  }
}

// Actualizar reserva completa (PUT)
const actualizarReservaCompleta = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'confirmado', 'No Show']
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        error:
          'Estado no válido. Los estados permitidos son: pendiente, confirmado, No Show',
      })
    }

    const reserva = await Reserva.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    )

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' })
    }

    res.json(reserva)
  } catch (error) {
    console.error('Error al actualizar reserva completa:', error)
    res.status(500).json({ error: 'Error al actualizar la reserva' })
  }
}

export {
  crearReserva,
  obtenerReservas,
  actualizarEstadoReserva,
  actualizarReservaCompleta,
}
