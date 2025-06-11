import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <nav style={{ width: '200px', height: '100vh', position: 'fixed' }}>
      <ul>
        {user.role === 'admin' && (
          <>
            <li>
              <Link to='/admin'>Dashboard Admin</Link>
            </li>
            <li>
              <Link to='/admin/register'>Registrar Usuario</Link>
            </li>
            <li>
              <Link to='/admin/edit/:id'>Editar Usuario</Link>
            </li>
          </>
        )}
        {user.role === 'user' && (
          <>
            <li>
              <Link to='/user'>Inicio Usuario</Link>
            </li>
            <li>
              <Link to='/user/reservas'>Reservas</Link>
            </li>
            <li>
              <Link to='/user/pedidos'>Pedidos</Link>
            </li>
            <li>
              <Link to='/user/informes'>Informes</Link>
            </li>
          </>
        )}
        <li>
          <button onClick={logout}>Cerrar sesión</button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
