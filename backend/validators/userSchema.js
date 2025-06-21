const { z } = require('zod')

const userSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email(),
  phone: z.string().optional(),
})

module.exports = userSchema
