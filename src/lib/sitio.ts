// Carga el contenido del sitio desde Supabase y lo deja listo para los componentes (Astro.locals.sitio).
import type { APIContext } from 'astro';
import type {
  Estado,
  FilaAjustes,
  FilaCampana,
  FilaCategoria,
  FilaFaq,
  FilaMarca,
  FilaProducto,
  Imagen,
} from '../db/esquema';
import { hero as textosHero } from '../data/sitio';
import { campanaActiva, segundosHastaProximoCambio, vigente, type Grupo } from './contenido';
import { clientePublico, urlImagen, type Supabase } from './supabase';

// --- Filas de la base de datos: los tipos salen del esquema de Drizzle (src/db/esquema.ts) ---

export type {
  Accesorio,
  Estado,
  FilaAjustes,
  FilaCampana,
  FilaCategoria,
  FilaFaq,
  FilaMarca,
  FilaProducto,
  Imagen,
} from '../db/esquema';

// --- Lo que consumen los componentes ---

export interface ImagenVista {
  src: string;
  width: number;
  height: number;
}
export const vistaImagen = (i: Imagen): ImagenVista => ({ src: urlImagen(i.ruta), width: i.ancho, height: i.alto });

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  /** Marca + nombre, p. ej. «Mindray MX3». */
  nombreCompleto: string;
  tipo: string;
  marca: string | null;
  categoria: { slug: string; nombre: string };
  subtitulo: string;
  descripcion: string;
  imagen: ImagenVista;
  imagenAlt: string;
  especificaciones: string[];
  especialidades: string[];
  incluye: string[];
  tecnologias: { titulo: string; descripcion: string }[];
  especificacionesDetalladas: Grupo[];
  accesoriosTitulo: string;
  accesorios: { tipo: string; modelo: string; descripcion: string; imagen: ImagenVista | null }[];
  estado: Estado;
  agotado: boolean;
  destacado: boolean;
  /** Texto de la etiqueta de descuento si está vigente. */
  descuento: string | null;
}

interface TextosHero {
  etiqueta: string;
  titulo: string;
  texto: string;
  ctaPrincipal: string;
  ctaSecundario: string;
}
export type Hero =
  | (TextosHero & { tipo: 'campana'; imagen: ImagenVista; imagenAlt: string; producto: string | null })
  | (TextosHero & { tipo: 'producto'; producto: Producto | null; rotulo: string });

export interface Contacto {
  whatsapp: string;
  whatsappMensaje: string;
  telefono: string;
  avisoPrivacidadUrl: string;
  direccion: string;
  horario: string;
  googleMapsUrl: string;
}

export interface Sitio {
  hero: Hero;
  /** Productos no ocultos de categorías visibles, en orden. */
  productos: Producto[];
  destacados: Producto[];
  categorias: { slug: string; nombre: string; descripcion: string; productos: Producto[] }[];
  marcas: { nombre: string; logo: ImagenVista | null }[];
  faq: { pregunta: string; respuesta: string }[];
  contacto: Contacto;
  /** Segundos hasta el próximo inicio/fin programado (campañas y descuentos). */
  maxAge: number;
}

const fecha = (iso: string | null) => (iso ? new Date(iso) : null);

// Las filas llegan de la API de Supabase sin tipo; aquí se les pone el del esquema de Drizzle.
export function datos<T>(r: { data: unknown; error: { message: string } | null }, que: string): T {
  if (r.error || r.data === null) throw new Error(`No se pudo leer ${que} de Supabase: ${r.error?.message ?? 'sin datos'}`);
  return r.data as T;
}

export function aProducto(
  p: FilaProducto,
  categoria: { slug: string; nombre: string },
  marca: string | null,
  ahora: Date,
): Producto {
  const descuentoVigente =
    p.descuento_texto && vigente({ inicio: fecha(p.descuento_inicio), fin: fecha(p.descuento_fin) }, ahora);
  return {
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    nombreCompleto: marca ? `${marca} ${p.nombre}` : p.nombre,
    tipo: p.tipo,
    marca,
    categoria,
    subtitulo: p.subtitulo,
    descripcion: p.descripcion,
    imagen: vistaImagen(p.imagen),
    imagenAlt: p.imagen_alt,
    especificaciones: p.especificaciones,
    especialidades: p.especialidades,
    incluye: p.incluye,
    tecnologias: p.tecnologias,
    especificacionesDetalladas: p.especificaciones_detalladas,
    accesoriosTitulo: p.accesorios_titulo,
    accesorios: p.accesorios.map((a) => ({ ...a, imagen: a.imagen ? vistaImagen(a.imagen) : null })),
    estado: p.estado,
    agotado: p.estado === 'agotado',
    destacado: p.destacado,
    descuento: descuentoVigente ? p.descuento_texto : null,
  };
}

/**
 * Todo el contenido público. Con el cliente del admin y otra fecha sirve de vista previa:
 * así se ve el sitio el día que arranca una campaña o un descuento.
 */
