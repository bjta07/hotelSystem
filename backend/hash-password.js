import bcryptjs from 'bcryptjs'

const generateHash = async () => {
  const password = 'admin123'
  const salt = await bcryptjs.genSalt(10)
  const hashedPassword = await bcryptjs.hash(password, salt)
  console.log('Contraseña:', password)
  console.log('Hash:', hashedPassword)
}

generateHash()
