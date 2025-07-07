import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../../styles/dashboard.css'
const UserDashboard = () => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsuarioActual = async () => {
      try {
        const token = localStorage.getItem('token')

        // Verificar token antes de hacer la petición
        if (!token) {
          setError('No hay token de autenticación')
          setLoading(false)
          return
        }

        // Obtener información del usuario actual
        const response = await axios.get(
          'http://localhost:5000/api/users/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.data.ok) {
          setUsuario(response.data.data)
        } else {
          setError('No se pudo obtener la información del usuario')
        }
      } catch (err) {
        console.error('Error completo:', err)
        if (err.response?.status === 403) {
          setError('Acceso denegado.')
        } else if (err.response?.status === 401) {
          setError('Token inválido o expirado')
        } else {
          setError('Error al obtener información del usuario')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarioActual()
  }, [])

  if (loading) return <p>Cargando...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div className='dashboardContainer'>
      <h1>Panel de Administración - Recepcionistas</h1>

      {usuario && (
        <div className='dashboardCard'>
          <div className='userAvatar'>
            {usuario.name ? usuario.name.charAt(0).toUpperCase() : '?'}
          </div>

          <div className='userInfo'>
            <h2>¡Bienvenido, {usuario.name}!</h2>
            <div>
              <strong>ID:</strong>
              <span>{usuario.uid}</span>
            </div>

            <div className='userData'>
              <strong>Nombre completo:</strong>
              <span>{usuario.name}</span>
            </div>

            <div className='userData'>
              <strong>Usuario:</strong>
              <span>{usuario.email}</span>
            </div>

            <div className='rol'>
              <strong>Rol:</strong>
              <span
                className={`role-badge ${
                  usuario.role === 'admin'
                    ? 'role-badge--admin'
                    : 'role-badge--user'
                }`}
              >
                {usuario.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
