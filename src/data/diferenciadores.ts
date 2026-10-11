// Secciones "Por qué Imagmed" y "Servicio técnico" (mismo componente, PorQue.astro).
// Iconos disponibles: ver src/components/Icono.astro. Textos confirmados por el cliente (cuestionario, oct 2026).

export const seccionPorQue = {
  etiqueta: 'Por qué Imagmed',
  titulo: 'Más que un proveedor, *tu aliado técnico*.',
  texto:
    'Tecnología de vanguardia, precios competitivos y el mejor respaldo para clínicas, hospitales y médicos, en salud humana y veterinaria.',
  cta: 'Habla con un asesor',
};

export const diferenciadores = [
  {
    icono: 'sello',
    titulo: 'La mejor inversión',
    texto: 'Precios excelentes y la mejor relación costo-beneficio en tecnología médica de primera línea.',
  },
  {
    icono: 'servicio',
    titulo: 'Soporte técnico directo',
    texto: 'Sin intermediarios: nuestros propios ingenieros dan mantenimiento rápido para que tu clínica nunca se detenga.',
  },
  {
    icono: 'mapa',
    titulo: 'Instalación en todo México',
    texto: 'Llevamos el equipo hasta tu puerta, lo instalamos y capacitamos a tu personal en tus instalaciones.',
  },
  {
    icono: 'brujula',
    titulo: 'Asesoría honesta',
    texto: 'Analizamos tus necesidades clínicas reales y te recomendamos la configuración exacta para cuidar tu presupuesto.',
  },
] as const;

// El cliente quiere ganar clientes nuevos empezando por el servicio, aunque no le hayan comprado el equipo.
export const seccionServicio = {
  etiqueta: 'Servicio técnico',
  titulo: 'Tu equipo, *siempre funcionando*.',
  texto:
    'Ingenieros certificados dan mantenimiento preventivo y correctivo a todo equipo de imagenología, en tu clínica u hospital, en cualquier parte de México.',
  cta: 'Agenda un servicio',
};

export const servicios = [
  {
    icono: 'escudo',
    titulo: 'Mantenimiento preventivo',
    texto: 'Revisiones programadas que evitan fallas y alargan la vida de tu equipo.',
  },
  {
    icono: 'servicio',
    titulo: 'Mantenimiento correctivo',
    texto: 'Diagnóstico, reparación y refacciones para que tu equipo vuelva a operar cuanto antes.',
  },
  {
    icono: 'capacitacion',
    titulo: 'Ingenieros certificados',
    texto: 'Especialistas en ultrasonido, rayos X, tomografía y densitometría.',
  },
  {
    icono: 'capas',
    titulo: 'Cualquier equipo',
    texto: 'Damos servicio a todo equipo de imagenología, aunque no lo hayas comprado con nosotros.',
  },
] as const;
