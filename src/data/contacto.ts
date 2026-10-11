import type { Contacto } from '../lib/sitio';

// Los datos de contacto (WhatsApp, teléfono, aviso de privacidad, dirección, horario) se editan en el admin.
// Aquí quedan los textos de la sección y del formulario.

// TODO: confirmar con el cliente. URL que recibe el formulario por POST ([ENDPOINT] en el brief); luego, Resend.
export const endpointFormulario = '';

// Con dato vacío no se renderizan los botones de WhatsApp o teléfono.
export const whatsappUrl = (c: Contacto, mensaje = c.whatsappMensaje) =>
  c.whatsapp ? `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(mensaje)}` : '';

export const telefonoUrl = (c: Contacto) =>
  c.telefono ? `tel:+52${c.telefono.replace(/\D/g, '').slice(-10)}` : '';

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
  // Las opciones salen de los productos y categorías del admin; esta va al final.
  sinDecidir: 'Aún no lo sé, quiero asesoría',
  // La precarga el CTA de la sección Servicio técnico.
  servicio: 'Servicio técnico para mi equipo',
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
