const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  addAnswer,
  EVENTS,
} = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const { delay } = require('@whiskeysockets/baileys')
const path = require('path')
const fs = require('fs')
const axios = require('axios')

//Mensajes
const idiomaPath = path.join(__dirname, 'mensajes', 'idioma.txt')
const idioma = fs.readFileSync(idiomaPath, 'utf8')

const EnMenuPath = path.join(__dirname, 'mensajes', 'EnMenu.txt')
const EnMenu = fs.readFileSync(EnMenuPath, 'utf8')

const EspMenuPath = path.join(__dirname, 'mensajes', 'EspMenu.txt')
const EspMenu = fs.readFileSync(EspMenuPath, 'utf8')

//Reserva
let fechaReserva
let nombreReserva
let numeroHuespedes
let diasEstadia

const flowReservas = addKeyword(EVENTS.ACTION)
  .addAnswer('Hola, este es el menú de reservas.')
  .addAnswer(
    'Por favor, ingresa la fecha de tu llegada (formato DD/MM/AAAA):',
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      const fecha = ctx.body.trim()
      const regexFecha = /^\d{2}\/\d{2}\/\d{4}$/

      if (!regexFecha.test(fecha)) {
        return fallBack(
          'Formato de fecha no válido. Por favor, ingresa la fecha en formato DD/MM/AAAA:'
        )
      }

      fechaReserva = fecha // Guardar en la variable independiente
      console.log('Fecha registrada:', fechaReserva) // Verificar estado de la variable
      return await flowDynamic('Fecha registrada correctamente.')
    }
  )
  .addAnswer(
    '¿A nombre de quién estará la reserva? Por favor, escribe nombres y apellidos:',
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      const nombre = ctx.body.trim()
      const partesNombre = nombre.split(' ')

      if (partesNombre.length < 2 || partesNombre.some((p) => p.length < 2)) {
        return fallBack(
          'El nombre debe incluir al menos un nombre y un apellido, ambos con más de 2 caracteres. Intenta de nuevo:'
        )
      }

      nombreReserva = nombre // Guardar en la variable independiente
      console.log('Nombre registrado:', nombreReserva) // Verificar estado de la variable
      return await flowDynamic('Nombre registrado correctamente.')
    }
  )
  .addAnswer(
    '¿Cuántos huéspedes se quedarán?',
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      const numero = parseInt(ctx.body.trim(), 10)

      if (isNaN(numero) || numero <= 0) {
        return fallBack('Por favor, ingresa un número válido de huéspedes:')
      }

      numeroHuespedes = numero // Guardar en la variable independiente
      console.log('Número de huéspedes registrado:', numeroHuespedes) // Verificar estado de la variable
      return await flowDynamic('Número de huéspedes registrado correctamente.')
    }
  )
  .addAnswer(
    '¿Cuántos días planean quedarse?',
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      const dias = parseInt(ctx.body.trim(), 10)

      if (isNaN(dias) || dias <= 0) {
        return fallBack('Por favor, ingresa un número válido de días:')
      }

      diasEstadia = dias // Guardar en la variable independiente
      console.log('Días de estadía registrados:', diasEstadia) // Verificar estado de la variable

      // Construir y mostrar los datos finales
      const reserva = {
        fecha: fechaReserva,
        nombre: nombreReserva,
        numeroHuespedes,
        diasEstadia,
      }

      console.log('Datos de la reserva:', reserva) // Mostrar los datos finales
      try {
        await enviarReservaAlBackend(reserva)
        console.log('Reserva enviada correctamente')
      } catch (error) {
        console.error('Error al enviar la reserva', error.message)
      }
      return await flowDynamic(
        '¡Reserva completada! Gracias por proporcionar los detalles.'
      )
    }
  )

//Enviar datos al Backend
const enviarReservaAlBackend = async (reserva) => {
  try {
    // Cambiar a la nueva ruta del bot
    const response = await axios.post(
      'http://localhost:5000/api/bot/reservas',
      reserva,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-bot-token': 'mi_token_secreto_del_bot', // Token opcional para más seguridad
        },
      }
    )
    console.log('✅ Reserva enviada al backend:', response.data)
  } catch (error) {
    console.error(
      '❌ Error al enviar la reserva al backend:',
      error.response?.data || error.message
    )
  }
}

//Pedidos
let tipoPedido
let detalleProducto
let numeroHabitacion
let cantidad

