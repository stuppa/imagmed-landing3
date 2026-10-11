-- Custom SQL migration file, put your code below! --
-- Lo que el esquema de Drizzle no expresa: EXCLUDE, la fila única de ajustes, permisos y Storage.

-- Nunca dos campañas al mismo tiempo: así no hay que decidir cuál gana.
alter table public.campanas
  add constraint campanas_sin_traslape exclude using gist (tstzrange(inicio, fin) with &&);
--> statement-breakpoint

insert into public.ajustes default values;
--> statement-breakpoint

-- Permisos de tabla (las filas las filtra RLS). En proyectos nuevos las tablas ya no se exponen solas a la
-- Data API; en los antiguos se otorga todo por defecto (incluido TRUNCATE, que RLS no filtra). Por eso primero
-- se quita todo y luego se da solo lo necesario.
revoke all
  on public.categorias, public.marcas, public.productos, public.campanas, public.ajustes, public.faq
  from anon, authenticated;
--> statement-breakpoint
grant select on public.categorias, public.marcas, public.productos, public.campanas, public.ajustes, public.faq to anon;
--> statement-breakpoint
grant select, insert, update, delete
  on public.categorias, public.marcas, public.productos, public.campanas, public.ajustes, public.faq
  to authenticated, service_role;
--> statement-breakpoint
revoke all on public.administradores from anon, authenticated;
--> statement-breakpoint
grant select, insert, update, delete on public.administradores to service_role;
--> statement-breakpoint

-- Imágenes: bucket público para leer; subir y borrar solo el admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', true, 4194304, array['image/png', 'image/jpeg', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
--> statement-breakpoint
create policy "admin sube imagenes" on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and (select privado.es_admin()));
--> statement-breakpoint
create policy "admin ve imagenes" on storage.objects for select to authenticated
  using (bucket_id = 'imagenes' and (select privado.es_admin()));
--> statement-breakpoint
create policy "admin borra imagenes" on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and (select privado.es_admin()));
