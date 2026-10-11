// Carga el contenido inicial (lo que antes vivía en src/data/*.ts) en un Supabase recién migrado.
// Uso: node --env-file=.env scripts/semilla.mjs
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Faltan SUPABASE_URL y SUPABASE_SECRET_KEY en .env (ver .env.example).');
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const carpeta = new URL('../supabase/semilla/', import.meta.url);
const datos = JSON.parse(await readFile(new URL('datos.json', carpeta), 'utf8'));

function ok(r, que) {
  if (r.error) {
    console.error(`✗ ${que}: ${r.error.message}`);
    process.exit(1);
  }
  return r.data;
}

// No pisa nada: solo corre sobre una base vacía.
const { count } = await db.from('productos').select('*', { count: 'exact', head: true });
if (count) {
  console.error('La tabla productos ya tiene datos; la semilla solo corre sobre una base recién migrada.');
  process.exit(1);
}

const subidas = new Map();
async function subir(archivo, destino) {
  if (!archivo) return null;
  if (subidas.has(archivo)) return subidas.get(archivo);
  const buffer = await readFile(new URL(`imagenes/${archivo}`, carpeta));
  const { width, height, format } = await sharp(buffer).metadata();
  const ruta = `${destino}/${archivo}`;
  ok(
    await db.storage.from('imagenes').upload(ruta, buffer, { contentType: `image/${format}`, cacheControl: '31536000', upsert: true }),
    `subir ${archivo}`,
  );
  const imagen = { ruta, ancho: width, alto: height };
  subidas.set(archivo, imagen);
  return imagen;
}

const categorias = ok(await db.from('categorias').insert(datos.categorias).select('id, slug'), 'categorías');
const marcas = ok(await db.from('marcas').insert(datos.marcas).select('id, nombre'), 'marcas');
const idCategoria = new Map(categorias.map((c) => [c.slug, c.id]));
const idMarca = new Map(marcas.map((m) => [m.nombre, m.id]));

const productos = [];
for (const { categoria, marca, imagen, accesorios, ...p } of datos.productos) {
  const conImagenes = [];
  for (const a of accesorios) conImagenes.push({ ...a, imagen: await subir(a.imagen, 'accesorios') });
  productos.push({
    ...p,
    categoria_id: idCategoria.get(categoria),
    marca_id: idMarca.get(marca) ?? null,
    imagen: await subir(imagen, 'productos'),
    accesorios: conImagenes,
  });
}
const creados = ok(await db.from('productos').insert(productos).select('id, slug'), 'productos');

const { hero_producto, ...ajustes } = datos.ajustes;
ok(
  await db
    .from('ajustes')
    .update({ ...ajustes, hero_producto_id: creados.find((p) => p.slug === hero_producto)?.id ?? null })
    .eq('id', true),
  'ajustes',
);
ok(await db.from('faq').insert(datos.faq), 'FAQ');

console.log(
  `✓ ${categorias.length} categorías, ${marcas.length} marcas, ${creados.length} productos, ${datos.faq.length} preguntas y ${subidas.size} imágenes.`,
);
