import { equipos } from './equipos';
import { productos } from './sitio';

// Datos de contacto. Los elementos con dato vacío no se renderizan (botones de WhatsApp, teléfono, aviso).
export const contacto = {
  // TODO: confirmar con el cliente. Solo dígitos, con lada de país: 52 + 10 dígitos (p. ej. 52XXXXXXXXXX).
  whatsapp: '',
  whatsappMensaje: 'Hola, me interesa información sobre los equipos de ultrasonido Mindray.',
  // TODO: confirmar con el cliente. Teléfono tal como se mostrará (p. ej. XX XXXX XXXX).
  telefono: '',
  // TODO: confirmar con el cliente. URL del aviso de privacidad (obligatorio al recabar datos personales, LFPDPPP).
  avisoPrivacidadUrl: '',
  // TODO: confirmar con el cliente. URL que recibe el formulario por POST ([ENDPOINT] en el brief).
  endpoint: '',
};

export const whatsappUrl = (mensaje = contacto.whatsappMensaje) =>
  contacto.whatsapp ? `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}` : '';

export const telefonoUrl = contacto.telefono ? `tel:+52${contacto.telefono.replace(/\D/g, '').slice(-10)}` : '';

export const seccionContacto = {
  etiqueta: 'Solicita una cotización formal',
  titulo: 'Hablemos de *tu proyecto*.',
  texto: 'Déjanos tus datos y un asesor te contactará para entender lo que necesitas.',
  alternativa: '¿Prefieres hablar ahora?',
  queSigue: 'Qué sigue después de enviar',
};

export const formulario = {
  campos: {
    nombre: 'Nombre completo',
    telefono: 'Teléfono',
    correo: 'Correo electrónico',
    equipo: '¿Qué equipo te interesa?',
    cuando: '¿Cuándo lo necesitas?',
  },
  ejemplos: { telefono: '10 dígitos', correo: 'nombre@clinica.com' },
  elige: 'Elige una opción',
  equipos: [
    ...equipos.map((e) => e.nombre),
    ...productos.categorias.filter((c) => c.slug).map((c) => c.texto),
    'Aún no lo sé, quiero asesoría',
  ],
  cuando: ['Lo antes posible', 'En 1 a 3 meses', 'En 3 a 6 meses', 'Solo estoy comparando opciones'],
  enviar: 'Enviar solicitud',
  enviarDemo: 'Solicitar demo',
  enviando: 'Enviando…',
  exitoTitulo: 'Recibimos tu solicitud.',
  exitoTexto: 'Un asesor se pondrá en contacto contigo por teléfono o correo.',
  error: 'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.',
  errores: {
    nombre: 'Escribe tu nombre completo.',
    telefono: 'Escribe un teléfono de 10 dígitos.',
    correo: 'Escribe un correo válido, por ejemplo nombre@clinica.com.',
    equipo: 'Elige un equipo o «Aún no lo sé».',
    cuando: 'Elige cuándo lo necesitas.',
  },
  notaDemo: 'Solicitas una demo del equipo.',
  notaProyeccion: 'Incluye tu proyección de retorno.',
  privacidad: 'Al enviar aceptas nuestro',
  privacidadEnlace: 'aviso de privacidad',
  exitoWhatsapp: 'Escríbenos por WhatsApp',
  whatsappFlotante: 'Escríbenos por WhatsApp',
};
