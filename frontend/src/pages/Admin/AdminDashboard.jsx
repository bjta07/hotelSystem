import React, { useEffect, useState } from 'react'
import axios from 'axios'

const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const token = localStorage.getItem('token')

        // Verificar token antes de hacer la petición
        if (!token) {
          setError('No hay token de autenticación')
          setLoading(false)
          return
        }

        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // CORRECCIÓN: Los usuarios están en response.data.msg, no en response.data
        if (response.data.ok && Array.isArray(response.data.data)) {
          setUsuarios(response.data.data)
        } else {
          setError('La respuesta no contiene un array válido de usuarios')
        }
      } catch (err) {
        console.error('Error completo:', err)
        if (err.response?.status === 403) {
          setError('Acceso denegado. Se requiere rol de administrador.')
        } else if (err.response?.status === 401) {
          setError('Token inválido o expirado')
        } else {
          setError('Error al obtener usuarios')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  if (loading) return <p>Cargando usuarios...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      {usuarios.length === 0 ? (
        <p>No se encontraron usuarios</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.uid}>
                <td>{user.uid}</td>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>
                <td>{user.is_active ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminDashboard
