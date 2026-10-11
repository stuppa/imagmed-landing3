-- Custom SQL migration file, put your code below! --
-- Va antes que las tablas porque sus políticas RLS usan privado.es_admin().

create schema if not exists privado;
--> statement-breakpoint

-- Admin = sesión con 2FA (aal2) + estar en public.administradores. SECURITY DEFINER solo para leer
-- administradores; vive en un esquema no expuesto y no recibe parámetros. Es plpgsql para poder crearla
-- antes que la tabla (el cuerpo se valida al ejecutarse).
create function privado.es_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (select 1 from public.administradores a where a.user_id = auth.uid());
end;
$$;
--> statement-breakpoint
revoke all on function privado.es_admin() from public;
--> statement-breakpoint
grant usage on schema privado to authenticated;
--> statement-breakpoint
grant execute on function privado.es_admin() to authenticated;
--> statement-breakpoint

-- Para que el middleware pregunte «¿esta sesión es admin?» vía RPC.
create function public.es_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select privado.es_admin();
$$;
--> statement-breakpoint
revoke all on function public.es_admin() from public, anon;
--> statement-breakpoint
grant execute on function public.es_admin() to authenticated;
