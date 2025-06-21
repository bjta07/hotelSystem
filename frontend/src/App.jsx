import { useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import AppRoutes from './Routes.jsx' // Ajusta la ruta según tu estructura

function App() {
  const { user } = useAuth()
  const location = useLocation()

  // Verifica si estamos en login o aún no hay usuario
  const hideNavbar = location.pathname === '/login' || !user

  return (
    <div style={{ display: 'flex' }}>
      {/* Mostrar el navbar solo si hay usuario autenticado */}
      {!hideNavbar && (
        <div style={{ width: '220px', flexShrink: 0 }}>
          <Navbar />
        </div>
      )}

      <div style={{ flexGrow: 1, padding: '1rem' }}>
        <AppRoutes />
      </div>
    </div>
  )
}

export default App
