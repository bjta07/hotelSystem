import React from 'react'
import UserTable from '../../components/UserTable'

const Pedidos = () => {
  const pedidos = [
    {
      fechapedido: '2025-06-10',
      descripcion: 'Toalla extra',
      cantidad: '2',
    },
  ]

  const handleReservar = (pedido) => {
    console.log('Realizar pedido:', pedido)
  }

  const handleCancelar = (pedido) => {
    console.log('Cancelar pedido:', pedido)
  }

  const actions = [
    { label: 'Reservar', onClick: handleReservar },
    { label: 'Cancelar', onClick: handleCancelar },
  ]

  return (
    <div>
      <h2>Pedidos a la Habitación</h2>
      <UserTable
        columns={['FechaPedido', 'Descripcion', 'Cantidad']}
        data={pedidos}
        actions={actions}
      />
    </div>
  )
}

export default Pedidos
