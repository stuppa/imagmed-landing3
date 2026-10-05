// Barra de confianza bajo el hero. Cada elemento vacío no se renderiza.

export const confianza = {
  frase: 'Distribuidor de equipos de ultrasonido Mindray en México',
  // TODO: confirmar con el cliente las líneas disponibles.
  lineas: 'Líneas Resona, Nuewa y Consona',
  // TODO: confirmar con el cliente. Solo certificaciones vigentes y comprobables, p. ej. ['Nombre de la certificación'].
  certificaciones: [] as string[],
  // TODO: confirmar con el cliente. Cifras verificables, p. ej. [{ valor: '000', etiqueta: 'equipos instalados' }].
  cifras: [] as { valor: string; etiqueta: string }[],
};
