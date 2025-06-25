import { db } from '../database/connection.database.js'

const create = async ({
  name,
  username,
  email,
  password,
  phone,
  role,
  isActive,
}) => {
  const query = {
    text: `
        INSERT INTO users (name, username, email, password, phone, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING uid, name, username, email, phone, role, is_active as "isActive"`,
    values: [name, username, email, password, phone, role, isActive],
  }

  const { rows } = await db.query(query)
  return rows[0]
}

const findOneByEmail = async (email) => {
  const query = {
    text: `
        SELECT uid, name, username, email, password, phone, role, is_active as "isActive"
        FROM users
        WHERE email = $1`,
    values: [email],
  }
  const { rows } = await db.query(query)
  return rows[0]
}

const findOneByUsername = async (username) => {
  const query = {
    text: `
        SELECT uid, name, username, email, password, phone, role, is_active as "isActive"
        FROM users
        WHERE username = $1`,
    values: [username],
  }
  const { rows } = await db.query(query)
  return rows[0]
}

const findAll = async () => {
  const query = {
    text: `
        SELECT uid, name, username, email, phone, role, is_active as "isActive", created_at, updated_at
        FROM users
        ORDER BY created_at DESC`,
  }
  const { rows } = await db.query(query)
  return rows
}

const findOneByUid = async (uid) => {
  const query = {
    text: `
        SELECT uid, name, username, email, password, phone, role, is_active as "isActive", created_at, updated_at
        FROM users
        WHERE uid = $1`,
    values: [uid],
  }
  const { rows } = await db.query(query)
  return rows[0]
}

const updateRole = async (uid, role) => {
  const query = {
    text: `
        UPDATE users
        SET role = $2, updated_at = CURRENT_TIMESTAMP
        WHERE uid = $1
        RETURNING uid, name, username, email, phone, role, is_active as "isActive", updated_at`,
    values: [uid, role],
  }
  const { rows } = await db.query(query)
  return rows[0]
}

const toggleStatus = async (uid) => {
  const query = {
    text: `
        UPDATE users
        SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
        WHERE uid = $1
        RETURNING uid, name, username, email, phone, role, is_active as "isActive", updated_at`,
    values: [uid],
  }
  const { rows } = await db.query(query)
  return rows[0]
}

// NUEVA FUNCIÓN: Eliminar usuario
const deleteUser = async (uid) => {
  const query = {
    text: `
        DELETE FROM users
        WHERE uid = $1
        RETURNING uid, name, username, email`,
    values: [uid],
  }
  const { rows } = await db.query(query)
  return rows[0]
}

const updateProfile = async (uid, { name, email, phone }) => {
  const query = {
    text: `
        UPDATE users
        SET name = $2, email = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
        WHERE uid = $1
        RETURNING uid, name, username, email, phone, role, is_active as "isActive", updated_at`,
    values: [uid, name, email, phone],
  }
  const { rows } = await db.query(query)
  return rows[0]
}

const updatePassword = async (uid, hashedPassword) => {
  const query = {
    text: `
        UPDATE users
        SET password = $2, updated_at = CURRENT_TIMESTAMP
        WHERE uid = $1
        RETURNING uid, name, username, email`,
    values: [uid, hashedPassword],
  }
  const { rows } = await db.query(query)
  return rows[0]
}

// Función para verificar si un username ya existe (excluyendo un uid específico)
const checkUsernameExists = async (username, excludeUid = null) => {
  let query
  if (excludeUid) {
    query = {
      text: `
          SELECT uid FROM users
          WHERE username = $1 AND uid != $2`,
      values: [username, excludeUid],
    }
  } else {
    query = {
      text: `
          SELECT uid FROM users
          WHERE username = $1`,
      values: [username],
    }
  }
  const { rows } = await db.query(query)
  return rows.length > 0
}

// Función para verificar si un email ya existe (excluyendo un uid específico)
const checkEmailExists = async (email, excludeUid = null) => {
  let query
  if (excludeUid) {
    query = {
      text: `
          SELECT uid FROM users
          WHERE email = $1 AND uid != $2`,
      values: [email, excludeUid],
    }
  } else {
    query = {
      text: `
          SELECT uid FROM users
          WHERE email = $1`,
      values: [email],
    }
  }
  const { rows } = await db.query(query)
  return rows.length > 0
}

export const UserModel = {
  create,
  findOneByEmail,
  findOneByUsername,
  findAll,
  findOneByUid,
  updateRole,
  toggleStatus,
  deleteUser, // AGREGADA
  updateProfile,
  updatePassword,
  checkUsernameExists,
  checkEmailExists,
}
