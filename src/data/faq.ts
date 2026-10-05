// Preguntas frecuentes, orientadas a objeciones de compra.
// Una pregunta con respuesta vacía no se renderiza: déjala lista para cuando el cliente confirme el dato.

export const seccionFaq = {
  etiqueta: 'Preguntas frecuentes',
  titulo: 'Resuelve tus dudas *antes de cotizar*.',
  cierre: '¿Tienes otra duda?',
  ctaWhatsapp: 'Escríbenos por WhatsApp',
  ctaFormulario: 'Pregúntale a un asesor',
};

export const preguntas = [
  {
    pregunta: '¿Cómo sé qué equipo necesito?',
    respuesta:
      'Cuéntanos tu especialidad, el tipo de estudios que haces y cuántos pacientes atiendes. Un asesor te recomienda opciones y te explica las diferencias antes de cotizar.',
  },
  {
    pregunta: '¿Puedo ver el equipo funcionando antes de comprar?',
    respuesta: 'Sí. Solicita una demo en el formulario y coordinamos contigo la fecha y la modalidad.',
  },
  {
    pregunta: '¿Cuál es el tiempo de entrega?',
    respuesta:
      'Depende del modelo y de la configuración. Te confirmamos disponibilidad y tiempo de entrega por escrito en tu cotización.',
  },
  {
    pregunta: '¿Incluye instalación y capacitación?',
    // TODO: confirmar con el cliente.
    respuesta: 'Sí. Instalamos el equipo y capacitamos a tu personal para que lo opere desde el primer día.',
  },
  {
    pregunta: '¿Qué garantía tienen los equipos?',
    respuesta: 'Cada cotización detalla por escrito la garantía y las condiciones de servicio del equipo.',
  },
  {
    pregunta: '¿Ofrecen opciones de financiamiento?',
    // TODO: confirmar con el cliente. Mientras esté vacía, esta pregunta no se muestra.
    respuesta: '',
  },
  {
    pregunta: '¿Atienden en todo México?',
    // TODO: confirmar con el cliente.
    respuesta: 'Sí. Atendemos clínicas, consultorios y hospitales en todo el país.',
  },
];