const flowPedidos = addKeyword(EVENTS.ACTION)
  .addAnswer('Hola, este es el menú de pedidos.')
  .addAnswer(
    'Por favor, elige el tipo de pedido:\n1. Bebidas\n2. Alimentos\n3. Otros',
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      const opcion = ctx.body.trim()
      const opcionesValidas = ['1', '2', '3']

      if (!opcionesValidas.includes(opcion)) {
        return fallBack(
          'Opción no válida. Por favor elige una de las siguientes opciones:\n1. Bebidas\n2. Alimentos\n3. Otros'
        )
      }

      const tipos = { 1: 'Bebidas', 2: 'Alimentos', 3: 'Otros' }
      tipoPedido = tipos[opcion] // Guardar el tipo de pedido en la variable independiente
      console.log('Tipo de pedido registrado:', tipoPedido) // Verificar estado de la variable
      return await flowDynamic(`Tipo de pedido registrado: ${tipoPedido}`)
    }
  )
  .addAnswer(
    'Por favor, detalla el producto que deseas pedir:',
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      const detalle = ctx.body.trim()

      if (detalle.length < 3) {
        return fallBack(
          'El detalle del producto debe contener al menos 3 caracteres. Por favor, intenta de nuevo:'
        )
      }

      detalleProducto = detalle // Guardar en la variable independiente
      console.log('Detalle del producto registrado:', detalleProducto) // Verificar estado de la variable
      return await flowDynamic('Detalle del producto registrado correctamente.')
    }
  )
  .addAnswer(
    '¿Cuál es el número de habitación?',
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      const numero = parseInt(ctx.body.trim(), 10)

      if (isNaN(numero) || numero <= 0) {
        return fallBack('Por favor, ingresa un número de habitación válido:')
      }

      numeroHabitacion = numero // Guardar en la variable independiente
      console.log('Número de habitación registrado:', numeroHabitacion) // Verificar estado de la variable
      return await flowDynamic('Número de habitación registrado correctamente.')
    }
  )
  .addAnswer(
    '¿Cuál es la cantidad que deseas pedir?',
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      const cantidadPedido = parseInt(ctx.body.trim(), 10)

      if (isNaN(cantidadPedido) || cantidadPedido <= 0) {
        return fallBack('Por favor, ingresa una cantidad válida:')
      }

      cantidad = cantidadPedido // Guardar en la variable independiente
      console.log('Cantidad registrada:', cantidad) // Verificar estado de la variable

      // Construir y mostrar los datos finales
      const pedido = {
        tipoPedido,
        detalleProducto,
        numeroHabitacion,
        cantidad,
      }

      console.log('Datos del pedido:', pedido) // Mostrar los datos finales

      try {
        await enviarPedidoAlBackend(pedido)
        console.log('Pedido enviado correctamente')
      } catch (error) {
        console.error('Error al enviar el pedido', error.message)
      }

      return await flowDynamic(
        '¡Pedido completado! Gracias por proporcionar los detalles.'
      )
    }
  )

// Enviar datos al Backend
const enviarPedidoAlBackend = async (pedido) => {
  try {
    // Cambiar a la nueva ruta del bot
    const response = await axios.post(
      'http://localhost:5000/api/bot/pedidos',
      pedido,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-bot-token': 'mi_token_secreto_del_bot', // Token opcional para más seguridad
        },
      }
    )
    console.log('✅ Pedido enviado al backend:', response.data)
  } catch (error) {
    console.error(
      '❌ Error al enviar el pedido al backend:',
      error.response?.data || error.message
    )
  }
}

//Comidas
const flowComidas = addKeyword(EVENTS.ACTION).addAnswer(
  'hola este es el flow de comidas'
)

const menuEspFlow = addKeyword(EVENTS.ACTION).addAnswer(
  EspMenu,
  { capture: true },
  async (ctx, { gotoFlow, fallBack }) => {
    if (!['Reserva', 'Pedido'].includes(ctx.body)) {
      return fallBack('Respuesta no valida, porfavor selecciona una opcion')
    }
    switch (ctx.body) {
      case 'Reserva':
        return gotoFlow(flowReservas)
        break
      case 'Pedido':
        return gotoFlow(flowPedidos)
        break
      case '0':
        return gotoFlow(idiomaFlow)
      default:
        break
    }
  }
)

const menuEnFlow = addKeyword(EVENTS.ACTION).addAnswer(
  EnMenu,
  { capture: true },
  async (ctx, { gotoFlow, fallBack }) => {
    if (!['Booking', 'Service', 'Meals'].includes(ctx.body)) {
      return fallBack('Not valid Answer, please select an option')
    }
    switch (ctx.body) {
      case 'Booking':
        return gotoFlow(flowReservas)
        break
      case 'Service':
        return gotoFlow(flowPedidos)
        break
      case 'Meals':
        return gotoFlow(flowComidas)
      case '0':
        return gotoFlow(idiomaFlow)
      default:
        break
    }
  }
)

const idiomaFlow = addKeyword([
  'Idioma',
  'languaje',
  'español',
  'english',
  'English',
  'Español',
]).addAnswer(
  idioma,
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
    if (!['1', '2'].includes(ctx.body)) {
      return fallBack('Respuesta no valida, porfavor selecciona una opcion')
    }
    switch (ctx.body) {
      case '1':
        return gotoFlow(menuEspFlow)
        break
      case '2':
        return gotoFlow(menuEnFlow)
        break
      case '0':
        return await flowDynamic('Saliendo del menu...')
      default:
        break
    }
  }
)

const flowPrincipal = addKeyword(['hola', 'ole', 'alo']).addAnswer(
  [
    '🙌 Hola bienvenido al asistente virtual del hotel ',
    '🙌 Hello! Welcome to hotel virtual assistant',
    '                                                       ',
    'Porfavor escribe *Idioma* si quieres cambiar de idioma',
    'Please, write *Languaje* if you want to chance the languaje',
  ],
  [idiomaFlow]
)

const main = async () => {
  const adapterDB = new MockAdapter()
  const adapterFlow = createFlow([
    flowPrincipal,
    idiomaFlow,
    menuEnFlow,
    menuEspFlow,
    flowComidas,
    flowPedidos,
    flowReservas,
  ])
  const adapterProvider = createProvider(BaileysProvider)

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  QRPortalWeb()
}

main()
