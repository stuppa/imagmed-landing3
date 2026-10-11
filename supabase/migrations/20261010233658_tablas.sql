CREATE TYPE "public"."estado_producto" AS ENUM('publicado', 'agotado', 'oculto');--> statement-breakpoint
CREATE TABLE "administradores" (
	"user_id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "administradores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ajustes" (
	"id" boolean PRIMARY KEY DEFAULT true NOT NULL,
	"hero_producto_id" uuid,
	"hero_etiqueta" text DEFAULT '' NOT NULL,
	"hero_titulo" text DEFAULT '' NOT NULL,
	"hero_texto" text DEFAULT '' NOT NULL,
	"hero_rotulo_accesorio" text DEFAULT 'Transductor' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"whatsapp_mensaje" text DEFAULT '' NOT NULL,
	"telefono" text DEFAULT '' NOT NULL,
	"aviso_privacidad_url" text DEFAULT '' NOT NULL,
	"direccion" text DEFAULT '' NOT NULL,
	"horario" text DEFAULT '' NOT NULL,
	"google_maps_url" text DEFAULT '' NOT NULL,
	CONSTRAINT "ajustes_una_fila" CHECK (id),
	CONSTRAINT "ajustes_whatsapp_check" CHECK (whatsapp ~ '^(52[0-9]{10})?$')
);
--> statement-breakpoint
ALTER TABLE "ajustes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "campanas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fin" timestamp with time zone NOT NULL,
	"etiqueta" text DEFAULT '' NOT NULL,
	"titulo" text NOT NULL,
	"texto" text DEFAULT '' NOT NULL,
	"cta_principal" text DEFAULT 'Cotiza ahora' NOT NULL,
	"cta_secundario" text DEFAULT 'Solicita una demo' NOT NULL,
	"imagen" jsonb NOT NULL,
	"imagen_alt" text NOT NULL,
	"producto_id" uuid,
	CONSTRAINT "campanas_fechas_check" CHECK (fin > inicio),
	CONSTRAINT "campanas_nombre_check" CHECK (nombre <> ''),
	CONSTRAINT "campanas_titulo_check" CHECK (titulo <> ''),
	CONSTRAINT "campanas_imagen_alt_check" CHECK (imagen_alt <> '')
);
--> statement-breakpoint
ALTER TABLE "campanas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	CONSTRAINT "categorias_slug_unique" UNIQUE("slug"),
	CONSTRAINT "categorias_slug_check" CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "categorias_nombre_check" CHECK (nombre <> '')
);
--> statement-breakpoint
ALTER TABLE "categorias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "faq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pregunta" text NOT NULL,
	"respuesta" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "faq_pregunta_check" CHECK (pregunta <> '')
);
--> statement-breakpoint
ALTER TABLE "faq" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "marcas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"logo" jsonb,
	"orden" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "marcas_nombre_unique" UNIQUE("nombre"),
	CONSTRAINT "marcas_nombre_check" CHECK (nombre <> '')
);
--> statement-breakpoint
ALTER TABLE "marcas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "productos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nombre" text NOT NULL,
	"tipo" text DEFAULT '' NOT NULL,
	"categoria_id" uuid NOT NULL,
	"marca_id" uuid,
	"subtitulo" text DEFAULT '' NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"imagen" jsonb NOT NULL,
	"imagen_alt" text DEFAULT '' NOT NULL,
	"especificaciones" text[] DEFAULT '{}' NOT NULL,
	"especialidades" text[] DEFAULT '{}' NOT NULL,
	"incluye" text[] DEFAULT '{}' NOT NULL,
	"tecnologias" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"especificaciones_detalladas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"accesorios_titulo" text DEFAULT 'Transductores compatibles' NOT NULL,
	"accesorios" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estado" "estado_producto" DEFAULT 'oculto' NOT NULL,
	"destacado" boolean DEFAULT false NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"descuento_texto" text,
	"descuento_inicio" timestamp with time zone,
	"descuento_fin" timestamp with time zone,
	CONSTRAINT "productos_slug_unique" UNIQUE("slug"),
	CONSTRAINT "productos_slug_check" CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "productos_nombre_check" CHECK (nombre <> ''),
	CONSTRAINT "productos_descuento_check" CHECK (descuento_inicio is null or descuento_fin is null or descuento_fin > descuento_inicio)
);
--> statement-breakpoint
ALTER TABLE "productos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "administradores" ADD CONSTRAINT "administradores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajustes" ADD CONSTRAINT "ajustes_hero_producto_id_productos_id_fk" FOREIGN KEY ("hero_producto_id") REFERENCES "public"."productos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campanas" ADD CONSTRAINT "campanas_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_marca_id_marcas_id_fk" FOREIGN KEY ("marca_id") REFERENCES "public"."marcas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campanas_producto_idx" ON "campanas" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX "productos_categoria_idx" ON "productos" USING btree ("categoria_id");--> statement-breakpoint
CREATE INDEX "productos_marca_idx" ON "productos" USING btree ("marca_id");--> statement-breakpoint
CREATE POLICY "lectura publica" ON "ajustes" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "admin" ON "ajustes" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select privado.es_admin())) WITH CHECK ((select privado.es_admin()));--> statement-breakpoint
CREATE POLICY "lectura publica" ON "campanas" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (fin > now());--> statement-breakpoint
CREATE POLICY "admin" ON "campanas" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select privado.es_admin())) WITH CHECK ((select privado.es_admin()));--> statement-breakpoint
CREATE POLICY "lectura publica" ON "categorias" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (visible);--> statement-breakpoint
CREATE POLICY "admin" ON "categorias" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select privado.es_admin())) WITH CHECK ((select privado.es_admin()));--> statement-breakpoint
CREATE POLICY "lectura publica" ON "faq" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "admin" ON "faq" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select privado.es_admin())) WITH CHECK ((select privado.es_admin()));--> statement-breakpoint
CREATE POLICY "lectura publica" ON "marcas" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "admin" ON "marcas" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select privado.es_admin())) WITH CHECK ((select privado.es_admin()));--> statement-breakpoint
CREATE POLICY "lectura publica" ON "productos" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (estado <> 'oculto');--> statement-breakpoint
CREATE POLICY "admin" ON "productos" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select privado.es_admin())) WITH CHECK ((select privado.es_admin()));