import React from 'react'

const EditUser = () => {
  const usuarios = [
    { id: 1, nombre: 'Juan', rol: 'user' },
    { id: 2, nombre: 'Ana', rol: 'admin' },
  ]

  const cambiarRol = (id) => {
    console.log(`Cambiar rol del usuario con ID: ${id}`)
  }

  const eliminarUsuario = (id) => {
    console.log(`Eliminar usuario con ID: ${id}`)
  }
  console.log('componente EditUser montado')

  return (
    <div>
      <h2>Editar Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.rol}</td>
              <td>
                <button onClick={() => cambiarRol(user.id)}>Cambiar Rol</button>
                <button onClick={() => eliminarUsuario(user.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EditUser
