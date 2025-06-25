// src/context/AuthContext.jsx
import axios from 'axios'
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/users/login',
        {
          username,
          password,
        }
      )

      const { token, user } = response.data

      // Guarda usuario y token
      setUser(user)
      localStorage.setItem('token', token)

      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/user')
      }
    } catch (err) {
      // Axios maneja errores dentro de response.response
      const message = err.response?.data?.error || 'Login fallido'
      alert(message)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
