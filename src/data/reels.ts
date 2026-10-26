// Reels de Instagram (@imagmednacional) junto al texto de Servicio, Por qué Imagmed y Preguntas frecuentes (Inicio.astro).
// Cada uno son tres archivos en public/reels:
//   {id}.mp4        el reel tal cual se descargó (ya trae el índice al principio, así empieza a verse antes de bajar todo)
//   {id}-vista.mp4  6 s del original recortados sin recomprimir y sin audio (0.9–1.5 MB): a este tamaño, recomprimida
//                   o más chica se nota borrosa
//   {id}.webp       el primer cuadro de la vista, a 640 px

export const reels = {
  agfa: { id: 'servicio-agfa', titulo: 'Reparación de un digitalizador AGFA CR 75.0', duracion: '1:35' },
  rayosX: { id: 'servicio-rayos-x', titulo: 'Servicio técnico a equipos de rayos X', duracion: '1:04' },
  testimonio: {
    id: 'testimonio-rayos-x',
    titulo: 'Testimonio médico: instalación de sala de rayos X digital',
    duracion: '0:42',
  },
  demo: { id: 'demo-ultrasonido', titulo: 'Ultrasonido portátil Mindray en acción', duracion: '0:15' },
};

// Textual, del segundo 13 del reel.
export const citaTestimonio = {
  cita: 'Un equipo muy bonito, muy completo, de muy buena calidad.',
  fuente: 'Médico que recibió su sala de rayos X digital Mindray',
};
