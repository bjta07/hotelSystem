import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.model.js'

const register = async (req, res) => {
  try {
    const { name, username, password, email, phone, role, isActive } = req.body

    if (!name || !username || !password || !email || !phone || !role) {
      return res.status(400).json({
        ok: false,
        msg: 'Missing required fields: name, username, password, email, phone, role',
      })
    }

    // Verificar si el email ya existe
    const existingEmail = await UserModel.findOneByEmail(email)
    if (existingEmail) {
      return res.status(409).json({ ok: false, msg: 'Email already exists' })
    }

    // Verificar si el username ya existe
    const existingUsername = await UserModel.findOneByUsername(username)
    if (existingUsername) {
      return res.status(409).json({ ok: false, msg: 'Username already exists' })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    const newUser = await UserModel.create({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
      role,
      isActive: isActive !== undefined ? isActive : true, // Por defecto activo
    })

    const token = jwt.sign(
      {
        uid: newUser.uid,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    )

    return res.status(201).json({
      ok: true,
      msg: {
        token,
        user: {
          uid: newUser.uid,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          isActive: newUser.isActive,
        },
      },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      ok: false,
      msg: 'Error server',
    })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: username, password' })
    }

    const user = await UserModel.findOneByUsername(username)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({ error: 'User account is inactive' })
    }

    const isMatch = await bcryptjs.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      {
        uid: user.uid,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    )

    return res.json({
      token,
      user: {
        uid: user.uid,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      ok: false,
      msg: 'Error server',
    })
  }
}

const profile = async (req, res) => {
  try {
    const user = await UserModel.findOneByUsername(req.username)
    if (!user) {
      return res.status(404).json({ ok: false, msg: 'User not found' })
    }

    return res.json({
      ok: true,
      data: {
        // <-- Cambiar 'msg' por 'data'
        uid: user.uid,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      ok: false,
      msg: 'Error server',
    })
  }
}
// Ruta protegida - Solo ADMIN y no puede cambiar su propio rol
const updateRole = async (req, res) => {
  try {
    console.log('🔄 Iniciando updateRole')
    console.log('👤 req.role:', req.role)
    console.log('🆔 req.uid:', req.uid)
    console.log('📝 req.params:', req.params)
    console.log('📦 req.body:', req.body)

    // Verificar que el usuario sea admin (ya verificado por middleware)
    const { uid } = req.params
    const { role } = req.body

    // Validar que se proporcione un rol válido
    if (!role || (role !== 'admin' && role !== 'user')) {
      return res.status(400).json({
        ok: false,
        msg: 'Valid role is required (1 for admin, 2 for user)',
      })
    }

    // Verificar que no sea el mismo usuario intentando cambiar su propio rol
    if (req.uid === uid) {
      return res.status(403).json({
        ok: false,
        msg: 'You cannot change your own role',
      })
    }

    // Buscar el usuario
    const user = await UserModel.findOneByUid(uid)
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: 'User not found',
      })
    }

    console.log('👤 Usuario encontrado:', user.name)
    console.log('🔄 Cambiando rol de', user.role, 'a', role)

    // Actualizar el rol
    const updatedUser = await UserModel.updateRole(uid, role)
    const action = role === 'admin' ? 'promoted to admin' : 'demoted to user'

    console.log('✅ Rol actualizado exitosamente')

    return res.json({
      ok: true,
      data: updatedUser,
      msg: `User ${action} successfully`,
    })
  } catch (error) {
    console.error('❌ Error en updateRole:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
    })
  }
}

const toggleUserStatus = async (req, res) => {
  try {
    console.log('🔄 Iniciando toggleUserStatus')
    console.log('👤 req.role:', req.role)
    console.log('🆔 req.uid:', req.uid)
    console.log('📝 req.params:', req.params)

    const { uid } = req.params

    // Verificar que no sea el mismo usuario intentando cambiar su propio estado
    if (req.uid === uid) {
      return res.status(403).json({
        ok: false,
        msg: 'You cannot change your own status',
      })
    }

    // Buscar el usuario
    const user = await UserModel.findOneByUid(uid)
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: 'User not found',
      })
    }

    console.log('👤 Usuario encontrado:', user.name)
    console.log('🔄 Estado actual:', user.isActive ? 'Activo' : 'Inactivo')

    // Cambiar el estado
    const updatedUser = await UserModel.toggleStatus(uid)

    console.log('✅ Estado cambiado exitosamente')
    console.log(
      '🔄 Nuevo estado:',
      updatedUser.isActive ? 'Activo' : 'Inactivo'
    )

    return res.json({
      ok: true,
      data: updatedUser,
      msg: `User ${
        updatedUser.isActive ? 'activated' : 'deactivated'
      } successfully`,
    })
  } catch (error) {
    console.error('❌ Error en toggleUserStatus:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    console.log('🗑️ Iniciando deleteUser')
    console.log('👤 req.role:', req.role)
    console.log('🆔 req.uid:', req.uid)
    console.log('📝 req.params:', req.params)

    const { uid } = req.params

    // Verificar que no sea el mismo usuario intentando eliminarse
    if (req.uid === uid) {
      return res.status(403).json({
        ok: false,
        msg: 'You cannot delete your own account',
      })
    }

    // Buscar el usuario
    const user = await UserModel.findOneByUid(uid)
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: 'User not found',
      })
    }

    console.log('👤 Usuario a eliminar:', user.name)

    // Eliminar el usuario
    const deletedUser = await UserModel.deleteUser(uid)

    console.log('✅ Usuario eliminado exitosamente')

    return res.json({
      ok: true,
      data: { uid: uid, name: deletedUser.name },
      msg: 'User deleted successfully',
    })
  } catch (error) {
    console.error('❌ Error en deleteUser:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
    })
  }
}

// También corrige la función findAll para que use la nueva estructura
const findAll = async (req, res) => {
  try {
    console.log('📋 Obteniendo todos los usuarios')
    console.log('👤 req.role:', req.role)
    console.log('🆔 req.uid:', req.uid)

    const users = await UserModel.findAll()

    console.log('✅ Usuarios obtenidos:', users.length)

    return res.json({
      ok: true,
      data: users, // CORRECCIÓN: usar 'data' en lugar de 'msg'
      msg: 'Users retrieved successfully',
    })
  } catch (error) {
    console.error('❌ Error en findAll:', error)
    return res.status(500).json({
      ok: false,
      msg: 'Server error',
    })
  }
}

export const UserController = {
  register,
  login,
  profile,
  findAll,
  updateRole,
  toggleUserStatus,
  deleteUser,
}
