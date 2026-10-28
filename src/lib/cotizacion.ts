// Formulario de contacto → correo para ventas. Repite las reglas del navegador: cualquiera puede mandar el POST directo.
// Aquí se validan y preparan los datos; el diseño del correo está en src/emails/Cotizacion.tsx (React Email).
import { formulario } from '../data/contacto.ts';

const MAXIMOS = { nombre: 120, telefono: 30, correo: 200, equipo: 200, cuando: 100, solicitud: 40, proyeccion: 1000 };
type Campo = keyof typeof MAXIMOS;

// Los correos necesitan URLs absolutas: el logo (public/) y la foto del equipo salen del sitio en producción.
export const ORIGEN = 'https://imagmed.com';

export interface DatosCorreo {
  solicitud: string;
  nombre: string;
  telefono: string;
  correo: string;
  equipo: string;
  cuando: string;
  proyeccion: string[];
  fecha: string;
  foto?: string;
  urgente: boolean;
  mailto: string;
  whatsapp: string;
  tel: string;
}

export interface Correo {
  asunto: string;
  texto: string;
  datos: DatosCorreo;
  responderA: string;
}

/**
 * `bot`: llenó la trampa (se le responde que sí, pero no se envía). `invalido`: falta un dato o no tiene forma.
 * `foto`: URL de la foto del equipo, si eligió uno del catálogo.
 */
export function armarCorreo(f: FormData, foto?: string, ahora = new Date()): Correo | 'bot' | 'invalido' {
  if (f.get('sitio_web')) return 'bot';
  const d = {} as Record<Campo, string>;
  for (const k of Object.keys(MAXIMOS) as Campo[]) {
    d[k] = String(f.get(k) ?? '').trim();
    if (d[k].length > MAXIMOS[k]) return 'invalido';
  }
  const digitos = d.telefono.replace(/\D/g, '');
  if (
    d.nombre.length < 3 ||
    !/^[\d\s()+-]+$/.test(d.telefono) ||
    digitos.length < 10 ||
    digitos.length > 13 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo) ||
    !d.equipo ||
    !d.cuando
  ) {
    return 'invalido';
  }
  const solicitud = d.solicitud || 'Cotización';
  const proyeccion = d.proyeccion ? d.proyeccion.split('; ') : [];
  const unaLinea = (s: string) => s.replace(/\s+/g, ' ');
  const asunto = unaLinea(`${solicitud}: ${d.equipo} — ${d.nombre}`);
  const fecha = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(ahora);
  // 10 dígitos = número mexicano sin lada de país.
  const internacional = digitos.length === 10 ? `52${digitos}` : digitos;

  return {
    asunto,
    texto: [
      `Nueva solicitud desde el sitio web (${solicitud}).`,
      '',
      `Nombre: ${d.nombre}`,
      `Teléfono: ${d.telefono}`,
      `Correo: ${d.correo}`,
      `Equipo: ${d.equipo}`,
      `¿Cuándo lo necesita?: ${d.cuando}`,
      ...(proyeccion.length ? ['', 'Proyección de la calculadora:', ...proyeccion] : []),
      '',
      `Llegó el ${fecha} (hora del centro de México). Responde este correo para escribirle directo al cliente.`,
    ].join('\n'),
    datos: {
      ...d,
      solicitud,
      proyeccion,
      fecha,
      foto,
      urgente: d.cuando === formulario.cuando[0],
      mailto: `mailto:${d.correo}?subject=${encodeURIComponent(`${solicitud} de ${d.equipo} — IMAGMED NACIONAL`)}`,
      whatsapp: `https://wa.me/${internacional}`,
      tel: `tel:+${internacional}`,
    },
    responderA: d.correo,
  };
}
