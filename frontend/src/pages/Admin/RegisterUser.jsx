import React, { useState } from 'react'

const RegisterUser = () => {
  const [form, setForm] = useState({
    nombre: '',
    usuario: '',
    password: '',
    email: '',
    telefono: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Registrar usuario:', form)
  }

  return (
    <div>
      <h2>Registrar Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        <input
          name='nombre'
          placeholder='Nombre'
          onChange={handleChange}
        />
        <input
          name='usuario'
          placeholder='Usuario'
          onChange={handleChange}
        />
        <input
          name='password'
          placeholder='Contraseña'
          type='password'
          onChange={handleChange}
        />
        <input
          name='email'
          placeholder='Email'
          onChange={handleChange}
        />
        <input
          name='telefono'
          placeholder='Teléfono'
          onChange={handleChange}
        />
        <button type='submit'>Registrar</button>
      </form>
    </div>
  )
}

export default RegisterUser
