// Despliega la Edge Function «equipo» (supabase/functions) al proyecto del .env, sin Docker.
// Uso: pnpm funciones   (necesita SUPABASE_URL y SUPABASE_ACCESS_TOKEN en .env)
import { execFileSync } from 'node:child_process';

const { SUPABASE_URL, SUPABASE_ACCESS_TOKEN } = process.env;
if (!SUPABASE_URL || !SUPABASE_ACCESS_TOKEN) {
  console.error('Faltan SUPABASE_URL y SUPABASE_ACCESS_TOKEN en .env (ver .env.example).');
  process.exit(1);
}
const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
execFileSync('npx', ['-y', 'supabase@2.118.0', 'functions', 'deploy', 'equipo', '--use-api', '--project-ref', ref], {
  stdio: 'inherit',
});
