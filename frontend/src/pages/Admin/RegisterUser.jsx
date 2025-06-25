import React, { useState } from 'react'
import axios from 'axios'

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
  })
  const [modal, setModal] = useState({
    open: false,
    message: '',
    success: false,
  })
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const token = localStorage.getItem('token')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        'http://localhost:3000/api/users/register',
        {
          ...formData,
          role: 'user', // forzado por defecto
          isActive: false, // forzado para estar desactivado
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data.ok) {
        setMessage('Usuario registrado con éxito')
        setFormData({
          name: '',
          username: '',
          email: '',
          password: '',
          phone: '',
        })
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.msg || 'Error en el registro')
      } else {
        setMessage('Error de conexión con el servidor')
      }
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Registrar Usuario</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          name='name'
          placeholder='Nombre completo'
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type='text'
          name='username'
          placeholder='Nombre de usuario'
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type='email'
          name='email'
          placeholder='Correo electrónico'
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type='password'
          name='password'
          placeholder='Contraseña'
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type='tel'
          name='phone'
          placeholder='Teléfono'
          value={formData.phone}
          onChange={handleChange}
        />
        <button type='submit'>Registrar</button>
      </form>
    </div>
  )
}

export default RegisterUser
