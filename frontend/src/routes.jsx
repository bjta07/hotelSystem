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
import AdminLayout from './layout/AdminLayout'
import UserLayout from './layout/UserLayout'

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path='/login'
        element={<Login />}
      />

      {/* ADMIN ROUTES */}
      <Route
        path='/admin'
        element={
          <ProtectedRoute role={1}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<AdminDashboard />}
        />
        <Route
          path='register'
          element={<RegisterUser />}
        />
        <Route
          path='edit'
          element={<EditUser />}
        />
      </Route>

      {/* USER ROUTES */}
      <Route
        path='/user'
        element={
          <ProtectedRoute role={2}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<UserDashboard />}
        />
        <Route
          path='reservas'
          element={<Reservas />}
        />
        <Route
          path='pedidos'
          element={<Pedidos />}
        />
        <Route
          path='informes'
          element={<Informes />}
        />
      </Route>
    </Routes>
  )
}

export default AppRoutes
