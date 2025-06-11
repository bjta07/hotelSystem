import React, { useState } from 'react'

const Informes = () => {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const reservas = [
    {
      id: 1,
      fechaReserva: '2025-06-10',
      fechaLlegada: '2025-06-15',
      fechaSalida: '2025-06-18',
    },
  ]

  const generarInforme = () => {
    console.log('Generar informe de:', desde, hasta)
  }

  const descargarPDF = () => {
    console.log('Descargar PDF')
  }

  return (
    <div>
      <h2>Informe de Reservas</h2>
      <div>
        <label>
          Desde:{' '}
          <input
            type='date'
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </label>
        <label>
          Hasta:{' '}
          <input
            type='date'
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </label>
        <button onClick={generarInforme}>Generar</button>
        <button onClick={descargarPDF}>Descargar PDF</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Fecha Reserva</th>
            <th>Fecha Llegada</th>
            <th>Fecha Salida</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r) => (
            <tr key={r.id}>
              <td>{r.fechaReserva}</td>
              <td>{r.fechaLlegada}</td>
              <td>{r.fechaSalida}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Informes
