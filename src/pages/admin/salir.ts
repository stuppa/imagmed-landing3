import type { APIRoute } from 'astro';

// Cierra la sesión en todos los dispositivos (scope global por defecto).
export const POST: APIRoute = async ({ locals, redirect }) => {
  await locals.supabase.auth.signOut();
  return redirect('/admin/entrar', 303);
};
