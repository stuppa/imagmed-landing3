-- Custom SQL migration file, put your code below! --
-- Roles del equipo. Quien ya era admin (la cuenta inicial, creada con scripts/admin.mjs) queda como super admin.

update public.administradores a
set rol = 'super', correo = coalesce(u.email, '')
from auth.users u
where u.id = a.user_id;
--> statement-breakpoint

-- Rol de la sesión actual: «super», «miembro» o null (sin 2FA o fuera del equipo). La usan el middleware (RPC)
-- y la Edge Function «equipo» para decidir quién puede qué; la base es quien decide, no el código.
create function privado.mi_rol()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    return null;
  end if;
  return (select a.rol::text from public.administradores a where a.user_id = auth.uid());
end;
$$;
--> statement-breakpoint
revoke all on function privado.mi_rol() from public;
--> statement-breakpoint
grant execute on function privado.mi_rol() to authenticated;
--> statement-breakpoint

-- Las políticas RLS siguen usando es_admin(): cualquier rol del equipo edita el contenido.
create or replace function privado.es_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return privado.mi_rol() is not null;
end;
$$;
--> statement-breakpoint

-- El RPC pasa de «¿es admin?» a «¿qué rol tengo?».
drop function public.es_admin();
--> statement-breakpoint
create function public.mi_rol()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select privado.mi_rol();
$$;
--> statement-breakpoint
revoke all on function public.mi_rol() from public, anon;
--> statement-breakpoint
grant execute on function public.mi_rol() to authenticated;
