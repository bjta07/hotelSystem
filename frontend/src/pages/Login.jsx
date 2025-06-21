import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(form.username, form.password)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          name='username'
          placeholder='Usuario'
          value={form.username}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
        />
        <input
          type='password'
          name='password'
          placeholder='Contraseña'
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
        />
        <button
          type='submit'
          style={{ padding: '10px 20px' }}
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}

export default Login
