import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = ({ username, password }) => {
    // Simular autenticación básica (más adelante se conecta al backend)
    if (username === 'admin' && password === 'admin123') {
      setUser({ username, role: 'admin' })
      return { success: true, role: 'admin' }
    } else if (username === 'user' && password === 'user123') {
      setUser({ username, role: 'user' })
      return { success: true }
    } else {
      return { success: false, message: 'Credenciales incorrectas' }
    }
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
