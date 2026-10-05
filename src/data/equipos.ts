import type { ImageMetadata } from 'astro';
import mx3 from '../assets/equipos/mx3.png';
import resonaI9 from '../assets/equipos/resona-i9.png';
import nuewa from '../assets/equipos/nuewa.png';
import consonaN9 from '../assets/equipos/consona-n9.png';
import resona6 from '../assets/equipos/resona-6.png';
import dc70 from '../assets/equipos/dc-70.png';
import convexo from '../assets/equipos/transductor-convexo.png';
import lineal from '../assets/equipos/transductor-lineal.png';

export interface TecnologiaDestacada {
  titulo: string;
  descripcion: string;
}

export interface GrupoEspecificacion {
  categoria: string;
  items: { etiqueta: string; valor: string }[];
}

export interface TransductorCompatible {
  tipo: string;
  modelo?: string;
  descripcion: string;
  imagen?: ImageMetadata;
}

export interface Equipo {
  slug: string;
  nombre: string;
  categoria: string;
  subtitulo: string;
  descripcion: string;
  imagen: ImageMetadata;
  imagenAlt: string;
  especificaciones: string[];
  especialidades: string[];
  tecnologiasDestacadas: TecnologiaDestacada[];
  especificacionesDetalladas: GrupoEspecificacion[];
  transductoresCompatibles: TransductorCompatible[];
  incluye: string[];
}

export const seccionEquipos = {
  etiqueta: 'Nuestro catálogo',
  titulo: 'Equipos de ultrasonido Mindray para *cada especialidad*.',
  texto: 'Elige un equipo y te enviamos una cotización formal con la configuración que necesitas.',
  cta: 'Cotizar este equipo',
};

const beneficiosIncluidosDefecto = [
  'Asesoría clínica especializada para configurar el equipo a la medida de tu práctica',
  'Instalación y puesta en marcha por ingenieros biomédicos certificados',
  'Capacitación clínica para tu equipo de trabajo',
  'Garantía formal respaldada por Imagmed Nacional',
  'Soporte técnico continuo y cobertura de servicio en todo México',
];

