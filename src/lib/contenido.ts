// Reglas puras del contenido: vigencia por fechas, caché y formatos de texto del admin.
// Sin dependencias para poder probarlas con `pnpm test`.

export interface Rango {
  inicio: Date | null;
  fin: Date | null;
}

/** Inicio incluido, fin excluido; una fecha vacía no limita. */
export const vigente = ({ inicio, fin }: Rango, ahora: Date) =>
  (!inicio || inicio <= ahora) && (!fin || ahora < fin);

/** La base de datos impide campañas encimadas, así que a lo más hay una. */
export const campanaActiva = <T extends Rango>(campanas: T[], ahora: Date) =>
  campanas.find((c) => vigente(c, ahora));

/**
 * Productos que rotan en el hero, en el orden elegido en el admin; se saltan los que ya no se muestran
 * (ocultos o borrados). Sin elección, el primer destacado (o el primer producto).
 */
export function productosHero<T extends { id: string; destacado: boolean }>(ids: string[], lista: T[]) {
  const elegidos = ids.flatMap((id) => lista.filter((p) => p.id === id));
  return elegidos.length ? elegidos : [...lista.filter((p) => p.destacado), ...lista].slice(0, 1);
}

/** Rectángulo en píxeles de una imagen. */
export interface Caja {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

/**
 * Equipos altos (carros, rayos X móviles…): completos, nunca cortados, pero sin el margen transparente de la foto, que
 * los achicaba. La ventana 4:3 mide el alto del equipo más 2.5 % arriba y abajo, centrada en él. `equipo` es la caja
 * del equipo sin el fondo transparente. Devuelve la ventana en píxeles de la imagen, o null para mostrarla completa.
 */
export function encuadreHero(equipo: Caja | null | undefined): Caja | null {
  if (!equipo || equipo.alto < equipo.ancho * 1.3) return null;
  const alto = equipo.alto * 1.05;
  const ancho = (alto * 4) / 3;
  return { x: equipo.x + (equipo.ancho - ancho) / 2, y: equipo.y + (equipo.alto - alto) / 2, ancho, alto };
}

/** Segundos hasta la fecha futura más cercana (inicio o fin de algo programado), entre 1 s y el tope. */
export function segundosHastaProximoCambio(fechas: (Date | null | undefined)[], ahora: Date, tope = 86_400) {
  const faltan = fechas.filter((f): f is Date => !!f && f > ahora).map((f) => (f.getTime() - ahora.getTime()) / 1000);
  return Math.max(1, Math.ceil(Math.min(tope, ...faltan)));
}

// --- Formatos de los textarea del admin ---

export const lineas = (texto: string) =>
  texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const partir = (linea: string): [string, string] => {
  const i = linea.indexOf(':');
  return i < 0 ? [linea, ''] : [linea.slice(0, i).trim(), linea.slice(i + 1).trim()];
};

/** «Título: descripción», un par por renglón. */
export const pares = (texto: string) =>
  lineas(texto).map((l) => {
    const [titulo, descripcion] = partir(l);
    return { titulo, descripcion };
  });

export const paresATexto = (lista: { titulo: string; descripcion: string }[]) =>
  lista.map((p) => (p.descripcion ? `${p.titulo}: ${p.descripcion}` : p.titulo)).join('\n');

export interface Grupo {
  categoria: string;
  items: { etiqueta: string; valor: string }[];
}

/** «# Grupo» abre un grupo; «Etiqueta: valor» agrega un renglón al grupo abierto. */
export function grupos(texto: string) {
  const lista: Grupo[] = [];
  for (const l of lineas(texto)) {
    if (l.startsWith('#')) {
      lista.push({ categoria: l.replace(/^#+/, '').trim(), items: [] });
      continue;
    }
    if (!lista.length) lista.push({ categoria: 'Especificaciones', items: [] });
    const [etiqueta, valor] = partir(l);
    lista.at(-1)!.items.push({ etiqueta, valor });
  }
  return lista;
}

export const gruposATexto = (lista: Grupo[]) =>
  lista.map((g) => [`# ${g.categoria}`, ...g.items.map((i) => `${i.etiqueta}: ${i.valor}`)].join('\n')).join('\n\n');

// --- Fechas: el admin captura en hora del centro de México ---

// ponytail: offset fijo; el centro de México no tiene horario de verano desde 2022. Si vuelve, calcularlo con Intl.
const OFFSET = '-06:00';
const OFFSET_MS = -6 * 3_600_000;

/** Valor de <input type="datetime-local"> → Date (o null si viene vacío o inválido). */
export function deFechaLocal(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) return null;
  const fecha = new Date(`${valor}:00${OFFSET}`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** Date o ISO → valor para <input type="datetime-local">. */
export const aFechaLocal = (fecha: Date | string | null | undefined) =>
  fecha ? new Date(new Date(fecha).getTime() + OFFSET_MS).toISOString().slice(0, 16) : '';

export const formatoFecha = (fecha: Date | string) =>
  new Date(fecha).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short' });

export const slugificar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
