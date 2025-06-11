import React from 'react'

const AdminDashboard = () => {
  // Este será reemplazado luego por datos del backend
  const usuarios = [
    { id: 1, nombre: 'Juan', activo: true },
    { id: 2, nombre: 'Ana', activo: false },
  ]

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.activo ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDashboard
