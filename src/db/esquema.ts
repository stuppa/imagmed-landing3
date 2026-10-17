// Esquema de la base (Supabase Postgres) en Drizzle: tablas, restricciones y políticas RLS.
// Migraciones: `pnpm db:generar` las crea en supabase/migrations y `pnpm db:migrar` las aplica.
// Lo que Drizzle no expresa (funciones, EXCLUDE, GRANT, Storage) va en migraciones SQL propias de esa carpeta.
// La app no consulta con Drizzle: lee y escribe por la API de Supabase (RLS con la sesión del admin) y de aquí
// solo toma los tipos de las filas.
import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, jsonb, pgEnum, pgPolicy, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { anonRole, authenticatedRole, authUsers } from 'drizzle-orm/supabase';
import type { Caja, Grupo } from '../lib/contenido';

/** Imagen del bucket «imagenes». */
export interface Imagen {
  ruta: string;
  ancho: number;
  alto: number;
  /** Dónde está el contenido sin el fondo transparente (lo calcula la subida); el hero lo usa para encuadrar. */
  contenido?: Caja;
}
export interface Accesorio {
  tipo: string;
  modelo: string;
  descripcion: string;
  imagen?: Imagen | null;
}

// Admin = sesión con 2FA (aal2) + estar en administradores. La función vive en la migración «privado».
const esAdmin = sql`(select privado.es_admin())`;
const soloAdmin = () => pgPolicy('admin', { for: 'all', to: authenticatedRole, using: esAdmin, withCheck: esAdmin });
const lecturaPublica = (using: ReturnType<typeof sql>) =>
  pgPolicy('lectura publica', { for: 'select', to: [anonRole, authenticatedRole], using });
const SLUG = sql.raw(`'^[a-z0-9]+(-[a-z0-9]+)*$'`);
const fecha = () => timestamp({ withTimezone: true, mode: 'string' });

export const estadoProducto = pgEnum('estado_producto', ['publicado', 'agotado', 'oculto']);

export const categorias = pgTable(
  'categorias',
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    nombre: text().notNull(),
    descripcion: text().notNull().default(''),
    orden: integer().notNull().default(0),
    visible: boolean().notNull().default(true),
  },
  () => [
    check('categorias_slug_check', sql`slug ~ ${SLUG}`),
    check('categorias_nombre_check', sql`nombre <> ''`),
    lecturaPublica(sql`visible`),
    soloAdmin(),
  ],
);

export const marcas = pgTable(
  'marcas',
  {
    id: uuid().primaryKey().defaultRandom(),
    nombre: text().notNull().unique(),
    logo: jsonb().$type<Imagen>(),
    orden: integer().notNull().default(0),
  },
  () => [check('marcas_nombre_check', sql`nombre <> ''`), lecturaPublica(sql`true`), soloAdmin()],
);

export const productos = pgTable(
  'productos',
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    nombre: text().notNull(),
    tipo: text().notNull().default(''),
    categoria_id: uuid()
      .notNull()
      .references(() => categorias.id, { onDelete: 'restrict' }),
    marca_id: uuid().references(() => marcas.id, { onDelete: 'restrict' }),
    subtitulo: text().notNull().default(''),
    descripcion: text().notNull().default(''),
    imagen: jsonb().$type<Imagen>().notNull(),
    imagen_alt: text().notNull().default(''),
    especificaciones: text().array().notNull().default(sql`'{}'`),
    especialidades: text().array().notNull().default(sql`'{}'`),
    incluye: text().array().notNull().default(sql`'{}'`),
    tecnologias: jsonb().$type<{ titulo: string; descripcion: string }[]>().notNull().default([]),
    especificaciones_detalladas: jsonb().$type<Grupo[]>().notNull().default([]),
    accesorios_titulo: text().notNull().default('Transductores compatibles'),
    accesorios: jsonb().$type<Accesorio[]>().notNull().default([]),
    estado: estadoProducto().notNull().default('oculto'),
    destacado: boolean().notNull().default(false),
    orden: integer().notNull().default(0),
    descuento_texto: text(),
    descuento_inicio: fecha(),
    descuento_fin: fecha(),
  },
  (t) => [
    index('productos_categoria_idx').on(t.categoria_id),
    index('productos_marca_idx').on(t.marca_id),
    check('productos_slug_check', sql`slug ~ ${SLUG}`),
    check('productos_nombre_check', sql`nombre <> ''`),
    check(
      'productos_descuento_check',
      sql`descuento_inicio is null or descuento_fin is null or descuento_fin > descuento_inicio`,
    ),
    lecturaPublica(sql`estado <> 'oculto'`),
    soloAdmin(),
  ],
);

