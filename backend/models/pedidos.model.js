import { mongoose } from '../database/connection.database.js'

const pedidoSchema = new mongoose.Schema({
  tipoPedido: {
    type: String,
    required: true,
  },
  detalleProducto: {
    type: String,
    required: true,
  },
  numeroHabitacion: {
    type: Number,
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
  },
  estado: {
    type: String,
    default: 'pendiente',
    enum: ['pendiente', 'confirmado', 'entregado', 'cancelado'],
  },
  origen: {
    type: String,
    default: 'whatsapp-bot',
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now,
  },
})

// Middleware para actualizar fechaActualizacion antes de guardar
pedidoSchema.pre('save', function (next) {
  this.fechaActualizacion = Date.now()
  next()
})

// Middleware para actualizar fechaActualizacion en findOneAndUpdate
pedidoSchema.pre('findOneAndUpdate', function (next) {
  this.set({ fechaActualizacion: Date.now() })
  next()
})

export default mongoose.model('Pedido', pedidoSchema)
