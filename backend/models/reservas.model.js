import { mongoose } from '../database/connection.database.js'

const reservaSchema = new mongoose.Schema({
  fecha: { type: String, required: true },
  nombre: { type: String, required: true },
  numeroHuespedes: { type: Number, required: true },
  diasEstadia: { type: Number, required: true },
  estado: {
    type: String,
    default: 'pendiente',
    enum: ['pendiente', 'confirmado', 'No Show'],
  },
  origen: {
    type: String,
    default: 'web',
    enum: ['manual', 'whatsapp-bot', 'web'],
  },
  creadaEn: {
    type: Date,
    default: Date.now,
    get: (value) => {
      if (!value) return null
      return value.toISOString().split('T')[0] // Devuelve solo la fecha
    },
  },
})
reservaSchema.set('toJSON', { getters: true })

export default mongoose.model('Reserva', reservaSchema)
