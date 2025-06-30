import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/login.module.css'

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
    <div className={styles.loginContainer}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          className={styles.inputLogin}
          type='text'
          name='username'
          placeholder='Usuario'
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          className={styles.inputLogin}
          type='password'
          name='password'
          placeholder='Contraseña'
          value={form.password}
          onChange={handleChange}
          required
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
