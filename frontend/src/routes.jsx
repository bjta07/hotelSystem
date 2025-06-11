import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/Admin/AdminDashboard'
import RegisterUser from './pages/Admin/RegisterUser'
import EditUser from './pages/Admin/EditUser'
import UserDashboard from './pages/User/UserDashboard'
import Reservas from './pages/User/Reservas'
import Pedidos from './pages/User/Pedidos'
import Informes from './pages/User/Informes'
import ProtectedRoute from './components/ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path='/login'
        element={<Login />}
      />
      <Route
        path='/admin'
        element={
          <ProtectedRoute role='admin'>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/register'
        element={
          <ProtectedRoute role='admin'>
            <RegisterUser />
          </ProtectedRoute>
        }
      />
      <Route
        path='/admin/edit/:id'
        element={
          <ProtectedRoute role='admin'>
            <EditUser />
          </ProtectedRoute>
        }
      />
      <Route
        path='/user'
        element={
          <ProtectedRoute role='user'>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/user/reservas'
        element={
          <ProtectedRoute role='user'>
            <Reservas />
          </ProtectedRoute>
        }
      />
      <Route
        path='/user/pedidos'
        element={
          <ProtectedRoute role='user'>
            <Pedidos />
          </ProtectedRoute>
        }
      />
      <Route
        path='/user/informes'
        element={
          <ProtectedRoute role='user'>
            <Informes />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
