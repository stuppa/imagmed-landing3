import { defineMiddleware } from 'astro:middleware';
import { clienteAdmin } from './lib/supabase';

// Rutas del admin que no exigen la sesión completa (contraseña + 2FA).
const SIN_SESION = new Set(['/admin/entrar']);
const SOLO_CONTRASENA = new Set(['/admin/verificar', '/admin/salir']);
// Vida máxima de una sesión, contada desde que se escribió la contraseña.
const MAX_SESION_S = 8 * 3600;

export const onRequest = defineMiddleware(async (ctx, next) => {
  const ruta = ctx.url.pathname.replace(/\/+$/, '');
  if (ruta !== '/admin' && !ruta.startsWith('/admin/')) return next();

  if (ctx.cache.enabled) ctx.cache.set(false);
  const supabase = clienteAdmin(ctx.request, ctx.cookies);
  ctx.locals.supabase = supabase;

  const respuesta = await (async () => {
    if (SIN_SESION.has(ruta)) return next();

    // getClaims valida la firma del JWT; nunca confiar en getSession del lado del servidor.
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims) return ctx.redirect('/admin/entrar');

    // amr trae la hora de cada método; si algún día llega sin hora, no se puede medir y no se corta.
    const contrasena = claims.amr?.find((m) => typeof m === 'object' && m.method === 'password');
    if (typeof contrasena === 'object' && Date.now() / 1000 - contrasena.timestamp > MAX_SESION_S) {
      await supabase.auth.signOut();
      return ctx.redirect('/admin/entrar?motivo=expirada');
    }
    if (SOLO_CONTRASENA.has(ruta)) return next();
    if (claims.aal !== 'aal2') return ctx.redirect('/admin/verificar');

    // Defensa en profundidad: además de 2FA, el usuario debe estar en el equipo (lo mismo que exige RLS).
    const { data: rol } = await supabase.rpc('mi_rol');
    if (rol !== 'super' && rol !== 'miembro') {
      await supabase.auth.signOut();
      return ctx.redirect('/admin/entrar?motivo=sin-permiso');
    }
    ctx.locals.rol = rol;
    // Solo el super admin administra el equipo (la Edge Function lo vuelve a comprobar).
    if (ruta.startsWith('/admin/equipo') && rol !== 'super') return ctx.redirect('/admin');
    return next();
  })();

  respuesta.headers.set('Cache-Control', 'no-store');
  respuesta.headers.set('X-Robots-Tag', 'noindex, nofollow');
  respuesta.headers.set('X-Frame-Options', 'DENY');
  respuesta.headers.set('Referrer-Policy', 'same-origin');
  return respuesta;
});
