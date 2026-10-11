// Calculadora de retorno. Fórmula: ingreso = estudios × precio × días; meses = inversión / ingreso.
// Sin precios de equipos: la inversión la escribe el usuario.

export const seccionCalculadora = {
  etiqueta: 'Calculadora de retorno',
  titulo: 'Calcula en cuánto tiempo *se paga tu equipo*.',
  texto: 'Ajusta los valores a tu operación real y escribe la inversión que tienes contemplada.',
  nota: 'Estimación con tus propios datos. No incluye costos de operación ni constituye una promesa de resultados.',
  cta: 'Recibe esta proyección con tu cotización',
  formulario: 'Datos para la estimación',
};

export interface Control {
  etiqueta: string;
  min: number;
  max: number;
  /** Paso del control deslizante; el campo numérico acepta cualquier entero dentro del rango. */
  paso: number;
  inicial: number;
  prefijo?: string;
  /** Singular y plural para la fórmula visible. */
  unidad?: [string, string];
}

// Valores iniciales confirmados por el cliente como realistas; el usuario los ajusta.
export const controles: Record<'estudios' | 'precio' | 'dias', Control> = {
  estudios: { etiqueta: 'Estudios por día', min: 1, max: 60, paso: 1, inicial: 8, unidad: ['estudio', 'estudios'] },
  precio: { etiqueta: 'Precio por estudio (MXN)', min: 100, max: 5000, paso: 50, inicial: 800, prefijo: '$' },
  dias: { etiqueta: 'Días de operación al mes', min: 1, max: 31, paso: 1, inicial: 22, unidad: ['día', 'días'] },
};

export const inversion = {
  etiqueta: 'Inversión estimada (MXN)',
  ayuda: 'El monto que tienes contemplado para el equipo.',
  placeholder: 'Escribe el monto',
  max: 999_999_999,
};

export const resultados = {
  ingreso: 'Ingreso bruto mensual estimado',
  meses: 'Meses para recuperar tu inversión',
  mesesVacio: 'Escribe tu inversión estimada para calcularlo.',
  sinIngreso: 'Ajusta los valores para calcular tu ingreso.',
  conInversion: 'Con una inversión de {monto}.',
  sinDato: 'sin especificar',
  unidadMes: ['mes', 'meses'] as [string, string],
  // Barra fija en móvil mientras se ajustan los controles.
  resumenIngreso: 'Ingreso al mes',
  resumenMeses: 'Recuperas en',
};
