import React, { useState, useEffect } from 'react'
import UserTable from '../../components/UserTable'

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Columnas para la tabla
  const columns = [
    'Pedido',
    'Producto',
    'Habitacion',
    'cantidad',
    'Estado',
    'Fecha',
  ]

  // Obtener pedidos al cargar el componente
  useEffect(() => {
    obtenerPedidos()
  }, [])

  const obtenerPedidos = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:5000/api/pedidos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener los pedidos')
      }

      const data = await response.json()

      // Formatear datos para la tabla
      const pedidosFormateados = data.map((pedido) => ({
        ...pedido,
        pedido: pedido.tipoPedido,
        producto: pedido.detalleProducto,
        habitacion: pedido.numeroHabitacion,
        fecha: formatearFechaCreacion(pedido.fechaCreacion || pedido.createdAt),
      }))

      setPedidos(pedidosFormateados)
      setError(null)
    } catch (err) {
      console.error('Error al obtener pedidos:', err)
      setError('No se pudieron cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const completarPedido = async (pedido) => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/pedidos/${pedido._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: 'completado' }),
        }
      )

      if (!response.ok) {
        throw new Error('Error al completar el pedido')
      }

      // Actualizar la lista de pedidos
      setPedidos(
        pedidos.map((item) =>
          item._id === pedido._id ? { ...item, estado: 'completado' } : item
        )
      )

      alert('Pedido completado exitosamente')
    } catch (err) {
      console.error('Error al completar pedido:', err)
      alert('Error al completar el pedido')
    }
  }

  const eliminarPedido = async (pedido) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/pedidos/${pedido._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Error al eliminar el pedido')
      }

      // Actualizar la lista eliminando el pedido
      setPedidos(pedidos.filter((item) => item._id !== pedido._id))
      alert('Pedido eliminado exitosamente')
    } catch (err) {
      console.error('Error al eliminar pedido:', err)
      alert('Error al eliminar el pedido')
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
      label: 'Completar',
      onClick: completarPedido,
      condition: (pedido) => pedido.estado === 'pendiente',
    },
    {
      label: 'Eliminar',
      onClick: eliminarPedido,
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando pedidos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <p>{error}</p>
        <button
          onClick={obtenerPedidos}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pedidos del Bot de WhatsApp</h1>
      <p>Total de pedidos: {pedidos.length}</p>

      {pedidos.length === 0 ? (
        <p>No hay pedidos disponibles</p>
      ) : (
        <UserTable
          columns={columns}
          data={pedidos}
          actions={actions}
        />
      )}
    </div>
  )
}

export default Pedidos
