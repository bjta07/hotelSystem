import React, { useState, useEffect } from 'react'
import UserTable from '../../components/UserTable'
import '../../styles/reservasPedidos.css'

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    tipoPedido: '',
    detalleProducto: '',
    numeroHabitacion: '',
    cantidad: 1,
  })
  const [submitting, setSubmitting] = useState(false)

  // Columnas para la tabla (nombres que coinciden con las propiedades mapeadas)
  const columns = [
    'Pedido',
    'Producto',
    'Habitacion',
    'Cantidad',
    'Estado',
    'Fecha',
    'Actualizado',
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

      // Formatear datos para la tabla (igual que en la versión original)
      const pedidosFormateados = data.map((pedido) => ({
        ...pedido,
        Pedido: pedido.tipoPedido,
        Producto: pedido.detalleProducto,
        Habitacion: pedido.numeroHabitacion,
        Cantidad: pedido.cantidad,
        Estado: pedido.estado,
        Fecha: formatearFechaCreacion(pedido.fechaCreacion),
        Actualizado: formatearFechaCreacion(pedido.fechaActualizacion),
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

  const crearPedido = async (e) => {
    e.preventDefault()

    // Validar campos obligatorios
    if (
      !formData.tipoPedido ||
      !formData.detalleProducto ||
      !formData.numeroHabitacion ||
      !formData.cantidad
    ) {
      alert('Todos los campos son obligatorios')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:5000/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipoPedido: formData.tipoPedido,
          detalleProducto: formData.detalleProducto,
          numeroHabitacion: parseInt(formData.numeroHabitacion),
          cantidad: parseInt(formData.cantidad),
          fechaCreacion: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear el pedido')
      }

      // Resetear formulario
      setFormData({
        tipoPedido: '',
        detalleProducto: '',
        numeroHabitacion: '',
        cantidad: 1,
      })
      setShowCreateForm(false)

      // Recargar pedidos
      await obtenerPedidos()
      alert('Pedido creado exitosamente')
    } catch (err) {
      console.error('Error al crear pedido:', err)
      alert('Error al crear el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  const actualizarEstado = async (pedido, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/pedidos/${pedido._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      )

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del pedido')
      }

      // Actualizar la lista localmente
      if (nuevoEstado === 'entregado') {
        // Si el pedido fue entregado, lo eliminamos de la lista
        setPedidos(pedidos.filter((item) => item._id !== pedido._id))
      } else {
        // En cualquier otro caso, actualizamos su estado
        setPedidos(
          pedidos.map((item) =>
            item._id === pedido._id
              ? { ...item, estado: nuevoEstado, Estado: nuevoEstado }
              : item
          )
        )
      }

      alert(`Pedido marcado como ${nuevoEstado}`)
    } catch (err) {
      console.error('Error al actualizar estado:', err)
      alert('Error al actualizar el estado del pedido')
    }
  }

  const confirmarPedido = async (pedido) => {
    await actualizarEstado(pedido, 'confirmado')
  }

  const entregarPedido = async (pedido) => {
    await actualizarEstado(pedido, 'entregado')
  }

  const cancelarPedido = async (pedido) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      return
    }
    await actualizarEstado(pedido, 'cancelado')
  }

  const formatearFechaCreacion = (fecha) => {
    if (!fecha) return 'No disponible'

    try {
      return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Acciones para cada fila según el estado
  const actions = [
    {
      label: 'Confirmar',
      onClick: confirmarPedido,
      condition: (pedido) => pedido.estado === 'pendiente',
      className: 'btnConfirmReserva',
    },
    {
      label: 'Entregar',
      onClick: entregarPedido,
      condition: (pedido) => pedido.estado === 'confirmado',
      className: 'btnEntregaReserva',
    },
    {
      label: 'Cancelar',
      onClick: cancelarPedido,
      condition: (pedido) =>
        ['pendiente', 'confirmado'].includes(pedido.estado),
      className: 'btnNoShow',
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
    <div className='mainContainer'>
      <div className='separatorContainer'>
        <div>
          <h1 className='title'>📋Gestión de Pedidos</h1>
          <p className='subtitle'>📊Total de pedidos: {pedidos.length}</p>
        </div>
        <button
          className='btnReserva'
          onClick={() => setShowCreateForm(true)}
        >
          ➕Crear Nuevo Pedido
        </button>
      </div>

      {/* Modal/Formulario para crear pedido */}
      {showCreateForm && (
        <div className='modal'>
          <div className='modalContainer'>
            <h2>Crear Nuevo Pedido</h2>
            <form onSubmit={crearPedido}>
              <div style={{ marginBottom: '1rem' }}>
                <label className='clientLabel'>Tipo de Pedido:</label>
                <select
                  name='tipoPedido'
                  value={formData.tipoPedido}
                  onChange={handleInputChange}
                  className='inputField'
                  required
                >
                  <option value=''>Selecciona un tipo</option>
                  <option value='Alimentos'>Alimentos</option>
                  <option value='Bebidas'>Bebidas</option>
                  <option value='Amenities'>Amenities</option>
                  <option value='Servicios'>Servicios</option>
                  <option value='Otros'>Otros</option>
                </select>
              </div>

              <div className='clientTitle'>
                <label className='clientLabel'>Detalle del Producto:</label>
                <textarea
                  name='detalleProducto'
                  value={formData.detalleProducto}
                  onChange={handleInputChange}
                  placeholder='Ej: Pique Macho, Coca Cola, Toallas adicionales...'
                  required
                />
              </div>

              <div className='clientTitle'>
                <label className='clientLabel'>Número de Habitación:</label>
                <input
                  type='number'
                  name='numeroHabitacion'
                  value={formData.numeroHabitacion}
                  onChange={handleInputChange}
                  className='inputField'
                  required
                  min='1'
                  placeholder='Ej: 750'
                />
              </div>

              <div className='clientTitle'>
                <label className='clientLabel'>Cantidad:</label>
                <input
                  type='number'
                  name='cantidad'
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  className='inputField'
                  required
                  min='1'
                />
              </div>

              <div className='footer'>
                <button
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                  className='cancelBtn'
                  disabled={submitting}
                >
                  ❌Cancelar
                </button>
                <button
                  type='submit'
                  className='confirmBtn'
                  disabled={submitting}
                >
                  ✅{submitting ? 'Creando...' : 'Crear Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className='emptyTableContainer'>
          <p>No hay pedidos disponibles</p>
          <p>Crea tu primer pedido usando el botón "Crear Nuevo Pedido"</p>
        </div>
      ) : (
        <UserTable
          columns={columns}
          data={pedidos.filter(
            (p) => p.estado === 'pendiente' || p.estado === 'confirmado'
          )}
          actions={actions}
        />
      )}
    </div>
  )
}

export default Pedidos
