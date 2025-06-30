import React, { useState } from 'react'
import UserTable from '../../components/UserTable'

const Informes = () => {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [datosInforme, setDatosInforme] = useState(null)
  const [mostrandoInforme, setMostrandoInforme] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Columnas para reservas
  const columnasReservas = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'numeroHuespedes', label: 'Huéspedes' },
    { key: 'diasEstadia', label: 'Días Estadía' },
    { key: 'estado', label: 'Estado' },
    { key: 'origen', label: 'Origen' },
  ]

  // Columnas para pedidos
  const columnasPedidos = [
    { key: 'tipoPedido', label: 'Tipo Pedido' },
    { key: 'detalleProducto', label: 'Detalle Producto' },
    { key: 'numeroHabitacion', label: 'Habitación' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'estado', label: 'Estado' },
    { key: 'fechaCreacion', label: 'Fecha Creación' },
  ]

  const generarInforme = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Por favor selecciona las fechas de inicio y fin')
      return
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('La fecha de inicio no puede ser mayor que la fecha fin')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:5000/api/informes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener el informe')
      }

      const data = await response.json()

      // Formatear fechas para mostrar mejor
      const reservasFormateadas = data.reservas.map((reserva) => ({
        ...reserva,
        fecha: new Date(reserva.fecha).toLocaleDateString('es-ES'),
        creadaEn: new Date(reserva.creadaEn).toLocaleDateString('es-ES'),
      }))

      const pedidosFormateados = data.pedidos.map((pedido) => ({
        ...pedido,
        fechaCreacion: new Date(pedido.fechaCreacion).toLocaleDateString(
          'es-ES'
        ),
      }))

      setDatosInforme({
        ...data,
        reservas: reservasFormateadas,
        pedidos: pedidosFormateados,
      })
      setMostrandoInforme(true)
    } catch (err) {
      console.error('Error al generar informe:', err)
      setError(`No se pudo generar el informe: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const generarPDF = () => {
    if (!mostrandoInforme || !datosInforme) {
      alert('Primero debes generar un informe')
      return
    }

    const { estadisticas, reservas, pedidos } = datosInforme

    // Crear contenido HTML para el PDF
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe de Reservas y Pedidos</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #007bff;
              padding-bottom: 20px;
            }
            h1 { 
              color: #007bff; 
              margin: 0;
            }
            .info { 
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 25px;
            }
            .estadisticas {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            .stat-card {
              background-color: #e9ecef;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #007bff;
            }
            .stat-title {
              font-weight: bold;
              color: #007bff;
              margin-bottom: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th { 
              background-color: #007bff;
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
            }
            td { 
              border: 1px solid #dee2e6;
              padding: 10px 8px;
              text-align: left;
            }
            tr:nth-child(even) { 
              background-color: #f8f9fa;
            }
            tr:hover {
              background-color: #e9ecef;
            }
            .section-title {
              color: #007bff;
              font-size: 18px;
              font-weight: bold;
              margin: 25px 0 15px 0;
              border-bottom: 1px solid #007bff;
              padding-bottom: 5px;
            }
            .no-data {
              text-align: center;
              color: #6c757d;
              font-style: italic;
              padding: 20px;
            }
            @media print {
              body { margin: 0; }
              .info { page-break-inside: avoid; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Informe de Reservas y Pedidos</h1>
          </div>
          
          <div class="info">
            <p><strong>📅 Período:</strong> ${fechaInicio} hasta ${fechaFin}</p>
            <p><strong>📄 Fecha de generación:</strong> ${new Date().toLocaleString(
              'es-ES'
            )}</p>
          </div>

          <div class="estadisticas">
            <div class="stat-card">
              <div class="stat-title">📋 Resumen de Reservas</div>
              <p><strong>Total:</strong> ${estadisticas.totalReservas}</p>
              <p><strong>Pendientes:</strong> ${
                estadisticas.reservasPorEstado.pendiente || 0
              }</p>
              <p><strong>Confirmadas:</strong> ${
                estadisticas.reservasPorEstado.confirmado || 0
              }</p>
              <p><strong>No Show:</strong> ${
                estadisticas.reservasPorEstado.noShow || 0
              }</p>
              <p><strong>Total Huéspedes:</strong> ${
                estadisticas.totalHuespedes
              }</p>
            </div>
            
            <div class="stat-card">
              <div class="stat-title">🛍️ Resumen de Pedidos</div>
              <p><strong>Total:</strong> ${estadisticas.totalPedidos}</p>
              ${Object.entries(estadisticas.pedidosPorTipo || {})
                .map(
                  ([tipo, cantidad]) =>
                    `<p><strong>${tipo}:</strong> ${cantidad}</p>`
                )
                .join('')}
            </div>
          </div>

          <div class="section-title">📋 Reservas (${reservas.length})</div>
          ${
            reservas.length === 0
              ? '<div class="no-data">No se encontraron reservas en el período seleccionado</div>'
              : `<table>
              <thead>
                <tr>
                  ${columnasReservas
                    .map((col) => `<th>${col.label}</th>`)
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${reservas
                  .map(
                    (reserva) => `
                  <tr>
                    ${columnasReservas
                      .map((col) => `<td>${reserva[col.key] || '-'}</td>`)
                      .join('')}
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>`
          }

          <div class="section-title">🛍️ Pedidos (${pedidos.length})</div>
          ${
            pedidos.length === 0
              ? '<div class="no-data">No se encontraron pedidos en el período seleccionado</div>'
              : `<table>
              <thead>
                <tr>
                  ${columnasPedidos
                    .map((col) => `<th>${col.label}</th>`)
                    .join('')}
                </tr>
              </thead>
              <tbody>
                ${pedidos
                  .map(
                    (pedido) => `
                  <tr>
                    ${columnasPedidos
                      .map((col) => `<td>${pedido[col.key] || '-'}</td>`)
                      .join('')}
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>`
          }
        </body>
      </html>
    `

    // Abrir ventana nueva con el contenido para imprimir/guardar como PDF
    const ventana = window.open('', '_blank')
    ventana.document.write(contenidoHTML)
    ventana.document.close()

    // Esperar un momento para que se cargue el contenido antes de imprimir
    setTimeout(() => {
      ventana.focus()
      ventana.print()
    }, 500)
  }

  const limpiarInforme = () => {
    setMostrandoInforme(false)
    setDatosInforme(null)
    setError(null)
  }

  const obtenerEstadisticasGenerales = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')

      const response = await fetch(
        'http://localhost:5000/api/informes/estadisticas',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al obtener estadísticas')
      }

      const data = await response.json()
      alert(`
        📊 ESTADÍSTICAS GENERALES
        
        📋 Reservas:
        • Total: ${data.estadisticas.totalReservas}
        • Por estado: ${JSON.stringify(
          data.estadisticas.reservasPorEstado,
          null,
          2
        )}
        
        🛍️ Pedidos:
        • Total: ${data.estadisticas.totalPedidos}
        • Por tipo: ${JSON.stringify(data.estadisticas.pedidosPorTipo, null, 2)}
      `)
    } catch (err) {
      console.error('Error al obtener estadísticas:', err)
      setError(`No se pudieron obtener las estadísticas: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#007bff', marginBottom: '2rem' }}>
        📊 Generador de Informes
      </h2>

      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            📅 Fecha de Inicio:
            <input
              type='date'
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                marginLeft: '0.5rem',
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
              }}
            />
          </label>

          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            📅 Fecha de Fin:
            <input
              type='date'
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{
                marginLeft: '0.5rem',
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
              }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={generarInforme}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {loading ? '⏳ Generando...' : '📊 Generar Informe'}
          </button>

          <button
            onClick={obtenerEstadisticasGenerales}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            📈 Estadísticas Generales
          </button>

          {mostrandoInforme && (
            <>
              <button
                onClick={generarPDF}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                📄 Descargar PDF
              </button>

              <button
                onClick={limpiarInforme}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                🗑️ Limpiar
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            color: '#721c24',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
          }}
        >
          ❌ {error}
        </div>
      )}

      {mostrandoInforme && datosInforme && (
        <div>
          <div
            style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ color: '#155724', margin: '0 0 1rem 0' }}>
              📊 Informe Generado Exitosamente
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <strong>📅 Período:</strong> {fechaInicio} hasta {fechaFin}
              </div>
              <div>
                <strong>📋 Total Reservas:</strong>{' '}
                {datosInforme.estadisticas.totalReservas}
              </div>
              <div>
                <strong>🛍️ Total Pedidos:</strong>{' '}
                {datosInforme.estadisticas.totalPedidos}
              </div>
              <div>
                <strong>👥 Total Huéspedes:</strong>{' '}
                {datosInforme.estadisticas.totalHuespedes}
              </div>
            </div>
          </div>

          {/* Sección de Reservas */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#007bff' }}>
              📋 Reservas ({datosInforme.reservas.length})
            </h3>
            {datosInforme.reservas.length === 0 ? (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                No se encontraron reservas para el período seleccionado
              </p>
            ) : (
              <UserTable
                columns={columnasReservas.map((col) => col.key)}
                data={datosInforme.reservas}
              />
            )}
          </div>

          {/* Sección de Pedidos */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#007bff' }}>
              🛍️ Pedidos ({datosInforme.pedidos.length})
            </h3>
            {datosInforme.pedidos.length === 0 ? (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                No se encontraron pedidos para el período seleccionado
              </p>
            ) : (
              <UserTable
                columns={columnasPedidos.map((col) => col.key)}
                data={datosInforme.pedidos}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Informes
