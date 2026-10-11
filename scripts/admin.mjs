// Recuperación y cuenta inicial del panel (para el desarrollador). Usa la secret key: córrelo solo en tu máquina.
//   node --env-file=.env scripts/admin.mjs crear correo@imagmed.mx       crea la cuenta inicial como super admin
//                                                                        (el resto del equipo se agrega desde /admin/equipo)
//   node --env-file=.env scripts/admin.mjs contrasena correo@imagmed.mx  le pone una contraseña nueva
//   node --env-file=.env scripts/admin.mjs quitar-2fa correo@imagmed.mx  perdió el celular: borra sus autenticadores
//                                                                        y cambia la contraseña
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
const [accion, correo] = process.argv.slice(2);
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Faltan SUPABASE_URL y SUPABASE_SECRET_KEY en .env (ver .env.example).');
  process.exit(1);
}
if (!['crear', 'contrasena', 'quitar-2fa'].includes(accion) || !correo?.includes('@')) {
  console.error('Uso: node --env-file=.env scripts/admin.mjs <crear|contrasena|quitar-2fa> <correo>');
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

function ok(r, que) {
  if (r.error) {
    console.error(`✗ ${que}: ${r.error.message}`);
    process.exit(1);
  }
  return r.data;
}

// 32 caracteres aleatorios con minúsculas, mayúsculas y dígitos (lo que exige la política de contraseñas).
function generarContrasena() {
  for (;;) {
    const c = randomBytes(24).toString('base64url');
    if (/[a-z]/.test(c) && /[A-Z]/.test(c) && /\d/.test(c)) return c;
  }
}

async function buscar() {
  const { users } = ok(await db.auth.admin.listUsers({ perPage: 1000 }), 'buscar usuario');
  const usuario = users.find((u) => u.email?.toLowerCase() === correo.toLowerCase());
  if (!usuario) {
    console.error(`✗ No existe la cuenta ${correo}.`);
    process.exit(1);
  }
  return usuario;
}

function mostrar(contrasena) {
  console.log(`\n  Contraseña: ${contrasena}\n`);
  console.log('  Guárdala en un gestor de contraseñas: no se vuelve a mostrar.');
}

if (accion === 'crear') {
  const contrasena = generarContrasena();
  const { user } = ok(
    await db.auth.admin.createUser({ email: correo, password: contrasena, email_confirm: true }),
    'crear cuenta',
  );
  ok(await db.from('administradores').insert({ user_id: user.id, correo, rol: 'super' }), 'marcar como super admin');
  console.log(`✓ Admin creado: ${correo}`);
  mostrar(contrasena);
  console.log('  Ahora entra a /admin/entrar y registra DE INMEDIATO la app autenticadora (2FA).');
} else if (accion === 'contrasena') {
  const usuario = await buscar();
  const contrasena = generarContrasena();
  ok(await db.auth.admin.updateUserById(usuario.id, { password: contrasena }), 'cambiar contraseña');
  console.log(`✓ Contraseña nueva para ${correo}`);
  mostrar(contrasena);
} else {
  const usuario = await buscar();
  const { factors } = ok(await db.auth.admin.mfa.listFactors({ userId: usuario.id }), 'leer autenticadores');
  for (const f of factors) ok(await db.auth.admin.mfa.deleteFactor({ userId: usuario.id, id: f.id }), 'borrar autenticador');
  // Sin 2FA, la contraseña sola daría acceso al registro de un autenticador nuevo: se cambia también.
  const contrasena = generarContrasena();
  ok(await db.auth.admin.updateUserById(usuario.id, { password: contrasena }), 'cambiar contraseña');
  console.log(`✓ ${factors.length} autenticador(es) borrado(s) y contraseña nueva para ${correo}`);
  mostrar(contrasena);
  console.log('  Al entrar, registrará su app autenticadora de nuevo.');
}