// Que dos campañas no se encimen lo garantiza un EXCLUDE en la migración «extras».
export const campanas = pgTable(
  'campanas',
  {
    id: uuid().primaryKey().defaultRandom(),
    nombre: text().notNull(),
    inicio: fecha().notNull(),
    fin: fecha().notNull(),
    etiqueta: text().notNull().default(''),
    titulo: text().notNull(),
    texto: text().notNull().default(''),
    cta_principal: text().notNull().default('Cotiza ahora'),
    cta_secundario: text().notNull().default('Solicita una demo'),
    imagen: jsonb().$type<Imagen>().notNull(),
    imagen_alt: text().notNull(),
    producto_id: uuid().references(() => productos.id, { onDelete: 'set null' }),
  },
  (t) => [
    index('campanas_producto_idx').on(t.producto_id),
    check('campanas_fechas_check', sql`fin > inicio`),
    check('campanas_nombre_check', sql`nombre <> ''`),
    check('campanas_titulo_check', sql`titulo <> ''`),
    check('campanas_imagen_alt_check', sql`imagen_alt <> ''`),
    // Las futuras también: el sitio las necesita para calcular cuánto dura su caché.
    lecturaPublica(sql`fin > now()`),
    soloAdmin(),
  ],
);

// Una sola fila (id = true, se inserta en la migración «extras»): hero por defecto y datos de contacto.
export const ajustes = pgTable(
  'ajustes',
  {
    id: boolean().primaryKey().default(true),
    // Obsoleta (la reemplaza hero_productos), pero el deploy anterior aún la lee: se borra cuando este cambio esté en producción.
    hero_producto_id: uuid().references(() => productos.id, { onDelete: 'set null' }),
    // Los que rotan en el hero, en orden. Sin FK (Postgres no la tiene en arreglos): el sitio salta los que ya no están.
    hero_productos: uuid().array().notNull().default(sql`'{}'`),
    hero_etiqueta: text().notNull().default(''),
    hero_titulo: text().notNull().default(''),
    hero_texto: text().notNull().default(''),
    hero_rotulo_accesorio: text().notNull().default('Transductor'),
    whatsapp: text().notNull().default(''),
    whatsapp_mensaje: text().notNull().default(''),
    telefono: text().notNull().default(''),
    aviso_privacidad_url: text().notNull().default(''),
    direccion: text().notNull().default(''),
    horario: text().notNull().default(''),
    google_maps_url: text().notNull().default(''),
  },
  () => [
    check('ajustes_una_fila', sql`id`),
    check('ajustes_whatsapp_check', sql`whatsapp ~ '^(52[0-9]{10})?$'`),
    lecturaPublica(sql`true`),
    soloAdmin(),
  ],
);

export const faq = pgTable(
  'faq',
  {
    id: uuid().primaryKey().defaultRandom(),
    pregunta: text().notNull(),
    respuesta: text().notNull().default(''),
    orden: integer().notNull().default(0),
  },
  () => [check('faq_pregunta_check', sql`pregunta <> ''`), lecturaPublica(sql`true`), soloAdmin()],
);

// El equipo del panel. «super» además administra el equipo (Edge Function «equipo»); «miembro» edita el contenido.
// RLS sin políticas y sin GRANT a anon/authenticated: solo service_role la toca (la función y scripts/admin.mjs).
export const rolMiembro = pgEnum('rol_miembro', ['super', 'miembro']);

export const administradores = pgTable('administradores', {
  user_id: uuid()
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  correo: text().notNull().default(''),
  rol: rolMiembro().notNull().default('miembro'),
  creado: fecha().notNull().defaultNow(),
}).enableRLS();

// Tipos de fila tal como los devuelve la API de Supabase.
export type Estado = (typeof estadoProducto.enumValues)[number];
export type FilaCategoria = typeof categorias.$inferSelect;
export type FilaMarca = typeof marcas.$inferSelect;
export type FilaProducto = typeof productos.$inferSelect;
export type FilaCampana = typeof campanas.$inferSelect;
export type FilaAjustes = typeof ajustes.$inferSelect;
export type FilaFaq = typeof faq.$inferSelect;
