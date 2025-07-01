import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  const isAdmin = user.role === 'admin'
  const isUser = user.role === 'user'

  return (
    <nav className='sidebar'>
      <div className='sidebar-header'>
        <h2>Hotel</h2>
        <span className='subtitle'>Turismo y hoteleria</span>
      </div>
      <ul
        className='sidebar-menu'
        style={{ listStyle: 'none', padding: 0 }}
      >
        {isAdmin && (
          <>
            <li>
              <Link to='/admin'>Dashboard</Link>
            </li>
            <li>
              <Link to='/admin/edit'>Editar usuarios</Link>
            </li>
            <li>
              <Link to='/admin/register'>Registrar usuario</Link>
            </li>
          </>
        )}
        {isUser && (
          <>
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
          <button
            onClick={logout}
            className='logout-btn'
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
