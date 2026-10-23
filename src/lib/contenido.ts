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

/**
 * Medida en px (escritorio) de un logo en la sección de marcas. A alto fijo uno cuadrado se ve chico y uno muy ancho,
 * enorme: aquí todos ocupan la misma área (la de un logo 4:1 de 160×40), con tope de 64 px de alto y 220 de ancho.
 */
export function tamanoLogo(ancho: number, alto: number) {
  const proporcion = ancho / alto;
  const a = Math.min(64, Math.sqrt(6400 / proporcion), 220 / proporcion);
  return { ancho: Math.round(a * proporcion), alto: Math.round(a) };
}

// --- Colores de un diseño de campaña ---

/** Lo que el hero toma del diseño de una campaña; se calcula al subirlo (coloresDiseno en imagenes.ts). */
export interface Colores {
  /** Promedio del diseño: el fondo mientras carga la imagen. */
  fondo: string;
  /** Su color vivo que más contrasta con el fondo (mínimo 4.5:1, el de texto chico): brillo, acentos, barras y botón. */
  acento: string;
  /** Texto legible sobre el acento (el del botón principal). */
  textoAcento: string;
  /** Diseño claro: el texto del hero pasa a oscuro. */
  claro: boolean;
}

type Rgb = [number, number, number];
const MARCA: Rgb = [0x00, 0x66, 0xdd]; // --color-marca, para diseños sin colores vivos
const TINTA: Rgb = [0x0b, 0x12, 0x20]; // --color-tinta
const BLANCO: Rgb = [255, 255, 255];

const hex = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const lineal = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
const luminancia = ([r, g, b]: Rgb) => 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
/** Contraste WCAG entre dos colores, de 1 a 21. */
export const contraste = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
};
const mezclar = (a: Rgb, b: Rgb, t: number) => a.map((v, i) => v + (b[i]! - v) * t) as Rgb;

/**
 * Colores de un diseño a partir de sus píxeles RGB (basta una miniatura). Los colores vivos se agrupan en 24 tonos
 * pesados por saturación × brillo; de los tonos con peso, el acento es el que más contrasta con el promedio (en un
 * fondo rojo con amarillo gana el amarillo). Si el diseño es gris, el azul de la marca. Al final se oscurece (diseño
 * claro) o aclara (oscuro) hasta 4.5:1 con el promedio, lo que pide el texto chico (la etiqueta va en el acento).
 */
export function paletaDiseno(pixeles: ArrayLike<number>): Colores {
  const n = Math.floor(pixeles.length / 3);
  const suma: Rgb = [0, 0, 0];
  const tonos = Array.from({ length: 24 }, () => ({ peso: 0, rgb: [0, 0, 0] as Rgb }));
  let vivo = 0;
  for (let i = 0; i < n; i++) {
    const c: Rgb = [pixeles[i * 3]!, pixeles[i * 3 + 1]!, pixeles[i * 3 + 2]!];
    c.forEach((v, j) => (suma[j] += v));
    const max = Math.max(...c);
    const rango = max - Math.min(...c);
    if (!rango) continue;
    const [r, g, b] = c;
    const h = max === r ? ((g - b) / rango + 6) % 6 : max === g ? (b - r) / rango + 2 : (r - g) / rango + 4;
    const peso = (rango / max) * (max / 255);
    const tono = tonos[Math.floor(h * 4) % 24]!;
    tono.peso += peso;
    c.forEach((v, j) => (tono.rgb[j] += v * peso));
    vivo += peso;
  }
  const fondo = suma.map((v) => v / n) as Rgb;
  const claro = contraste(fondo, TINTA) > contraste(fondo, BLANCO);
  const mayor = Math.max(...tonos.map((t) => t.peso));
  // ponytail: umbrales fijos (4 % de color vivo; tonos con al menos 15 % del peso del mayor). Ajustar si un diseño real confunde.
  const candidatos = tonos.filter((t) => t.peso >= mayor * 0.15).map((t) => t.rgb.map((v) => v / t.peso) as Rgb);
  let acento = vivo / n > 0.04 ? candidatos.reduce((a, b) => (contraste(b, fondo) > contraste(a, fondo) ? b : a)) : MARCA;
  for (let paso = 0; paso < 30 && contraste(acento, fondo) < 4.5; paso++) acento = mezclar(acento, claro ? TINTA : BLANCO, 0.1);
  return {
    fondo: hex(fondo),
    acento: hex(acento),
    textoAcento: contraste(acento, BLANCO) >= contraste(acento, TINTA) ? '#ffffff' : hex(TINTA),
    claro,
  };
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
