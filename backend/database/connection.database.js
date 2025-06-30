import dotenv from 'dotenv'
import pg from 'pg'
import mongoose from 'mongoose'

dotenv.config()

const { Pool } = pg

// Configuración PostgreSQL
const connectionString = process.env.DATABASE_URL
export const db = new Pool({
  allowExitOnIdle: true,
  connectionString,
})

// Configuración MongoDB
const mongoUri = process.env.MONGO_URI

// Función para conectar a PostgreSQL
const connectPostgreSQL = async () => {
  try {
    await db.query('SELECT NOW()')
    console.log('✅ PostgreSQL DATABASE connected')
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error)
  }
}

// Función para conectar a MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoUri)
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error)
  }
}

// Función para conectar ambas bases de datos
export const connectDatabases = async () => {
  await Promise.all([connectPostgreSQL(), connectMongoDB()])
}

// Conectar automáticamente al importar el módulo
await connectDatabases()

// Exportar mongoose para uso en modelos
export { mongoose }

// Manejar eventos de conexión de MongoDB
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('🔥 Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose disconnected from MongoDB')
})

// Cerrar conexiones correctamente al terminar la aplicación
process.on('SIGINT', async () => {
  console.log('\n🔄 Closing database connections...')
  await db.end()
  await mongoose.connection.close()
  console.log('✅ Database connections closed')
  process.exit(0)
})
