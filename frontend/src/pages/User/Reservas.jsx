import React, { useState, useEffect } from 'react'
import UserTable from '../../components/UserTable'

const Reservas = () => {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const [reservaEditando, setReservaEditando] = useState(null)

  // Formulario para nueva reserva
  const [formularioReserva, setFormularioReserva] = useState({
    fecha: '',
    nombre: '',
    numeroHuespedes: '',
    diasEstadia: '',
    estado: 'pendiente',
    origen: '',
  })

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
        fecha: formatearFecha(reserva.fecha),
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

  const crearReserva = async () => {
    try {
      const token = localStorage.getItem('token')

      // Validar campos obligatorios
      if (
        !formularioReserva.fecha ||
        !formularioReserva.nombre ||
        !formularioReserva.numeroHuespedes ||
        !formularioReserva.diasEstadia
      ) {
        alert('Todos los campos son obligatorios')
        return
      }

      const response = await fetch('http://localhost:5000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha: formularioReserva.fecha,
          nombre: formularioReserva.nombre,
          numeroHuespedes: parseInt(formularioReserva.numeroHuespedes),
          diasEstadia: parseInt(formularioReserva.diasEstadia),
          origen: formularioReserva.origen || 'manual',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la reserva')
      }

      const nuevaReserva = await response.json()

      // Formatear y agregar a la lista
      const reservaFormateada = {
        ...nuevaReserva,
        numerohuespedes: nuevaReserva.numeroHuespedes,
        diasestadia: nuevaReserva.diasEstadia,
        creadaen: formatearFechaCreacion(nuevaReserva.creadaEn),
        fecha: formatearFecha(nuevaReserva.fecha),
      }

      setReservas([reservaFormateada, ...reservas])

      // Limpiar formulario
      setFormularioReserva({
        fecha: '',
        nombre: '',
        numeroHuespedes: '',
        diasEstadia: '',
        estado: 'pendiente',
        origen: '',
      })

      setMostrarModal(false)
      alert('Reserva creada exitosamente')
    } catch (err) {
      console.error('Error al crear reserva:', err)
      alert(`Error al crear la reserva: ${err.message}`)
    }
  }

  const confirmarReserva = async (reserva) => {
    if (
      !window.confirm('¿Estás seguro de que deseas confirmar esta reserva?')
    ) {
      return
    }

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
          body: JSON.stringify({ estado: 'confirmado' }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al confirmar la reserva')
      }

      // Eliminar la reserva de la tabla ya que cambió de estado
      setReservas(reservas.filter((item) => item._id !== reserva._id))
      alert('Reserva confirmada exitosamente')
    } catch (err) {
      console.error('Error al confirmar reserva:', err)
      alert(`Error al confirmar la reserva: ${err.message}`)
    }
  }

  const marcarNoShow = async (reserva) => {
    if (
      !window.confirm(
        '¿Estás seguro de que deseas marcar esta reserva como "No Show"?'
      )
    ) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/reservas/${reserva._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: 'No Show' }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al marcar como No Show')
      }

      // Eliminar la reserva de la tabla ya que cambió de estado
      setReservas(reservas.filter((item) => item._id !== reserva._id))
      alert('Reserva marcada como "No Show" exitosamente')
    } catch (err) {
      console.error('Error al marcar como No Show:', err)
      alert(`Error al marcar como No Show: ${err.message}`)
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

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target
    setFormularioReserva((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Acciones para cada fila
  const actions = [
    {
      label: '✅ Confirmar',
      onClick: confirmarReserva,
      condition: (reserva) => reserva.estado === 'pendiente',
      style: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
      },
    },
    {
      label: '❌ No Show',
      onClick: marcarNoShow,
      condition: (reserva) => reserva.estado === 'pendiente',
      style: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
      },
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.2rem', color: '#007bff' }}>
          ⏳ Cargando reservas...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          ❌ {error}
        </div>
        <button
          onClick={obtenerReservas}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '2px solid #007bff',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <h1 style={{ color: '#007bff', margin: '0' }}>
            📋 Reservas del Bot de WhatsApp
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
            📊 Total de reservas pendientes: <strong>{reservas.length}</strong>
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          ➕ Nueva Reserva
        </button>
      </div>

      {/* Modal para crear nueva reserva */}
      {mostrarModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ color: '#007bff', marginBottom: '1.5rem' }}>
              ➕ Crear Nueva Reserva
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                }}
              >
                👤 Nombre del Cliente:
              </label>
              <input
                type='text'
                name='nombre'
                value={formularioReserva.nombre}
                onChange={manejarCambioFormulario}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                placeholder='Ingrese el nombre completo'
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                }}
              >
                📅 Fecha de Reserva:
              </label>
              <input
                type='date'
                name='fecha'
                value={formularioReserva.fecha}
                onChange={manejarCambioFormulario}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  👥 Número de Huéspedes:
                </label>
                <input
                  type='number'
                  name='numeroHuespedes'
                  value={formularioReserva.numeroHuespedes}
                  onChange={manejarCambioFormulario}
                  min='1'
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                  placeholder='Ej: 2'
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  🏨 Días de Estadía:
                </label>
                <input
                  type='number'
                  name='diasEstadia'
                  value={formularioReserva.diasEstadia}
                  onChange={manejarCambioFormulario}
                  min='1'
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                  placeholder='Ej: 3'
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                }}
              >
                📍 Origen (Opcional):
              </label>
              <select
                name='origen'
                value={formularioReserva.origen}
                onChange={manejarCambioFormulario}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              >
                <option value='web'>Web</option>
                <option value='manual'>Manual</option>
                <option value='whatsapp-bot'>WhatsApp Bot</option>
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setMostrarModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ❌ Cancelar
              </button>
              <button
                onClick={crearReserva}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✅ Crear Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {reservas.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#6c757d', margin: '0 0 0.5rem 0' }}>
            No hay reservas pendientes
          </h3>
          <p style={{ color: '#6c757d', margin: '0' }}>
            Las reservas confirmadas o marcadas como "No Show" se guardan para
            generar informes
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderBottom: '1px solid #dee2e6',
            }}
          >
            <h3 style={{ margin: '0', color: '#495057' }}>
              📊 Lista de Reservas Pendientes
            </h3>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                color: '#6c757d',
                fontSize: '0.9rem',
              }}
            >
              💡 Tip: Las reservas confirmadas o marcadas como "No Show" se
              eliminarán de esta vista
            </p>
          </div>
          <UserTable
            columns={columns}
            data={reservas}
            actions={actions}
          />
        </div>
      )}
    </div>
  )
}

export default Reservas
