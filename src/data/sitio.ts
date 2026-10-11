import type { ImageMetadata } from 'astro';

// Textos generales del sitio, SEO, navegación y footer.
// Productos, categorías, marcas, hero, FAQ y contacto se editan en el panel admin (/admin) y viven en Supabase.
// En los títulos, el texto entre *asteriscos* se muestra en itálica bold azul.

export const sitio = {
  nombre: 'IMAGMED NACIONAL',
  razonSocial: 'IMAGMED NACIONAL S.A. DE C.V.',
  titulo: 'Ultrasonidos Mindray y equipo de imagenología en México | IMAGMED NACIONAL',
  descripcion:
    'Venta, instalación y mantenimiento de ultrasonidos Mindray, rayos X, tomógrafos y densitómetros en todo México. Cotiza con IMAGMED NACIONAL.',
  ogImagen: '/og.jpg',
  ogImagenAlt: 'IMAGMED NACIONAL, equipo de imagenología médica en México',
  saltarContenido: 'Saltar al contenido',
};

// Con "/" delante para que funcionen también desde las páginas interiores.
export const navegacion = [
  { texto: 'Equipos', href: '/#equipos' },
  { texto: 'Servicio', href: '/#servicio' },
  { texto: 'Retorno', href: '/#retorno' },
  { texto: 'Por qué Imagmed', href: '/#por-que' },
  { texto: 'Ubicación', href: '/#mapa' },
  { texto: 'FAQ', href: '/#faq' },
];

// Submenú "Productos": una entrada por categoría visible (/productos/[slug]).
export const productos = {
  texto: 'Productos',
};

export const encabezado = {
  cta: 'Cotiza ahora',
  ctaCorto: 'Cotizar',
  whatsapp: 'WhatsApp',
  menu: 'Menú',
};

// Botones del hero por defecto (las campañas traen los suyos).
export const hero = {
  ctaPrincipal: 'Cotiza ahora',
  ctaSecundario: 'Solicita una demo',
};

// Catálogo de la landing: muestra los productos marcados como destacados.
export const seccionCatalogo = {
  etiqueta: 'Nuestro catálogo',
  titulo: 'Equipos de ultrasonido Mindray para *cada especialidad*.',
  texto: 'Elige un equipo y te enviamos una cotización formal con la configuración que necesitas.',
  cta: 'Cotizar este equipo',
  ctaAgotado: 'Consultar disponibilidad',
  agotado: 'Agotado',
  verDetalle: 'Ver detalle',
};

// Lo que se precarga en «Incluye» al crear un producto nuevo.
export const incluyeDefecto = [
  'Asesoría clínica especializada para configurar el equipo a la medida de tu práctica',
  'Instalación y puesta en marcha por ingenieros biomédicos certificados',
  'Capacitación clínica para tu equipo de trabajo',
  'Garantía formal respaldada por IMAGMED NACIONAL',
  'Soporte técnico continuo y cobertura de servicio en todo México',
];

export const redes = [
  { nombre: 'Facebook', url: 'https://www.facebook.com/IMAGMED' },
  { nombre: 'Instagram', url: 'https://www.instagram.com/imagmednacional' },
];

export const pie = {
  distribuidor: 'Distribuidor de equipos',
  marca: 'Mindray',
  aviso: 'Aviso de privacidad',
};

// TODO: confirmar con el cliente. Logo oficial de Mindray (con autorización de uso de marca), p. ej.:
// import logo from '../assets/marca/mindray.png' y asignarlo aquí. Mientras esté vacío, el footer muestra el nombre en texto.
export const logoMindray: ImageMetadata | undefined = undefined;

// Sección de marcas; la lista y los logos se editan en el admin.
export const marcas = {
  titulo: 'Las marcas que respaldan *cada diagnóstico*.',
  cta: 'Ver productos',
  href: '/#equipos',
};
