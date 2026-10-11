// Barra de confianza bajo el hero. Cada elemento vacío no se renderiza.

export const confianza = {
  frase: 'Distribuidor autorizado de 11 marcas',
  lineas: 'Ultrasonido, rayos X, tomografía y densitometría',
  // TODO: confirmar con el cliente. Solo certificaciones vigentes y comprobables, p. ej. ['Nombre de la certificación'].
  certificaciones: [] as string[],
  // Cifras dadas por el cliente en el cuestionario (oct 2026).
  cifras: [
    { valor: '+10', etiqueta: 'años de experiencia' },
    { valor: '+1,000', etiqueta: 'equipos instalados en México' },
  ] as { valor: string; etiqueta: string }[],
};
