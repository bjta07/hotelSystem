// src/components/ProtectedRoute.jsx
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isLoading } = useAuth()

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return (
      <Navigate
        to='/login'
        replace
      />
    )
  }

  // Si se requiere un rol específico, verificarlo
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Navigate
        to='/unauthorized'
        replace
      />
    )
  }
  return children
}

export default ProtectedRoute
