// Equipo del panel admin: listar, agregar (correo + contraseña), cambiar rol, nueva contraseña, restablecer 2FA y quitar.
// Solo obedece al super admin con 2FA, y quien lo decide es la base (public.mi_rol() con el JWT de quien llama).
// La llave secreta vive aquí, dentro de Supabase: Vercel nunca la tiene.
// Desplegar: ver supabase/LEEME.md («Equipo»).
import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const URL_SUPABASE = Deno.env.get('SUPABASE_URL')!;
// Llaves nuevas (JSON con «default») o, si el proyecto aún usa las legacy, anon/service_role.
const llave = (nueva: string, legacy: string) => {
  const json = Deno.env.get(nueva);
  return (json && JSON.parse(json).default) || Deno.env.get(legacy)!;
};
const PUBLICA = llave('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY');
const SECRETA = llave('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY');
const sinSesion = { persistSession: false, autoRefreshToken: false };
const admin = createClient(URL_SUPABASE, SECRETA, { auth: sinSesion });

const ROLES = ['super', 'miembro'];
const responder = (cuerpo: unknown, status = 200) => Response.json(cuerpo, { status });
const fallo = (mensaje: string, status = 400) => responder({ error: mensaje }, status);
// La misma política que la de contraseñas del proyecto: 16+ con minúsculas, mayúsculas y dígitos.
const contrasenaValida = (c: unknown) =>
  typeof c === 'string' && c.length >= 16 && /[a-z]/.test(c) && /[A-Z]/.test(c) && /\d/.test(c);
const CONTRASENA_DEBIL = 'La contraseña debe tener al menos 16 caracteres, con minúsculas, mayúsculas y números.';

async function miembros() {
  const { data, error } = await admin.from('administradores').select('user_id, correo, rol, creado').order('creado');
  if (error) throw error;
  return data as { user_id: string; correo: string; rol: string; creado: string }[];
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return fallo('Método no permitido.', 405);
  const authorization = req.headers.get('Authorization') ?? '';

  // Quien llama: la base valida su JWT y decide su rol (2FA + tabla administradores).
  const usuario = createClient(URL_SUPABASE, PUBLICA, { auth: sinSesion, global: { headers: { Authorization: authorization } } });
  const { data: rol } = await usuario.rpc('mi_rol');
  if (rol !== 'super') return fallo('Solo el super admin puede administrar el equipo.', 403);
  const { data: sesion } = await usuario.auth.getClaims(authorization.replace(/^Bearer\s+/i, ''));
  const yo = sesion?.claims.sub;
  if (!yo) return fallo('Sesión inválida.', 401);

  const c = await req.json().catch(() => ({}));
  try {
    const equipo = await miembros();
    const objetivo = equipo.find((m) => m.user_id === c.id);
    const supers = equipo.filter((m) => m.rol === 'super').length;

    switch (c.accion) {
      case 'listar': {
        const lista = await Promise.all(
          equipo.map(async (m) => {
            const [{ data: u }, { data: f }] = await Promise.all([
              admin.auth.admin.getUserById(m.user_id),
              admin.auth.admin.mfa.listFactors({ userId: m.user_id }),
            ]);
            return {
              id: m.user_id,
              correo: m.correo || u.user?.email || '',
              rol: m.rol,
              creado: m.creado,
              ultimoAcceso: u.user?.last_sign_in_at ?? null,
              dosPasos: (f?.factors ?? []).some((x) => x.status === 'verified'),
              yo: m.user_id === yo,
            };
          }),
        );
        return responder({ miembros: lista });
      }

      case 'crear': {
        const correo = String(c.correo ?? '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return fallo('Escribe un correo válido.');
        if (!ROLES.includes(c.rol)) return fallo('Elige un rol.');
        if (!contrasenaValida(c.contrasena)) return fallo(CONTRASENA_DEBIL);
        const { data, error } = await admin.auth.admin.createUser({ email: correo, password: c.contrasena, email_confirm: true });
        if (error || !data.user) {
          return fallo(/already|registered|exists/i.test(error?.message ?? '') ? 'Ya existe una cuenta con ese correo.' : `No se pudo crear la cuenta: ${error?.message}`);
        }
        const { error: e } = await admin.from('administradores').insert({ user_id: data.user.id, correo, rol: c.rol });
        if (e) {
          await admin.auth.admin.deleteUser(data.user.id);
          throw e;
        }
        return responder({ ok: true });
      }

      case 'contrasena': {
        if (!objetivo) return fallo('Ese miembro no existe.', 404);
        if (!contrasenaValida(c.contrasena)) return fallo(CONTRASENA_DEBIL);
        const { error } = await admin.auth.admin.updateUserById(objetivo.user_id, { password: c.contrasena });
        if (error) throw error;
        return responder({ ok: true });
      }

      case 'rol': {
        if (!objetivo) return fallo('Ese miembro no existe.', 404);
        if (!ROLES.includes(c.rol)) return fallo('Elige un rol.');
        if (objetivo.user_id === yo) return fallo('No puedes cambiar tu propio rol; pídeselo a otro super admin.');
        const { error } = await admin.from('administradores').update({ rol: c.rol }).eq('user_id', objetivo.user_id);
        if (error) throw error;
        return responder({ ok: true });
      }

      case 'quitar-2fa': {
        if (!objetivo) return fallo('Ese miembro no existe.', 404);
        const { data } = await admin.auth.admin.mfa.listFactors({ userId: objetivo.user_id });
        for (const f of data?.factors ?? []) {
          const { error } = await admin.auth.admin.mfa.deleteFactor({ userId: objetivo.user_id, id: f.id });
          if (error) throw error;
        }
        return responder({ ok: true });
      }

      case 'quitar': {
        if (!objetivo) return fallo('Ese miembro no existe.', 404);
        if (objetivo.user_id === yo) return fallo('No puedes quitarte a ti mismo.');
        if (objetivo.rol === 'super' && supers <= 1) return fallo('Debe quedar al menos un super admin.');
        // Borra la cuenta; su fila en administradores se va por la FK (on delete cascade) y pierde el acceso al instante.
        const { error } = await admin.auth.admin.deleteUser(objetivo.user_id);
        if (error) throw error;
        return responder({ ok: true });
      }

      default:
        return fallo('Acción desconocida.');
    }
  } catch (e) {
    console.error(e);
    return fallo('Algo falló en el servidor del equipo. Intenta de nuevo.', 500);
  }
});
