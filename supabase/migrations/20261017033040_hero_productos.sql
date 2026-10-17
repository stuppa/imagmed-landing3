ALTER TABLE "ajustes" ADD COLUMN "hero_productos" uuid[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
-- El producto que ya estaba en el hero es el primero de la rotación. La columna vieja se borra cuando este cambio esté
-- en producción: el deploy anterior aún la lee.
UPDATE "ajustes" SET "hero_productos" = ARRAY["hero_producto_id"] WHERE "hero_producto_id" IS NOT NULL;