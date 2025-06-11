import { useLocation } from 'react-router-dom'
import AppRoutes from './routes'
import Navbar from './components/Navbar'
import { useAuth } from './context/AuthContext'

const App = () => {
  const location = useLocation()
  const { user } = useAuth()

  // Ocultar Navbar si está en /login o no hay usuario autenticado
  const hideNavbar = location.pathname === '/login' || !user

  return (
    <div style={{ display: 'flex' }}>
      {!hideNavbar && <Navbar />}
      <div
        style={{
          flex: 1,
          padding: '1rem',
          marginLeft: !hideNavbar ? '220px' : '0',
        }}
      >
        <AppRoutes />
      </div>
    </div>
  )
}

export default App
