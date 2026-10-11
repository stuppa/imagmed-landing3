import { defineConfig } from 'drizzle-kit';

// SUPABASE_DB_URL (session pooler) solo hace falta para `pnpm db:migrar`; generar no toca la base.
try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/esquema.ts',
  // Prefijo «supabase» (AAAAMMDDHHMMSS_nombre.sql): la CLI de Supabase también entiende la carpeta.
  out: './supabase/migrations',
  migrations: { prefix: 'supabase' },
  // anon, authenticated y demás roles de Supabase ya existen: Drizzle no los administra.
  entities: { roles: { provider: 'supabase' } },
  dbCredentials: { url: process.env.SUPABASE_DB_URL ?? '' },
});
