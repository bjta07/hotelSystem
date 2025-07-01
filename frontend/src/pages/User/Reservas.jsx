import React, { useState, useEffect } from 'react'
import UserTable from '../../components/UserTable'
import '../../styles/reservasPedidos.css'

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
      className: 'btnConfirmReserva',
    },
    {
      label: '❌ No Show',
      onClick: marcarNoShow,
      condition: (reserva) => reserva.estado === 'pendiente',
      className: 'btnNoShow',
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
    <div className='mainContainer'>
      <div className='separatorContainer'>
        <div>
          <h1 className='title'>📋 Reservas</h1>
          <p className='subtitle'>
            📊 Total de reservas pendientes: <strong>{reservas.length}</strong>
          </p>
        </div>
        <button
          className='btnReserva'
          onClick={() => setMostrarModal(true)}
        >
          ➕ Nueva Reserva
        </button>
      </div>

      {/* Modal para crear nueva reserva */}
      {mostrarModal && (
        <div className='modal'>
          <div className='modalContainer'>
            <h3 style={{ color: '#007bff', marginBottom: '1.5rem' }}>
              ➕ Crear Nueva Reserva
            </h3>

            <div className='clientTitle'>
              <label className='clientLabel'>👤 Nombre del Cliente:</label>
              <input
                className='inputField'
                type='text'
                name='nombre'
                value={formularioReserva.nombre}
                onChange={manejarCambioFormulario}
                placeholder='Ingrese el nombre completo'
              />
            </div>

            <div className='clientTitle'>
              <label className='clientLabel'>📅 Fecha de Reserva:</label>
              <input
                className='inputField'
                type='date'
                name='fecha'
                value={formularioReserva.fecha}
                onChange={manejarCambioFormulario}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className='gridContainer'>
              <div>
                <label className='clientLabel'>👥 Número de Huéspedes:</label>
                <input
                  className='inputField'
                  type='number'
                  name='numeroHuespedes'
                  value={formularioReserva.numeroHuespedes}
                  onChange={manejarCambioFormulario}
                  min='1'
                  placeholder='Ej: 2'
                />
              </div>

              <div>
                <label className='clientLabel'>🏨 Días de Estadía:</label>
                <input
                  className='inputField'
                  type='number'
                  name='diasEstadia'
                  value={formularioReserva.diasEstadia}
                  onChange={manejarCambioFormulario}
                  min='1'
                  placeholder='Ej: 3'
                />
              </div>
            </div>

            <div className='clientTitle'>
              <label className='clientLabel'>📍 Origen (Opcional):</label>
              <select
                className='inputField'
                name='origen'
                value={formularioReserva.origen}
                onChange={manejarCambioFormulario}
              >
                <option value='web'>Web</option>
                <option value='manual'>Manual</option>
                <option value='whatsapp-bot'>WhatsApp Bot</option>
              </select>
            </div>

            <div className='footer'>
              <button
                className='cancelBtn'
                onClick={() => setMostrarModal(false)}
              >
                ❌ Cancelar
              </button>
              <button
                className='confirmBtn'
                onClick={crearReserva}
              >
                ✅ Crear Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {reservas.length === 0 ? (
        <div className='emptyTableContainer'>
          <div className='emptyContainer'>📋</div>
          <h3>No hay reservas pendientes</h3>
          <p>
            Las reservas confirmadas o marcadas como "No Show" se guardan para
            generar informes
          </p>
        </div>
      ) : (
        <div className='tableContainer'>
          <div className='subtitleContainer'>
            <h3>📊 Lista de Reservas Pendientes</h3>
            <p>
              💡 Tip: Las reservas confirmadas o marcadas como "No Show" se
              eliminarán de esta vista
            </p>
          </div>
          <UserTable
            columns={columns}
            data={reservas.filter((p) => p.estado === 'pendiente')}
            actions={actions}
          />
        </div>
      )}
    </div>
  )
}

export default Reservas
