import type { ImageMetadata } from 'astro';

// Datos generales del sitio, SEO, navegación, hero y footer.
// En los títulos, el texto entre *asteriscos* se muestra en itálica bold azul.

export const sitio = {
  nombre: 'Imagmed Nacional',
  razonSocial: 'IMAGMED NACIONAL S.A. DE C.V.',
  titulo: 'Equipos de ultrasonido Mindray en México | Imagmed Nacional',
  descripcion:
    'Cotiza equipos de ultrasonido Mindray con Imagmed Nacional. Solicita una demo y recibe una cotización formal para tu clínica, consultorio u hospital.',
  ogImagen: '/og.jpg',
  ogImagenAlt: 'Imagmed Nacional, distribuidor de equipos de ultrasonido Mindray en México',
  saltarContenido: 'Saltar al contenido',
};

export const navegacion = [
  { texto: 'Equipos', href: '#equipos' },
  { texto: 'Retorno', href: '#retorno' },
  { texto: 'Por qué Imagmed', href: '#por-que' },
  { texto: 'Ubicación', href: '#mapa' },
  { texto: 'Proceso', href: '#proceso' },
  { texto: 'FAQ', href: '#faq' },
];

export const encabezado = {
  cta: 'Cotiza ahora',
  ctaCorto: 'Cotizar',
  whatsapp: 'WhatsApp',
  menu: 'Menú',
};

export const hero = {
  etiqueta: 'Ultrasonido Mindray',
  titulo: 'Donde la imagen se vuelve *certeza*.',
  // TODO: confirmar con el cliente los servicios que se mencionan (instalación, capacitación, soporte, cobertura nacional).
  texto:
    'Equipos de ultrasonido Mindray con asesoría, instalación, capacitación y soporte en todo México.',
  ctaPrincipal: 'Cotiza ahora',
  ctaSecundario: 'Solicita una demo',
  // Slug del equipo de equipos.ts que protagoniza el hero (su nombre es la marca de agua).
  equipo: 'mx3',
  transductor: 'Transductor',
};

export const pie = {
  distribuidor: 'Distribuidor de equipos',
  marca: 'Mindray',
  aviso: 'Aviso de privacidad',
};

// TODO: confirmar con el cliente. Logo oficial de Mindray (con autorización de uso de marca), p. ej.:
// import logo from '../assets/marca/mindray.png' y asignarlo aquí. Mientras esté vacío, el footer muestra el nombre en texto.
export const logoMindray: ImageMetadata | undefined = undefined;
