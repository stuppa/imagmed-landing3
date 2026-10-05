// Sección "Por qué Imagmed". Iconos disponibles: ver src/components/Icono.astro.

export const seccionPorQue = {
  etiqueta: 'Por qué Imagmed',
  titulo: 'Más que equipos, *acompañamiento*.',
  texto:
    'Te acompañamos desde la elección del equipo hasta que está operando en tu consultorio, clínica u hospital.',
  cta: 'Habla con un asesor',
};

// TODO: confirmar con el cliente cada servicio antes de publicar (instalación, capacitación, garantía, servicio técnico, cobertura).
export const diferenciadores = [
  {
    icono: 'escudo',
    titulo: 'Distribuidor Mindray',
    texto: 'Equipos Mindray con asesoría de un distribuidor que conoce toda la línea.',
  },
  {
    icono: 'capacitacion',
    titulo: 'Instalación y capacitación',
    texto: 'Dejamos tu equipo instalado y a tu personal listo para usarlo.',
  },
  {
    icono: 'servicio',
    titulo: 'Garantía y servicio técnico',
    texto: 'Soporte técnico para que tu equipo siga trabajando sin interrupciones.',
  },
  {
    icono: 'mapa',
    titulo: 'Cobertura en todo México',
    texto: 'Atendemos clínicas, consultorios y hospitales en todo el país.',
  },
] as const;
