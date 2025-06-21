import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth()

  // Si no está logeado, redirige al login
  if (!user) {
    return (
      <Navigate
        to='/login'
        replace
      />
    )
  }

  // Si se especificó un rol y el usuario no lo tiene, redirige
  if (role && user.role !== role) {
    return (
      <Navigate
        to='/login'
        replace
      />
    )
  }

  // Si pasa las validaciones, muestra el contenido
  return children
}

export default ProtectedRoute
