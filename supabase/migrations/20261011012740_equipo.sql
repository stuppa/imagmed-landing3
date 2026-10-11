CREATE TYPE "public"."rol_miembro" AS ENUM('super', 'miembro');--> statement-breakpoint
ALTER TABLE "administradores" ADD COLUMN "correo" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "administradores" ADD COLUMN "rol" "rol_miembro" DEFAULT 'miembro' NOT NULL;--> statement-breakpoint
ALTER TABLE "administradores" ADD COLUMN "creado" timestamp with time zone DEFAULT now() NOT NULL;