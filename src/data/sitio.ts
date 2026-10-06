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

// Con "/" delante para que funcionen también desde las páginas interiores.
export const navegacion = [
  { texto: 'Equipos', href: '/#equipos' },
  { texto: 'Retorno', href: '/#retorno' },
  { texto: 'Por qué Imagmed', href: '/#por-que' },
  { texto: 'Ubicación', href: '/#mapa' },
  { texto: 'Proceso', href: '/#proceso' },
  { texto: 'FAQ', href: '/#faq' },
];

// Submenú "Productos". Con slug, la categoría tiene su página en /productos/[slug]; con href, lleva ahí.
// TODO: confirmar con el cliente las descripciones y, cuando existan, marcas y modelos de cada categoría.
export const productos = {
  texto: 'Productos',
  categorias: [
    {
      texto: 'Consumibles',
      slug: 'consumibles',
      descripcion: 'Insumos para la operación diaria de tus equipos de imagen. Dinos qué equipo usas y te cotizamos los consumibles compatibles.',
    },
    {
      texto: 'Densitómetros',
      slug: 'densitometros',
      descripcion: 'Equipos de densitometría ósea para medir la densidad mineral y apoyar el diagnóstico y seguimiento de la osteoporosis.',
    },
    {
      texto: 'Digitalizadores CR',
      slug: 'digitalizadores-cr',
      descripcion: 'Radiografía computarizada (CR) para digitalizar los estudios de tu sala de rayos X convencional sin reemplazar el equipo.',
    },
    {
      texto: 'Arcos en C',
      slug: 'arcos-en-c',
      descripcion: 'Fluoroscopía móvil con imagen en tiempo real para quirófano, ortopedia y procedimientos intervencionistas.',
    },
    {
      texto: 'Ortopantomógrafos',
      slug: 'ortopantomografos',
      descripcion: 'Radiografía panorámica dental para odontología general, ortodoncia y cirugía maxilofacial.',
    },
    {
      texto: 'Mastógrafos',
      slug: 'mastografos',
      descripcion: 'Equipos de mastografía para la detección oportuna y el diagnóstico de cáncer de mama.',
    },
    {
      texto: 'Impresoras DICOM',
      slug: 'impresoras-dicom',
      descripcion: 'Impresoras compatibles con DICOM para entregar en físico los estudios de tus equipos de imagen.',
    },
    {
      texto: 'Detectores de RX',
      slug: 'detectores-de-rx',
      descripcion: 'Detectores digitales de panel plano (DR) para pasar tu sala de rayos X a radiografía digital directa.',
    },
    {
      texto: 'Rayos X Portátiles',
      slug: 'rayos-x-portatiles',
      descripcion: 'Equipos de rayos X móviles para estudios en cama, urgencias, terapia intensiva y quirófano.',
    },
    {
      texto: 'Tomógrafos',
      slug: 'tomografos',
      descripcion: 'Tomografía computarizada (TC) para hospitales y centros de diagnóstico por imagen.',
    },
    {
      texto: 'Salas de Rayos X',
      slug: 'salas-de-rayos-x',
      descripcion: 'Salas de radiografía fijas para hospitales, clínicas y centros de diagnóstico.',
    },
    { texto: 'Ultrasonidos', href: '/#equipos' },
  ] as { texto: string; slug?: string; descripcion?: string; href?: string }[],
};

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

// Sección de marcas que distribuye Imagmed.
// TODO: confirmar con el cliente las marcas y conseguir los logos oficiales (con autorización de uso).
// Para mostrar un logo: import logo from '../assets/marcas/mindray.svg' y asignarlo en `logo`. Sin logo se muestra el nombre.
export const marcas = {
  titulo: 'Las marcas que respaldan *cada diagnóstico*.',
  cta: 'Ver productos',
  href: '/#equipos',
  lista: [
    { nombre: 'Mindray' },
    { nombre: 'Fujifilm' },
    { nombre: 'DRGEM' },
    { nombre: 'Vatech' },
    { nombre: 'Vieworks' },
  ] as { nombre: string; logo?: ImageMetadata }[],
};
