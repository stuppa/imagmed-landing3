import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import { SUPABASE_KEY, SUPABASE_URL } from 'astro:env/server';

export type Supabase = SupabaseClient;

/** Lecturas públicas: sin cookies ni sesión, para que la respuesta se pueda guardar en el CDN. */
export const clientePublico = (): Supabase =>
  createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

/**
 * Sesión del admin. Las cookies son httpOnly y solo viajan a /admin: el navegador nunca toca Supabase
 * y las páginas públicas (cacheadas) jamás reciben ni escriben una sesión.
 */
export const clienteAdmin = (request: Request, cookies: AstroCookies): Supabase =>
  createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () =>
        parseCookieHeader(request.headers.get('Cookie') ?? '').map(({ name, value }) => ({ name, value: value ?? '' })),
      setAll: (lista) =>
        lista.forEach(({ name, value, options }) =>
          cookies.set(name, value, { ...options, path: '/admin', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'lax' }),
        ),
    },
  });

export const BUCKET = 'imagenes';
export const urlImagen = (ruta: string) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${ruta}`;