export async function cargarSitio(cliente: Supabase = clientePublico(), ahora = new Date()): Promise<Sitio> {
  const [a, c, m, p, ca, f] = await Promise.all([
    cliente.from('ajustes').select('*').single(),
    cliente.from('categorias').select('*').eq('visible', true).order('orden'),
    cliente.from('marcas').select('*').order('orden'),
    cliente.from('productos').select('*').neq('estado', 'oculto').order('orden'),
    cliente.from('campanas').select('*').gt('fin', ahora.toISOString()).order('inicio'),
    cliente.from('faq').select('*').order('orden'),
  ]);
  const ajustes = datos<FilaAjustes>(a, 'ajustes');
  const categorias = datos<FilaCategoria[]>(c, 'categorías');
  const marcas = datos<FilaMarca[]>(m, 'marcas');
  const productos = datos<FilaProducto[]>(p, 'productos');
  const campanas = datos<FilaCampana[]>(ca, 'campañas');
  const faq = datos<FilaFaq[]>(f, 'FAQ');

  const categoriaPorId = new Map(categorias.map((c) => [c.id, c]));
  const marcaPorId = new Map(marcas.map((m) => [m.id, m.nombre]));
  const lista = productos.flatMap((p) => {
    const c = categoriaPorId.get(p.categoria_id);
    return c ? [aProducto(p, c, p.marca_id ? (marcaPorId.get(p.marca_id) ?? null) : null, ahora)] : [];
  });
  const destacados = lista.filter((p) => p.destacado);

  const campana = campanaActiva(
    campanas.map((c) => ({ ...c, inicio: new Date(c.inicio), fin: new Date(c.fin) })),
    ahora,
  );
  const hero: Hero = campana
    ? {
        tipo: 'campana',
        etiqueta: campana.etiqueta,
        titulo: campana.titulo,
        texto: campana.texto,
        ctaPrincipal: campana.cta_principal,
        ctaSecundario: campana.cta_secundario,
        imagen: vistaImagen(campana.imagen),
        imagenAlt: campana.imagen_alt,
        producto: lista.find((p) => p.id === campana.producto_id)?.nombreCompleto ?? null,
      }
    : {
        tipo: 'producto',
        etiqueta: ajustes.hero_etiqueta,
        titulo: ajustes.hero_titulo,
        texto: ajustes.hero_texto,
        ctaPrincipal: textosHero.ctaPrincipal,
        ctaSecundario: textosHero.ctaSecundario,
        producto: lista.find((p) => p.id === ajustes.hero_producto_id) ?? destacados[0] ?? lista[0] ?? null,
        rotulo: ajustes.hero_rotulo_accesorio,
      };

  return {
    hero,
    productos: lista,
    destacados,
    categorias: categorias.map((c) => ({
      slug: c.slug,
      nombre: c.nombre,
      descripcion: c.descripcion,
      productos: lista.filter((p) => p.categoria.slug === c.slug),
    })),
    marcas: marcas.map((m) => ({ nombre: m.nombre, logo: m.logo ? vistaImagen(m.logo) : null })),
    faq: faq.map(({ pregunta, respuesta }) => ({ pregunta, respuesta })),
    contacto: {
      whatsapp: ajustes.whatsapp,
      whatsappMensaje: ajustes.whatsapp_mensaje,
      telefono: ajustes.telefono,
      // Vacío en el admin: el aviso del propio sitio.
      avisoPrivacidadUrl: ajustes.aviso_privacidad_url || '/aviso-de-privacidad',
      direccion: ajustes.direccion,
      horario: ajustes.horario,
      googleMapsUrl: ajustes.google_maps_url,
    },
    maxAge: segundosHastaProximoCambio(
      [
        ...campanas.flatMap((c) => [fecha(c.inicio), fecha(c.fin)]),
        ...productos.flatMap((p) => [fecha(p.descuento_inicio), fecha(p.descuento_fin)]),
      ],
      ahora,
    ),
  };
}

// --- Caché del CDN ---

const TAG = 'sitio';
// Si Supabase falla al regenerar, se sigue sirviendo la versión anterior hasta una semana.
const SWR = 7 * 86_400;

/** Para páginas públicas: carga el contenido, lo deja en locals y guarda la respuesta en el CDN. */
export async function prepararPagina(ctx: Pick<APIContext, 'locals' | 'cache' | 'url'>) {
  const sitio = await cargarSitio();
  ctx.locals.sitio = sitio;
  // Nunca bajo /admin (p. ej. el 404 de una ruta inexistente del admin): esas respuestas llevan la sesión.
  const admin = ctx.url.pathname === '/admin' || ctx.url.pathname.startsWith('/admin/');
  if (ctx.cache.enabled && !admin) ctx.cache.set({ maxAge: sitio.maxAge, swr: SWR, tags: [TAG] });
  return sitio;
}

/** Para el admin, después de guardar: la siguiente visita regenera las páginas públicas. */
export async function invalidarSitio(ctx: Pick<APIContext, 'cache'>) {
  if (!ctx.cache.enabled) return;
  try {
    await ctx.cache.invalidate({ tags: [TAG] });
  } catch (e) {
    // Lo guardado ya está en la base; en el peor caso el cambio se ve al expirar la caché (máx. 24 h).
    console.error('No se pudo invalidar la caché del sitio', e);
  }
}
