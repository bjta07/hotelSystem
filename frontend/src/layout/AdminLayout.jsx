import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div>
      {/* Puedes añadir aquí un header específico o mensajes si deseas */}
      <Outlet />
    </div>
  )
}

export default AdminLayout
