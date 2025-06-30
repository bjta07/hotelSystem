const axios = require('axios')
const fs = require('fs')
const path = require('path')
require('dotenv').config() // Carga las variables de entorno desde .env

// Función para leer prompt desde archivo
const leerPromptDesdeArchivo = () => {
  const promptPath = path.join(__dirname, 'mensajes', 'promptConsultas.txt')

  try {
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Archivo de prompt no encontrado: ${promptPath}`)
    }
    return fs.readFileSync(promptPath, 'utf-8')
  } catch (error) {
    console.error('❌ Error al leer el archivo de prompt:', error.message)
    console.warn('⚠️ Usando prompt por defecto')
    return `Eres un asistente virtual de un hotel. Eres amable, profesional y conoces bien los servicios del hotel. 
    Ayudas a los huéspedes con información sobre el hotel, servicios, recomendaciones turísticas y cualquier consulta que tengan.
    Responde de manera concisa y útil, siempre manteniendo un tono amigable y profesional.`
  }
}

// Función original para consultas simples (sin contexto)
const chatWithGPT = async (mensajeUsuario) => {
  try {
    // Validar que la API key existe
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error(
        'OPENROUTER_API_KEY no está configurada en las variables de entorno'
      )
    }

    // Leer prompt desde archivo
    const promptBase = leerPromptDesdeArchivo()

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',
        messages: [
          { role: 'system', content: promptBase },
          { role: 'user', content: mensajeUsuario },
        ],
        temperature: 0.3,
        max_tokens: 400,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://whatsapp-bot',
          'X-Title': 'Hotel WhatsApp ChatBot',
        },
      }
    )

    // Validar que la respuesta tiene el formato esperado
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Respuesta de API en formato inesperado')
    }

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('❌ Error al conectar con OpenRouter:', error.message)

    // Manejo específico de errores de API
    if (error.response?.status === 401) {
      return 'Error de autenticación. Verifica la configuración.'
    } else if (error.response?.status === 429) {
      return 'Muchas consultas. Espera un momento e intenta de nuevo.'
    } else if (error.response?.status >= 500) {
      return 'Error del servidor. Intenta más tarde.'
    }

    return 'Lo siento, hubo un error al contactar con la inteligencia artificial.'
  }
}

// Función nueva para conversaciones con contexto completo
const chatWithGPTConContexto = async (historialCompleto) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY no está configurada')
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',
        messages: historialCompleto,
        temperature: 0.7,
        max_tokens: 1000, // Limitar para WhatsApp
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      }
    )

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Respuesta de API en formato inesperado')
    }

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('❌ Error al conectar con OpenRouter:', error.message)

    if (error.response?.status === 401) {
      return 'Error de autenticación. Por favor contacta al administrador.'
    } else if (error.response?.status === 429) {
      return 'Muchas consultas simultáneas. Espera un momento e intenta de nuevo.'
    } else if (error.response?.status >= 500) {
      return 'Error del servidor. Intenta más tarde.'
    }

    return 'Hubo un error al procesar tu consulta. ¿Puedes intentar de nuevo?'
  }
}

// Función helper para crear prompt del sistema con contexto de hotel
const crearPromptSistema = () => {
  return leerPromptDesdeArchivo()
}

module.exports = {
  chatWithGPT,
  chatWithGPTConContexto,
  crearPromptSistema,
}
