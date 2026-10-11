declare namespace App {
  interface Locals {
    /** Contenido público; lo carga cada página (prepararPagina) o la vista previa del admin. */
    sitio: import('./lib/sitio').Sitio;
    /** Cliente con la sesión del admin; solo existe en /admin (middleware). */
    supabase: import('./lib/supabase').Supabase;
    /** Rol en el equipo de la sesión del admin (middleware); «super» además administra el equipo. */
    rol: 'super' | 'miembro';
  }
}
