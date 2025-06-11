import React from 'react'
import UserTable from '../../components/UserTable'

const Reservas = () => {
  const reservas = [
    {
      fechareserva: '2025-06-10',
      fechallegada: '2025-06-15',
      fechasalida: '2025-06-18',
    },
  ]

  const handleReservar = (reserva) => {
    console.log('Reservar:', reserva)
  }

  const handleCancelar = (reserva) => {
    console.log('Cancelar:', reserva)
  }

  const actions = [
    { label: 'Reservar', onClick: handleReservar },
    { label: 'Cancelar', onClick: handleCancelar },
  ]

  return (
    <div>
      <h2>Mis Reservas</h2>
      <UserTable
        columns={['FechaReserva', 'FechaLlegada', 'FechaSalida']}
        data={reservas}
        actions={actions}
      />
    </div>
  )
}

export default Reservas
