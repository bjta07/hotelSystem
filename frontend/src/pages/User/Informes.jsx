import React, { useState } from 'react'
import UserTable from '../../components/UserTable'

const Informes = () => {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [tipoInforme, setTipoInforme] = useState('reservas')
  const [datosInforme, setDatosInforme] = useState([])
  const [mostrandoInforme, setMostrandoInforme] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Columnas para reservas
  const columnasReservas = [
    'nombre',
    'fecha',
    'numerohuespedes',
    'diasestadia',
    'estado',
    'origen',
  ]

  // Columnas para pedidos
  const columnasPedidos = [
    'tipopedido',
    'detalleproducto',
    'numerohabitacion',
    'cantidad',
    'estado',
  ]

  const generarInforme = async () => {
    if (!desde || !hasta) {
      alert('Por favor selecciona las fechas desde y hasta')
      return
    }

    if (new Date(desde) > new Date(hasta)) {
      alert('La fecha "desde" no puede ser mayor que la fecha "hasta"')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const endpoint = tipoInforme === 'reservas' ? 'reservas' : 'pedidos'

      const response = await fetch(
        `http://localhost:5000/api/informes/${endpoint}?desde=${desde}&hasta=${hasta}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Error al obtener el informe de ${tipoInforme}`)
      }

      const data = await response.json()

      // Formatear datos según el tipo de informe
      let datosFormateados
      if (tipoInforme === 'reservas') {
        datosFormateados = data.map((item) => ({
          ...item,
          numerohuespedes: item.numeroHuespedes,
          diasestadia: item.diasEstadia,
        }))
      } else {
        datosFormateados = data.map((item) => ({
          ...item,
          tipopedido: item.tipoPedido,
          detalleproducto: item.detalleProducto,
          numerohabitacion: item.numeroHabitacion,
        }))
      }

      setDatosInforme(datosFormateados)
      setMostrandoInforme(true)
    } catch (err) {
      console.error('Error al generar informe:', err)
      setError(`No se pudo generar el informe: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const descargarPDF = async () => {
    if (!mostrandoInforme || datosInforme.length === 0) {
      alert('Primero debes generar un informe')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const endpoint = tipoInforme === 'reservas' ? 'reservas' : 'pedidos'

      const response = await fetch(
        `http://localhost:5000/api/informes/${endpoint}/pdf?desde=${desde}&hasta=${hasta}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ datos: datosInforme }),
        }
      )

      if (!response.ok) {
        throw new Error('Error al generar el PDF')
      }

      // Crear blob del PDF y descargarlo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `informe_${tipoInforme}_${desde}_${hasta}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      alert('PDF descargado exitosamente')
    } catch (err) {
      console.error('Error al descargar PDF:', err)
      alert('Error al descargar el PDF')
    }
  }

  // Función alternativa para generar PDF en el frontend (si no tienes backend para PDF)
  const generarPDFLocal = () => {
    if (!mostrandoInforme || datosInforme.length === 0) {
      alert('Primero debes generar un informe')
      return
    }

    // Crear contenido HTML para el PDF
    const contenidoHTML = `
      <html>
        <head>
          <title>Informe de ${
            tipoInforme.charAt(0).toUpperCase() + tipoInforme.slice(1)
          }</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Informe de ${
            tipoInforme.charAt(0).toUpperCase() + tipoInforme.slice(1)
          }</h1>
          <div class="info">
            <p><strong>Período:</strong> ${desde} hasta ${hasta}</p>
            <p><strong>Total de registros:</strong> ${datosInforme.length}</p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString(
              'es-ES'
            )}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${(tipoInforme === 'reservas'
                  ? columnasReservas
                  : columnasPedidos
                )
                  .map(
                    (col) =>
                      `<th>${col.charAt(0).toUpperCase() + col.slice(1)}</th>`
                  )
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${datosInforme
                .map(
                  (item) => `
                <tr>
                  ${(tipoInforme === 'reservas'
                    ? columnasReservas
                    : columnasPedidos
                  )
                    .map((col) => `<td>${item[col] || ''}</td>`)
                    .join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Abrir ventana nueva con el contenido para imprimir/guardar como PDF
    const ventana = window.open('', '_blank')
    ventana.document.write(contenidoHTML)
    ventana.document.close()
    ventana.print()
  }

  const limpiarInforme = () => {
    setMostrandoInforme(false)
    setDatosInforme([])
    setError(null)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Generador de Informes</h2>

      <div
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '1rem' }}>
            Tipo de Informe:
            <select
              value={tipoInforme}
              onChange={(e) => setTipoInforme(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
            >
              <option value='reservas'>Reservas</option>
              <option value='pedidos'>Pedidos</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ marginRight: '1rem' }}>
            Desde:
            <input
              type='date'
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
            />
          </label>

          <label style={{ marginRight: '1rem' }}>
            Hasta:
            <input
              type='date'
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
            />
          </label>
        </div>

        <div>
          <button
            onClick={generarInforme}
            disabled={loading}
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generando...' : 'Generar Informe'}
          </button>

          {mostrandoInforme && (
            <>
              <button
                onClick={descargarPDF}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Descargar PDF (Backend)
              </button>

              <button
                onClick={generarPDFLocal}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Imprimir/PDF (Local)
              </button>

              <button
                onClick={limpiarInforme}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Limpiar
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {mostrandoInforme && (
        <div>
          <h3>
            Informe de{' '}
            {tipoInforme.charAt(0).toUpperCase() + tipoInforme.slice(1)}
          </h3>
          <p>
            <strong>Período:</strong> {desde} hasta {hasta}
          </p>
          <p>
            <strong>Total de registros:</strong> {datosInforme.length}
          </p>

          {datosInforme.length === 0 ? (
            <p>No se encontraron datos para el período seleccionado</p>
          ) : (
            <UserTable
              columns={
                tipoInforme === 'reservas' ? columnasReservas : columnasPedidos
              }
              data={datosInforme}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Informes