export const equipos: Equipo[] = [
  {
    slug: 'mx3',
    nombre: 'MX3',
    categoria: 'Ultrasonido Portátil',
    subtitulo: 'Ultrasonido portátil ultracompacto con plataforma ZST+ para diagnóstico veloz y preciso en cualquier punto de atención.',
    descripcion: 'El Mindray MX3 es la combinación perfecta entre portabilidad, resistencia y rendimiento diagnóstico avanzado. Diseñado para médicos que requieren imágenes de alta resolución en áreas críticas, urgencias y consulta externa, el MX3 integra la galardonada tecnología ZST+ que procesa imágenes por zonas en lugar de líneas tradicionales, garantizando claridad superior y un flujo de trabajo ágil con encendido ultrarrápido.',
    imagen: mx3,
    imagenAlt: 'Ultrasonido portátil Mindray MX3 en diseño ultracompacto tipo laptop',
    especificaciones: [
      'Plataforma ZST+ de adquisición por zonas',
      'Pantalla Full HD de 15.6" antirreflejante',
      'Batería integrada de alta duración (hasta 1.5 h)',
    ],
    especialidades: [
      'Medicina de Urgencias',
      'Cuidados Intensivos (UTI)',
      'Anestesiología & Bloqueos',
      'Medicina General',
      'Musculoesquelético (MSK)',
    ],
    tecnologiasDestacadas: [
      {
        titulo: 'Plataforma ZST+',
        descripcion: 'Adquisición de imágenes por zonas que ofrece una resolución temporal y espacial de nivel avanzado.',
      },
      {
        titulo: 'HD Scope',
        descripcion: 'Mejora la definición de bordes anatómicos y la diferenciación tisular en planos profundos.',
      },
      {
        titulo: 'iNeedle+',
        descripcion: 'Visualización clara de la aguja con ajuste de ángulo para punciones y bloqueos precisos.',
      },
      {
        titulo: 'iTouch+',
        descripcion: 'Optimización automática de la imagen en tiempo real con un solo toque.',
      },
    ],
    especificacionesDetalladas: [
      {
        categoria: 'Pantalla y Ergonomía',
        items: [
          { etiqueta: 'Monitor', valor: 'LCD Full HD 15.6" antirreflejo' },
          { etiqueta: 'Peso', valor: '4.5 kg en aleación de magnesio' },
          { etiqueta: 'Batería', valor: 'Litio integrada con autonomía de 1.5 horas' },
        ],
      },
      {
        categoria: 'Procesamiento e Imagen',
        items: [
          { etiqueta: 'Arquitectura', valor: 'ZST+ (Zone Sonography Technology)' },
          { etiqueta: 'Modos de Imagen', valor: 'B, M, Color, Power Doppler, PW, CW' },
          { etiqueta: 'Almacenamiento', valor: 'SSD de 128 GB integrado' },
        ],
      },
      {
        categoria: 'Conectividad',
        items: [
          { etiqueta: 'Puertos Activos', valor: '1 puerto (ampliable a 3 con carro opcional)' },
          { etiqueta: 'DICOM', valor: 'DICOM 3.0 completo integrado' },
          { etiqueta: 'Salidas', valor: 'HDMI, USB 3.0, Wi-Fi' },
        ],
      },
    ],
    transductoresCompatibles: [
      { tipo: 'Convexo', modelo: 'C5-2s', descripcion: 'Estudios abdominales, obstétricos y renales.', imagen: convexo },
      { tipo: 'Lineal', modelo: 'L13-3s', descripcion: 'Tejidos superficiales, vasculares, MSK y accesos venosos.', imagen: lineal },
      { tipo: 'Endocavitario', modelo: 'V11-3Ws', descripcion: 'Ginecología, obstetricia temprana y urología.' },
      { tipo: 'Phased Array', modelo: 'P4-2s', descripcion: 'Evaluaciones cardíacas rápidas (POCUS) y hemodinámica.' },
    ],
    incluye: beneficiosIncluidosDefecto,
  },
  {
    slug: 'resona-i9',
    nombre: 'Resona I9',
    categoria: 'Ultrasonido de Carro Premium',
    subtitulo: 'Sistema de clase premium impulsado por arquitectura ZST+ de 2ª generación e inteligencia artificial médica iConsole.',
    descripcion: 'El Mindray Resona I9 redefine la experiencia clínica en radiología e imagenología médica avanzada. Impulsado por la arquitectura ZST+ de segunda generación e integración de herramientas de inteligencia artificial, el Resona I9 ofrece diagnósticos con una nitidez incomparable en pacientes difíciles, elastografía cuantitativa Sound Touch (STE) de alta resolución y flujos de trabajo automatizados que reducen drásticamente el tiempo de exploración.',
    imagen: resonaI9,
    imagenAlt: 'Ultrasonido de carro de alta gama Mindray Resona I9 con monitor articulado',
    especificaciones: [
      'Plataforma ZST+ de 2ª Generación con IA médica',
      'Monitor LED 4K / Full HD de 23.8" articulado',
      'Panel táctil iConsole de 15.6" por gestos',
    ],
    especialidades: [
      'Radiología General',
      'Ginecología y Obstetricia',
      'Cardiología',
      'Hepatología & Cuantificación',
      'Salud Mamaria y Tiroidea',
    ],
    tecnologiasDestacadas: [
      {
        titulo: 'Sound Touch Elastography (STE)',
        descripcion: 'Elastografía por onda de choque cuantitativa 2D para evaluación de rigidez tisular y fibrosis.',
      },
      {
        titulo: 'iConsole',
        descripcion: 'Panel táctil interactivo personalizable por gestos que agiliza los protocolos de examen.',
      },
      {
        titulo: 'Smart Scene 3D/4D',
        descripcion: 'Reconocimiento anatómico automatizado con inteligencia artificial para adquisiciones volumétricas instantáneas.',
      },
      {
        titulo: 'Silencio iGala',
        descripcion: 'Operación ultra silenciosa con tecnología de disipación de calor eficiente y sin ruido.',
      },
    ],
    especificacionesDetalladas: [
      {
        categoria: 'Pantalla y Consola',
        items: [
          { etiqueta: 'Monitor Principal', valor: '23.8" LED sobre brazo flotante articulado' },
          { etiqueta: 'Panel Táctil', valor: 'iConsole 15.6" con elevación eléctrica' },
          { etiqueta: 'Puertos Activos', valor: '5 puertos con indicador LED de estado' },
        ],
      },
      {
        categoria: 'Rendimiento y Software',
        items: [
          { etiqueta: 'Procesador', valor: 'ZST+ de 2ª Generación' },
          { etiqueta: 'Almacenamiento', valor: 'SSD NVMe de 1 TB' },
          { etiqueta: 'Herramientas IA', valor: 'Smart Planes, Smart ICV, STE Cuantitativo' },
        ],
      },
      {
        categoria: 'Conectividad',
        items: [
          { etiqueta: 'Salidas de Vídeo', valor: 'HDMI 4K, DisplayPort, USB 3.0' },
          { etiqueta: 'Integración', valor: 'DICOM 3.0, Wi-Fi institucional' },
        ],
      },
    ],
    transductoresCompatibles: [
      { tipo: 'Convexo Monocristal', modelo: 'SC5-1U', descripcion: 'Penetración profunda e imagen abdominal cristalina.', imagen: convexo },
      { tipo: 'Lineal Alta Frecuencia', modelo: 'L14-3WU', descripcion: 'Máxima resolución en mama, tiroides y MSK.', imagen: lineal },
      { tipo: 'Volumétrico 4D', modelo: 'SD8-1E', descripcion: 'Reconstrucción facial y anatómica 3D/4D fetal HD.' },
      { tipo: 'Endocavitario Volumétrico', modelo: 'DE10-3WU', descripcion: 'Diagnóstico ginecológico y obstétrico de alta resolución.' },
    ],
    incluye: beneficiosIncluidosDefecto,
  },
  {
    slug: 'nuewa',
    nombre: 'Nuewa',
    categoria: 'Ginecología & Salud de la Mujer',
    subtitulo: 'Plataforma especializada en ginecología, obstetricia y medicina maternal con herramientas inteligentes Smart3D/4D.',
    descripcion: 'Diseñado exclusivamente para las exigencias de la Salud de la Mujer, el Mindray Nuewa ofrece un rendimiento excepcional en cada etapa de la atención obstétrica y ginecológica. Integra herramientas avanzadas de biometría fetal asistida por inteligencia artificial, renderizado iLive Prime fotorrealista para la experiencia materno-fetal, y evaluación especializada del suelo pélvico.',
    imagen: nuewa,
    imagenAlt: 'Ultrasonido Mindray Nuewa especializado en ginecología y obstetricia',
    especificaciones: [
      'Smart Scene 3D/4D con iLive Prime fotorrealista',
      'Biometría fetal automática asistida por IA',
      'Monitor LED de 21.5" y pantalla táctil HD',
    ],
    especialidades: [
      'Ginecología',
      'Obstetricia de Alto Riesgo',
      'Medicina Fetal',
      'Reproducción Asistida',
      'Suelo Pélvico',
      'Mastología',
    ],
    tecnologiasDestacadas: [
      {
        titulo: 'iLive Prime',
        descripcion: 'Renderizado 4D fotorrealista con fuentes de luz virtuales ajustables y tono de piel hiperrealista.',
      },
      {
        titulo: 'Smart Planes FH',
        descripcion: 'Detección automática de los planos estándar del corazón fetal impulsada por IA.',
      },
      {
        titulo: 'Smart Pelvic',
        descripcion: 'Evaluación cuantitativa y visual del suelo pélvico femenino pre y posparto.',
      },
      {
        titulo: 'Smart FHR',
        descripcion: 'Medición automática de la frecuencia cardíaca fetal directa sobre la imagen B.',
      },
    ],
    especificacionesDetalladas: [
      {
        categoria: 'Sistema y Pantallas',
        items: [
          { etiqueta: 'Monitor Principal', valor: 'LED de 21.5" antirreflejo articulado' },
          { etiqueta: 'Pantalla Táctil', valor: '13.3" HD con inclinación regulable' },
          { etiqueta: 'Puertos Activos', valor: '4 puertos de conexión rápida' },
        ],
      },
      {
        categoria: 'Herramientas Obstétricas',
        items: [
          { etiqueta: 'Modos 3D/4D', valor: 'iLive Prime, Smart3D, Color 3D' },
          { etiqueta: 'Biometría IA', valor: 'Smart OB, Smart ICV, Smart Planes' },
        ],
      },
    ],
    transductoresCompatibles: [
      { tipo: 'Convexo Volumétrico 4D', modelo: 'V11-3HU', descripcion: 'Captura volumétrica 4D fetal de alta velocidad de cuadros.', imagen: convexo },
      { tipo: 'Endocavitario Ergonómico', modelo: 'V11-3B', descripcion: 'Exploración transvaginal confortable y detallada.' },
      { tipo: 'Lineal Superficial', modelo: 'L12-3E', descripcion: 'Evaluación mamaria y ginecológica superficial.', imagen: lineal },
    ],
    incluye: beneficiosIncluidosDefecto,
  },
  {
    slug: 'consona-n9',
    nombre: 'Consona N9',
    categoria: 'Servicio Compartido / Multidisciplinario',
    subtitulo: 'Versatilidad diagnóstica superior con plataforma ZST+ para clínicas de atención médica integral.',
    descripcion: 'El Mindray Consona N9 es la solución ideal para clínicas, hospitales y centros diagnósticos que requieren cobertura multidisciplinaria de primer nivel. Su plataforma ZST+ garantiza nitidez de imagen continua en estudios abdominales, vasculares, obstétricos y cardíacos, respaldada por una estructura ergonómica de bajo esfuerzo.',
    imagen: consonaN9,
    imagenAlt: 'Ultrasonido de carro Mindray Consona N9 para servicio compartido',
    especificaciones: [
      'Arquitectura de imagen ZST+ multidisciplinaria',
      'Monitor LED de 21.5" Full HD articulado',
      'Diseño ergonómico con elevación eléctrica',
    ],
    especialidades: [
      'Medicina General',
      'Radiología',
      'Ginecología y Obstetricia',
      'Cardiología Vascular',
      'Urología',
    ],
    tecnologiasDestacadas: [
      {
        titulo: 'iTouch+',
        descripcion: 'Optimización automática instantánea de ganancia B, Doppler y Color.',
      },
      {
        titulo: 'Smart Calc',
        descripcion: 'Trazados Doppler automáticos y cálculo inmediato de índices hemodinámicos.',
      },
      {
        titulo: 'Sound Touch Elastography',
        descripcion: 'Evaluación cualitativa y cuantitativa de rigidez tisular.',
      },
      {
        titulo: 'Modo Standby Instantáneo',
        descripcion: 'Batería en espera para traslados entre salas sin apagar el equipo.',
      },
    ],
    especificacionesDetalladas: [
      {
        categoria: 'Ergonomía y Pantalla',
        items: [
          { etiqueta: 'Monitor', valor: 'LED Full HD 21.5" articulado' },
          { etiqueta: 'Panel Táctil', valor: '13.3" multitáctil capacitivo' },
          { etiqueta: 'Teclado', valor: 'Físico retráctil con iluminación' },
        ],
      },
      {
        categoria: 'Procesamiento',
        items: [
          { etiqueta: 'Arquitectura', valor: 'ZST+ (Zone Sonography Technology)' },
          { etiqueta: 'Puertos Activos', valor: '4 puertos estándar' },
        ],
      },
    ],
    transductoresCompatibles: [
      { tipo: 'Convexo', modelo: 'C5-1U', descripcion: 'Estudios abdominales y obstétricos.', imagen: convexo },
      { tipo: 'Lineal', modelo: 'L13-3U', descripcion: 'Vascular periférico, tiroides y partes blandas.', imagen: lineal },
      { tipo: 'Phased Array', modelo: 'P4-2U', descripcion: 'Ecocardiografía en adultos y pacientes pediátricos.' },
      { tipo: 'Endocavitario', modelo: 'V11-3U', descripcion: 'Urología y ginecología transvaginal.' },
    ],
    incluye: beneficiosIncluidosDefecto,
  },
  {
    slug: 'resona-6',
    nombre: 'Resona 6',
    categoria: 'Radiología y Cardiología Avanzada',
    subtitulo: 'Potencia de procesamiento por zonas ZST+ orientada a radiología de alta complejidad y cardiología cuantitativa.',
    descripcion: 'El Resona 6 pertenece a la línea insignia de Mindray, incorporando adquisición por zonas ZST+ para proporcionar resoluciones tisulares excepcionales con excelente penetración en pacientes con ventana acústica difícil. Cuenta con avanzadas herramientas cuantitativas de miocardio y elastografía por onda de choque.',
    imagen: resona6,
    imagenAlt: 'Ultrasonido Mindray Resona 6 avanzado para radiología y cardiología',
    especificaciones: [
      'Canales ZST+ de alta definición anatómica',
      'Monitor LED Full HD 21.5" sobre brazo flotante',
      'Pantalla táctil iControl multitáctil',
    ],
    especialidades: [
      'Radiología Avanzada',
      'Cardiología',
      'Vascular Periférico',
      'Ginecología y Obstetricia',
      'Medicina Interna',
    ],
    tecnologiasDestacadas: [
      {
        titulo: 'Tissue Tracking QA',
        descripcion: 'Análisis cuantitativo de strain miocárdico y deformación del ventrículo izquierdo.',
      },
      {
        titulo: 'UWN+ Contrast Imaging',
        descripcion: 'Imagenología con agentes de contraste de armónico ultra amplio.',
      },
      {
        titulo: 'iClear+',
        descripcion: 'Filtro de supresión de speckle que preserva bordes estructurales sutiles.',
      },
    ],
    especificacionesDetalladas: [
      {
        categoria: 'Pantalla y Conexiones',
        items: [
          { etiqueta: 'Monitor Principal', valor: 'LED 21.5" Full HD en brazo articulado' },
          { etiqueta: 'Panel Táctil', valor: '12.1" con control gestual' },
          { etiqueta: 'Puertos Activos', valor: '4 puertos pinless de alta durabilidad' },
        ],
      },
    ],
    transductoresCompatibles: [
      { tipo: 'Convexo Monocristal', modelo: 'SC5-1E', descripcion: 'Alta resolución y penetración en abdomen.', imagen: convexo },
      { tipo: 'Phased Array', modelo: 'P4-2E', descripcion: 'Ecocardiografía transtorácica cuantitativa.' },
      { tipo: 'Lineal', modelo: 'L12-3E', descripcion: 'Evaluación vascular, mamaria y musculoesquelética.', imagen: lineal },
    ],
    incluye: beneficiosIncluidosDefecto,
  },
  {
    slug: 'dc-70',
    nombre: 'DC-70',
    categoria: 'Ultrasonido Clínico Versátil',
    subtitulo: 'Eficiencia operativa superior con arquitectura X-Insight para un flujo de trabajo ágil y diagnósticos sin margen de error.',
    descripcion: 'El Mindray DC-70 con X-Insight ofrece claridad visual asombrosa combinada con una velocidad de procesamiento veloz. Diseñado para simplificar los exámenes rutinarios complejos, integra transductores ComboWave de alto rendimiento que mejoran la sensibilidad del flujo sanguíneo y la resolución espacial.',
    imagen: dc70,
    imagenAlt: 'Ultrasonido de carro Mindray DC-70 X-Insight',
    especificaciones: [
      'Arquitectura X-Insight con transductores ComboWave',
      'Monitor LED Full HD de 21.5" articulado',
      'Pantalla táctil ultra-sensible de 13.3"',
    ],
    especialidades: [
      'Radiología General',
      'Ginecología y Obstetricia',
      'Cardiología',
      'Urología',
      'Medicina Familiar',
    ],
    tecnologiasDestacadas: [
      {
        titulo: 'ComboWave Probes',
        descripcion: 'Transductores de material piezoeléctrico avanzado que maximizan el ancho de banda y la señal.',
      },
      {
        titulo: 'iScanHelper',
        descripcion: 'Guía anatómica e ilustrada integrada en pantalla para referencia clínica instantánea.',
      },
      {
        titulo: 'Smart FBC',
        descripcion: 'Mediciones automáticas en chequeos de rutina obstétrica.',
      },
    ],
    especificacionesDetalladas: [
      {
        categoria: 'Especificaciones Principales',
        items: [
          { etiqueta: 'Monitor', valor: '21.5" LED Full HD orientable' },
          { etiqueta: 'Panel Táctil', valor: '13.3" multitáctil regulable' },
          { etiqueta: 'Puertos Activos', valor: '4 puertos activos' },
        ],
      },
    ],
    transductoresCompatibles: [
      { tipo: 'Convexo ComboWave', modelo: 'C5-1E', descripcion: 'Excelente contraste tisular y flujo Doppler.', imagen: convexo },
      { tipo: 'Lineal', modelo: 'L14-6WE', descripcion: 'Imagenología detallada en pequeñas partes y vascular.', imagen: lineal },
      { tipo: 'Endocavitario', modelo: 'V11-3E', descripcion: 'Evaluaciones ginecológicas y prostáticas.' },
    ],
    incluye: beneficiosIncluidosDefecto,
  },
];

// Transductores que acompañan al equipo del hero.
export const transductoresHero = [
  { tipo: 'Convexo', modelo: '', imagen: convexo },
  { tipo: 'Lineal', modelo: '', imagen: lineal },
];

