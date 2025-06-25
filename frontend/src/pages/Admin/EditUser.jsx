import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const EditUser = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  // Obtener usuarios al cargar el componente
  useEffect(() => {
    obtenerUsuarios()
  }, [])

  const obtenerUsuarios = async () => {
    try {
      setLoading(true)
      setError('') // Limpiar errores previos
      const token = localStorage.getItem('token')

      const response = await fetch('http://localhost:3000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudieron obtener los usuarios`
        )
      }

      const data = await response.json()
      console.log('✅ Datos obtenidos:', data)

      // CORRECCIÓN: Acceder a data.data según tu nueva estructura
      if (data.ok && Array.isArray(data.data)) {
        setUsuarios(data.data)
      } else {
        throw new Error('La respuesta no contiene un array válido de usuarios')
      }
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const cambiarRol = async (uid, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin'
      const accion = currentRole === 'admin' ? 'degradar' : 'ascender'
      const token = localStorage.getItem('token')

      if (!window.confirm(`¿Estás seguro de ${accion} a este usuario?`)) {
        return
      }

      console.log('Cambiando rol:', {
        uid,
        currentRole,
        newRole,
        accion,
        token: token ? 'existe' : 'no existe',
      })

      const response = await fetch(
        `http://localhost:3000/api/users/${uid}/role`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      )

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(
          `Error ${response.status}: ${errorData.msg || 'Error desconocido'}`
        )
      }

      const data = await response.json()
      console.log('Success data:', data)

      // Actualizar el usuario en el estado local
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      )

      alert(
        `Usuario ${
          accion === 'ascender' ? 'ascendido' : 'degradado'
        } correctamente`
      )
    } catch (err) {
      alert('Error al cambiar rol: ' + err.message)
      console.error('Error completo:', err)
    }
  }

  const eliminarUsuario = async (uid) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')

      console.log('Eliminando usuario:', {
        uid,
        token: token ? 'existe' : 'no existe',
      })

      // CORRECCIÓN: Usar el mismo puerto (3000)
      const response = await fetch(`http://localhost:3000/api/users/${uid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Delete error response:', errorData)
        throw new Error(
          `Error ${response.status}: ${errorData.msg || 'Error desconocido'}`
        )
      }

      // CORRECCIÓN: Filtrar por uid, no por id
      setUsuarios((prevUsuarios) => prevUsuarios.filter((u) => u.uid !== uid))
      alert('Usuario eliminado correctamente')
    } catch (err) {
      alert('Error al eliminar usuario: ' + err.message)
      console.error('Error completo:', err)
    }
  }

  const toggleUserStatus = async (uid) => {
    try {
      const token = localStorage.getItem('token')

      console.log('Cambiando estado usuario:', {
        uid,
        token: token ? 'existe' : 'no existe',
      })

      const response = await fetch(
        `http://localhost:3000/api/users/${uid}/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Error ${response.status}: ${errorData.msg || 'Error desconocido'}`
        )
      }

      const data = await response.json()
      console.log('Toggle status success:', data)

      // Actualizar el estado del usuario localmente
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((u) =>
          u.uid === uid ? { ...u, isActive: data.data.isActive } : u
        )
      )

      alert(
        `Usuario ${
          data.data.isActive ? 'activado' : 'desactivado'
        } correctamente`
      )
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message)
      console.error('Error completo:', err)
    }
  }

  const getRoleName = (role) => {
    return role === 'admin' ? 'Admin' : 'User'
  }

  const getRoleColor = (role) => {
    return role === 'admin' ? '#28a745' : '#007bff'
  }

  const getRoleAction = (role) => {
    return role === 'admin' ? 'Degradar' : 'Ascender'
  }

  const getRoleActionColor = (role) => {
    return role === 'admin' ? '#fd7e14' : '#28a745' // Naranja para degradar, verde para ascender
  }

  if (loading) {
    return <div>Cargando usuarios...</div>
  }

  if (error) {
    return (
      <div>
        <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>
        <button onClick={obtenerUsuarios}>Reintentar</button>
      </div>
    )
  }

  return (
    <div>
      <h2>Editar Usuarios</h2>
      <button
        onClick={obtenerUsuarios}
        style={{
          marginBottom: '1rem',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Actualizar Lista
      </button>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>UID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nombre</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Usuario
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rol</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Estado</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.uid}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {usuario.uid}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {usuario.name}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {usuario.username}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {usuario.email}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  color: getRoleColor(usuario.role),
                  fontWeight: 'bold',
                }}
              >
                {getRoleName(usuario.role)}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <span
                  style={{
                    color: usuario.isActive ? '#28a745' : '#dc3545',
                    fontWeight: 'bold',
                  }}
                >
                  {usuario.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {/* Evitar que el admin se modifique a sí mismo */}
                {usuario.uid !== user?.uid && (
                  <>
                    <button
                      onClick={() => cambiarRol(usuario.uid, usuario.role)}
                      style={{
                        marginRight: '8px',
                        padding: '4px 8px',
                        backgroundColor: getRoleActionColor(usuario.role),
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {getRoleAction(usuario.role)}
                    </button>
                    <button
                      onClick={() => toggleUserStatus(usuario.uid)}
                      style={{
                        marginRight: '8px',
                        padding: '4px 8px',
                        backgroundColor: usuario.isActive
                          ? '#dc3545'
                          : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {usuario.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => eliminarUsuario(usuario.uid)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {usuario.uid === user?.uid && (
                  <span style={{ fontStyle: 'italic', color: '#666' }}>
                    (Tu usuario)
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {usuarios.length === 0 && <p>No hay usuarios para mostrar.</p>}
    </div>
  )
}

export default EditUser
