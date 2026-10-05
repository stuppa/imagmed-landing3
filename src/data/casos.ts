// Casos de éxito. Si el arreglo está vacío, la sección no se renderiza.

export interface Caso {
  cliente: string; // clínica u hospital
  ciudad: string;
  equipo: string;
  testimonio: string;
  persona: string;
  cargo: string;
}

export const seccionCasos = {
  etiqueta: 'Casos de éxito',
  titulo: 'Clínicas que ya *trabajan con Mindray*.',
};

// TODO: confirmar con el cliente. Solo casos reales, con autorización por escrito de quien da el testimonio.
export const casos: Caso[] = [];
