import React, { useState, useEffect } from 'react'
import UserTable from '../../components/UserTable'

const Reservas = () => {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Columnas para la tabla
  const columns = [
    'nombre',
    'fecha',
    'numerohuespedes',
    'diasestadia',
    'estado',
    'origen',
    'creadaen',
  ]

  // Obtener reservas al cargar el componente
  useEffect(() => {
    obtenerReservas()
  }, [])

  const obtenerReservas = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:5000/api/reservas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener las reservas')
      }

      const data = await response.json()

      // Formatear datos para la tabla
      const reservasFormateadas = data.map((reserva) => ({
        ...reserva,
        numerohuespedes: reserva.numeroHuespedes,
        diasestadia: reserva.diasEstadia,
        creadaen: formatearFechaCreacion(reserva.creadaEn),
      }))

      setReservas(reservasFormateadas)
      setError(null)
    } catch (err) {
      console.error('Error al obtener reservas:', err)
      setError('No se pudieron cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  const confirmarReserva = async (reserva) => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/reservas/${reserva._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: 'confirmada' }),
        }
      )

      if (!response.ok) {
        throw new Error('Error al confirmar la reserva')
      }

      // Actualizar la lista de reservas
      setReservas(
        reservas.map((item) =>
          item._id === reserva._id ? { ...item, estado: 'confirmada' } : item
        )
      )

      alert('Reserva confirmada exitosamente')
    } catch (err) {
      console.error('Error al confirmar reserva:', err)
      alert('Error al confirmar la reserva')
    }
  }

  const eliminarReserva = async (reserva) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/reservas/${reserva._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Error al eliminar la reserva')
      }

      // Actualizar la lista eliminando la reserva
      setReservas(reservas.filter((item) => item._id !== reserva._id))
      alert('Reserva eliminada exitosamente')
    } catch (err) {
      console.error('Error al eliminar reserva:', err)
      alert('Error al eliminar la reserva')
    }
  }

  const formatearFechaCreacion = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Acciones para cada fila
  const actions = [
    {
      label: 'Confirmar',
      onClick: confirmarReserva,
      condition: (reserva) => reserva.estado === 'pendiente',
    },
    {
      label: 'Eliminar',
      onClick: eliminarReserva,
    },
  ]

  // Filtrar acciones según condiciones
  const getActionsForItem = (item) => {
    return actions.filter(
      (action) => !action.condition || action.condition(item)
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando reservas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <p>{error}</p>
        <button
          onClick={obtenerReservas}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Reservas del Bot de WhatsApp</h1>
      <p>Total de reservas: {reservas.length}</p>

      {reservas.length === 0 ? (
        <p>No hay reservas disponibles</p>
      ) : (
        <UserTable
          columns={columns}
          data={reservas}
          actions={actions}
        />
      )}
    </div>
  )
}

export default Reservas
