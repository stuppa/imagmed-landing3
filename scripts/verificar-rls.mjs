// Comprueba contra el Supabase real que el público (publishable key, la que usa el sitio) solo puede leer lo público.
// Uso: node --env-file=.env scripts/verificar-rls.mjs
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan SUPABASE_URL y SUPABASE_KEY en .env.');
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const NADIE = '00000000-0000-0000-0000-000000000000';

// Cada prueba devuelve true si el acceso fue bloqueado. Las escrituras no cambian nada aunque hubiera un hueco
// (actualización con el mismo valor, borrado sin coincidencias) y lo que se llegara a crear se limpia.
const pruebas = {
  'lee productos públicos': async () => !(await db.from('productos').select('id').limit(1)).error,
  'no ve productos ocultos': async () => (await db.from('productos').select('id').eq('estado', 'oculto')).data?.length === 0,
  'no ve categorías ocultas': async () => (await db.from('categorias').select('id').eq('visible', false)).data?.length === 0,
  'no ve administradores': async () => !!(await db.from('administradores').select('user_id')).error,
  'no llama mi_rol': async () => !!(await db.rpc('mi_rol')).error,
  'no actualiza ajustes': async () => {
    const actual = (await db.from('ajustes').select('telefono').single()).data;
    return !!(await db.from('ajustes').update({ telefono: actual?.telefono ?? '' }).eq('id', true)).error;
  },
  'no borra productos': async () => !!(await db.from('productos').delete().eq('id', NADIE)).error,
  'no crea categorías': async () => {
    const r = await db.from('categorias').insert({ slug: 'prueba-rls', nombre: 'Prueba RLS', visible: false }).select('id');
    if (r.error) return true;
    await db.from('categorias').delete().eq('slug', 'prueba-rls');
    return false;
  },
  'no sube imágenes': async () => {
    const ruta = `prueba-rls-${Date.now()}.png`;
    const r = await db.storage.from('imagenes').upload(ruta, new Blob(['x'], { type: 'image/png' }));
    if (r.error) return true;
    await db.storage.from('imagenes').remove([ruta]);
    return false;
  },
};

let fallas = 0;
for (const [nombre, prueba] of Object.entries(pruebas)) {
  const bien = await prueba().catch(() => false);
  if (!bien) fallas++;
  console.log(`${bien ? '✓' : '✗'} ${nombre}`);
}
if (fallas) {
  console.error(`\n${fallas} prueba(s) fallaron: revisa la migración y las políticas RLS antes de publicar.`);
  process.exit(1);
}
console.log('\nRLS en orden.');
