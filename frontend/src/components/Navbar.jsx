// src/components/Navbar.jsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  const isAdmin = user.role === 'admin'
  const isUser = user.role === 'user'

  return (
    <nav
      style={{
        width: '220px',
        height: '100vh',
        background: '#f0f0f0',
        padding: '1rem',
        boxSizing: 'border-box',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <h3>Panel</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
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
            style={{
              marginTop: '1rem',
              padding: '6px 12px',
              background: '#c00',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
