import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  let token = req.headers.authorization

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'Token not provided',
    })
  }

  // Extraer el token del header "Bearer <token>"
  token = token.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'Token format invalid',
    })
  }

  try {
    const { uid, email, username, role } = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    // Asignar los datos del token al request
    req.uid = uid
    req.email = email
    req.username = username
    req.role = role

    next()
  } catch (error) {
    console.log('JWT Error:', error.message)

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        error: 'Token expired',
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        ok: false,
        error: 'Invalid token',
      })
    }

    return res.status(401).json({
      ok: false,
      error: 'Token verification failed',
    })
  }
}

export const verifyAdmin = (req, res, next) => {
  // Verificar que el token haya sido validado primero
  if (!req.role) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required',
    })
  }

  if (req.role === 'admin') {
    return next()
  }

  return res.status(403).json({
    ok: false,
    error: 'Access denied. Admin role required.',
  })
}

export const verifyUserOrAdmin = (req, res, next) => {
  // Verificar que el token haya sido validado primero
  if (!req.role) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required',
    })
  }

  if (req.role === 'user' || req.role === 'admin') {
    return next()
  }

  return res.status(403).json({
    ok: false,
    error: 'Access denied. User or Admin role required.',
  })
}

export const verifyUser = (req, res, next) => {
  // Verificar que el token haya sido validado primero
  if (!req.role) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required',
    })
  }

  // Cualquier usuario autenticado puede acceder
  if (req.role === 'user' || req.role === 'vet' || req.role === 'admin') {
    return next()
  }

  return res.status(403).json({
    ok: false,
    error: 'Access denied. Valid user role required.',
  })
}

export const verifyOwner = (req, res, next) => {
  // Verificar que el token haya sido validado primero
  if (!req.uid) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required',
    })
  }

  // Obtener el uid del parámetro de la URL
  const { uid } = req.params

  // Verificar que sea el mismo usuario o un admin
  if (req.uid === uid || req.role === 'admin') {
    return next()
  }

  return res.status(403).json({
    ok: false,
    error: 'Access denied. You can only access your own resources.',
  })
}

// Middleware para verificar si el usuario está activo
export const verifyActiveUser = async (req, res, next) => {
  try {
    // Este middleware debe usarse después de verifyToken
    if (!req.email) {
      return res.status(401).json({
        ok: false,
        error: 'Authentication required',
      })
    }

    // Importar el modelo aquí para evitar dependencias circulares
    const { UserModel } = await import('../models/user.model.js')

    const user = await UserModel.findOneByUsername(req.username)

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: 'User not found',
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        ok: false,
        error: 'User account is inactive',
      })
    }

    next()
  } catch (error) {
    console.log('Active user verification error:', error)
    return res.status(500).json({
      ok: false,
      error: 'Server error during user verification',
    })
  }
}

// Middleware combinado para verificar token y usuario activo
export const verifyActiveToken = [verifyToken, verifyActiveUser]

// Middleware combinado para verificar token, usuario activo y rol admin
export const verifyActiveAdmin = [verifyToken, verifyActiveUser, verifyAdmin]

// Middleware combinado para verificar token, usuario activo y rol user o admin
export const verifyActiveUserOrAdmin = [
  verifyToken,
  verifyActiveUser,
  verifyUserOrAdmin,
]
