// Volumen 4D de partículas del hero: el sector convexo de la pantalla del MX3 (abanico de 70°, vértice en la cara
// del transductor, profundidad hacia abajo) extruido ±27° en elevación y lleno de speckle. Dentro, un riñón
// (cápsula elipsoidal con el seno ramificado) como el de la imagen del equipo. Un corte recorre la elevación y
// enciende los puntos cercanos: la imagen 2D dentro del volumen.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
} from 'three';
import type { CrearEscena } from '../escena3d';

const GRADO = Math.PI / 180;
const ABANICO = 35 * GRADO; // medio ángulo lateral
const ELEVACION = 27 * GRADO; // medio ángulo de elevación
const R0 = 18 / 160; // cara del transductor, mismas proporciones que el abanico SVG (radio exterior = 1)
const CENTRO_Y = -0.56; // pivote de giro: centro aproximado del volumen
const CORTE_MAX = 25 * GRADO; // ±25° y no ±27°: el corte nunca se detiene sobre una cara
const FOV = 28;

// Intro (s): convergen los puntos, el corte barre una vez y entra el control por puntero/scroll.
const CONVERGER = 1.6;
const BARRIDO = [1.0, 3.1] as const;
const FIN = 3.6;
// El respaldo CSS empieza a moverse a los 0.5 s de cargar y la intro 3D lo releva: entre los dos no pasan de
// 5 s de movimiento automático (WCAG 2.2.2). Si el 3D llega tarde, la intro se acelera para caber antes de LIMITE,
// y con menos de MINIMO segundos disponibles el volumen aparece ya formado.
const LIMITE = 5.5;
const MINIMO = 1.8;

// Colores en sRGB tal cual (el shader no convierte): --color-marca, --color-marca-claro y blanco.
const PALETA = /* glsl */ `
  const vec3 MARCA = vec3(0.0, 0.4, 0.867);
  const vec3 CLARO = vec3(0.3, 0.58, 0.907);
  const vec3 BLANCO = vec3(1.0);
`;

const limitar01 = (v: number) => Math.min(1, Math.max(0, v));
const suave = (v: number) => {
  const x = limitar01(v);
  return x * x * (3 - 2 * x);
};

// Pseudoaleatorio con semilla (mulberry32): el mismo volumen en cada visita.
function azar(semilla: number) {
  return () => {
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Punto del sector: radio r, ángulo lateral th y elevación fi (giro sobre el eje lateral que pasa por el vértice). */
const enSector = (r: number, th: number, fi: number): [number, number, number] => {
  const y = -r * Math.cos(th);
  return [r * Math.sin(th), y * Math.cos(fi), y * Math.sin(fi)];
};

function crearPuntos(total: number) {
  const rnd = azar(7);
  const pos: number[] = [];
  const datos: number[] = []; // brillo, elevación, tamaño, retraso de la intro
  const agregar = (p: [number, number, number], brillo: number, tam: number) => {
    const r = Math.hypot(p[0], p[1], p[2]);
    pos.push(...p);
    // Elevación inversa de enSector (y < 0 dentro del abanico): igual al giro del corte que pasa por el punto.
    datos.push(Math.min(1, brillo), Math.atan2(-p[2], -p[1]), tam, ((r - R0) / (1 - R0)) * 0.75 + rnd() * 0.25);
  };
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());

  // Riñón: elipsoide inclinado a media profundidad, con el hilio hacia el transductor.
  const RINON = { c: enSector(0.6, -8 * GRADO, 2 * GRADO), ejes: [0.25, 0.13, 0.17], giro: -14 * GRADO };
  const cg = Math.cos(RINON.giro);
  const sg = Math.sin(RINON.giro);
  const aMundo = (q: [number, number, number]): [number, number, number] => {
    const x = q[0] * RINON.ejes[0]!;
    const y = q[1] * RINON.ejes[1]!;
    return [RINON.c[0] + x * cg - y * sg, RINON.c[1] + x * sg + y * cg, RINON.c[2] + q[2] * RINON.ejes[2]!];
  };
  const aLocal = (p: [number, number, number]) => {
    const x = p[0] - RINON.c[0];
    const y = p[1] - RINON.c[1];
    return Math.hypot(
      (x * cg + y * sg) / RINON.ejes[0]!,
      (-x * sg + y * cg) / RINON.ejes[1]!,
      (p[2] - RINON.c[2]) / RINON.ejes[2]!,
    );
  };

  const nCapsula = Math.round(total * 0.1);
  const nRamas = Math.round(total * 0.05);
  const nSeno = Math.round(total * 0.025);
  const nCapas = Math.round(total * 0.06);
  const nSpeckle = total - nCapsula - nRamas - nSeno - nCapas;

  // Cápsula: cáscara brillante con la muesca del hilio (forma de frijol).
  for (let i = 0; i < nCapsula; i++) {
    let d: [number, number, number] = [gauss(), gauss(), gauss()];
    const m = Math.hypot(...d) || 1;
    d = [d[0] / m, d[1] / m, d[2] / m];
    const muesca = Math.max(0, (d[1] - 0.55) / 0.45);
    const e = 1 + (rnd() - 0.5) * 0.05;
    agregar(aMundo([d[0] * e, (d[1] - muesca * muesca * 0.9) * e, d[2] * e]), 0.55 + rnd() * 0.25, 0.012);
  }

  // Seno renal: grasa ecogénica al centro y ramas desde el hilio hacia los polos.
  for (let i = 0; i < nSeno; i++) {
    const r = Math.cbrt(rnd()) * 0.45;
    let d: [number, number, number] = [gauss(), gauss(), gauss()];
    const m = Math.hypot(...d) || 1;
    agregar(aMundo([(d[0] / m) * r, 0.1 + (d[1] / m) * r * 0.55, (d[2] / m) * r * 0.8]), 0.25 + rnd() * 0.2, 0.011);
  }
  const curvas: [number, number, number][][] = [];
  const hilio: [number, number, number] = [0.04, 0.72, 0];
  const centro: [number, number, number] = [0, 0.12, 0];
  curvas.push([hilio, [0.03, 0.42, 0], centro]);
  for (let k = 0; k < 6; k++) {
    const b = k * (Math.PI / 3) + 0.26;
    const fin: [number, number, number] = [Math.cos(b) * 0.78, -0.1 + rnd() * 0.15, Math.sin(b) * 0.62];
    const medio: [number, number, number] = [fin[0] * 0.45, 0.2, fin[2] * 0.4];
    curvas.push([centro, medio, fin]);
    // Dos ramillas desde el 60 % de la rama.
    for (const lado of [-1, 1]) {
      const desde: [number, number, number] = [fin[0] * 0.62, 0.02, fin[2] * 0.6];
      curvas.push([
        desde,
        [fin[0] * 0.8 + lado * 0.08, -0.05 + lado * 0.06, fin[2] * 0.8 - lado * 0.08],
        [fin[0] * 0.95 + lado * 0.14, -0.15 + lado * 0.12, fin[2] * 0.95 - lado * 0.16],
      ]);
    }
  }
  for (let i = 0; i < nRamas; i++) {
    const [a, b, c] = curvas[i % curvas.length]!;
    const u = rnd();
    const v = 1 - u;
    const q: [number, number, number] = [0, 0, 0];
    for (let j = 0; j < 3; j++) q[j] = v * v * a[j]! + 2 * v * u * b[j]! + u * u * c[j]! + gauss() * 0.025;
    agregar(aMundo(q), 0.5 + rnd() * 0.2, 0.012);
  }

  // Capas de tejido superficial: arcos ecogénicos cerca del transductor, como en la imagen del monitor.
  for (let i = 0; i < nCapas; i++) {
    const th = (rnd() * 2 - 1) * ABANICO;
    const fi = (rnd() * 2 - 1) * ELEVACION;
    const capa = rnd() < 0.55 ? 0.24 : 0.34;
    const r = capa + Math.sin(th * 9 + fi * 5) * 0.008 + gauss() * 0.004;
    agregar(enSector(r, th, fi), 0.45 + rnd() * 0.35, 0.011);
  }

  // Speckle: uniforme en volumen (r ∝ raíz cúbica), brillo de Rayleigh modulado por "textura" de tejido.
  for (let i = 0; i < nSpeckle; i++) {
    const r = Math.cbrt(rnd() * (1 - R0 ** 3) + R0 ** 3);
    const p = enSector(r, (rnd() * 2 - 1) * ABANICO, (rnd() * 2 - 1) * ELEVACION);
    const dentro = aLocal(p) < 0.97;
    if (dentro && rnd() < 0.6) continue; // corteza hipoecoica: el riñón se lee por contraste
    const textura = 0.6 + 0.4 * Math.sin(p[0] * 13 + 1) * Math.sin(p[1] * 11 + 2) * Math.sin(p[2] * 15 + 3);
    const rayleigh = Math.sqrt(-2 * Math.log(1 - rnd())) * 0.38;
    agregar(p, rayleigh * textura * (1 - 0.3 * r) * (dentro ? 0.6 : 1), 0.008 + rnd() * 0.004);
  }

  const n = pos.length / 3;
  // Origen de la intro: el volumen dilatado y revuelto; converge hacia su forma, primero lo superficial.
  const origen = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const f = 1.5 + rnd() * 0.6;
    origen[i * 3] = pos[i * 3]! * f + gauss() * 0.12;
    origen[i * 3 + 1] = CENTRO_Y + (pos[i * 3 + 1]! - CENTRO_Y) * f + gauss() * 0.12;
    origen[i * 3 + 2] = pos[i * 3 + 2]! * f + gauss() * 0.12;
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('aOrigen', new BufferAttribute(origen, 3));
  g.setAttribute('aDatos', new BufferAttribute(new Float32Array(datos), 4));
  return g;
}

/** Aristas del volumen: contorno de las dos caras extremas, arcos de elevación en las esquinas y la cruz de la cara exterior. */
function crearAristas() {
  const v: number[] = [];
  const curva = (f: (u: number) => [number, number, number], pasos: number) => {
    for (let i = 0; i < pasos; i++) v.push(...f(i / pasos), ...f((i + 1) / pasos));
  };
  for (const fi of [-ELEVACION, ELEVACION]) {
    curva((u) => enSector(R0, (u * 2 - 1) * ABANICO, fi), 8);
    curva((u) => enSector(1, (u * 2 - 1) * ABANICO, fi), 32);
    for (const th of [-ABANICO, ABANICO]) curva((u) => enSector(R0 + u * (1 - R0), th, fi), 1);
  }
  for (const r of [R0, 1]) {
    for (const th of [-ABANICO, ABANICO]) curva((u) => enSector(r, th, (u * 2 - 1) * ELEVACION), 16);
  }
  curva((u) => enSector(1, 0, (u * 2 - 1) * ELEVACION), 16);
  curva((u) => enSector(1, (u * 2 - 1) * ABANICO, 0), 32);
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(v), 3));
  return g;
}

/** Contorno del corte (en el plano xy) y sus líneas de barrido a ±12° y ±24°, como el corte activo del SVG. */
function crearContornoCorte() {
  const v: number[] = [];
  const curva = (f: (u: number) => [number, number, number], pasos: number) => {
    for (let i = 0; i < pasos; i++) v.push(...f(i / pasos), ...f((i + 1) / pasos));
  };
  curva((u) => enSector(R0, (u * 2 - 1) * ABANICO, 0), 8);
  curva((u) => enSector(1, (u * 2 - 1) * ABANICO, 0), 32);
  for (const th of [-ABANICO, ABANICO]) curva((u) => enSector(R0 + u * (1 - R0), th, 0), 1);
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(v), 3));
  const b: number[] = [];
  for (const th of [-24, -12, 12, 24]) b.push(...enSector(R0, th * GRADO, 0), ...enSector(1, th * GRADO, 0));
  const lineas = new BufferGeometry();
  lineas.setAttribute('position', new BufferAttribute(new Float32Array(b), 3));
  return [g, lineas] as const;
}

const aditivo = { transparent: true, depthWrite: false, blending: AdditiveBlending, premultipliedAlpha: true } as const;

/** Rampa del corte: -1 → 1 → 0 con las mismas pausas que la animación CSS (22 % y 78 %). */
function barrido(u: number) {
  if (u < 0.22) return -suave(u / 0.22);
  if (u < 0.78) return -1 + 2 * suave((u - 0.22) / 0.56);
  return 1 - suave((u - 0.78) / 0.22);
}

export const crear: CrearEscena = (renderer, contenedor) => {
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 20);

  // ponytail: el número de puntos se fija al crear la escena (según el tamaño del contenedor); no se regenera al redimensionar.
  const caja = contenedor.getBoundingClientRect();
  const total = Math.round(Math.min(14000, Math.max(6000, (caja.width * caja.height) / 7)));

  const puntos = new ShaderMaterial({
    ...aditivo,
    uniforms: {
      uIntro: { value: 0 },
      uCorte: { value: 0 },
      uLuz: { value: 0 },
      uEscala: { value: 400 },
      uMinimo: { value: 1.2 },
      uNiebla: { value: [3, 4.4] },
    },
    vertexShader: /* glsl */ `
      uniform float uIntro;
      uniform float uCorte;
      uniform float uLuz;
      uniform float uEscala;
      uniform float uMinimo;
      uniform vec2 uNiebla;
      attribute vec3 aOrigen;
      attribute vec4 aDatos; // brillo, elevación, tamaño, retraso
      varying float vBrillo;
      varying float vCorte;
      void main() {
        float k = clamp((uIntro - aDatos.w * 0.45) / 0.55, 0.0, 1.0);
        k = 1.0 - pow(1.0 - k, 3.0);
        vec4 mv = modelViewMatrix * vec4(mix(aOrigen, position, k), 1.0);
        float z = -mv.z;
        // Profundidad: lo cercano brilla más que lo lejano.
        float cerca = mix(0.3, 1.0, smoothstep(uNiebla.y, uNiebla.x, z));
        float d = (aDatos.y - uCorte) / 0.04;
        vCorte = exp(-d * d) * uLuz;
        vBrillo = aDatos.x * cerca * k * k;
        gl_PointSize = max(aDatos.z * (1.0 + 0.4 * vCorte) * uEscala / z, uMinimo);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      ${PALETA}
      varying float vBrillo;
      varying float vCorte;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float d = dot(q, q) * 4.0;
        float disco = clamp(1.0 - d, 0.0, 1.0);
        // El corte aclara el color y suma poca opacidad: así no se satura al apilarse.
        float b = clamp(vBrillo + 0.5 * vCorte, 0.0, 1.0);
        vec3 color = b < 0.5 ? mix(MARCA, CLARO, b * 2.0) : mix(CLARO, BLANCO, b * 2.0 - 1.0);
        float a = disco * disco * min(1.0, vBrillo * (1.0 + 0.5 * vCorte) + 0.18 * vCorte);
        gl_FragColor = vec4(color * a, a);
      }
    `,
  });

  const corteRelleno = new ShaderMaterial({
    ...aditivo,
    side: DoubleSide,
    uniforms: { uLuz: { value: 0 } },
    vertexShader: /* glsl */ `
      varying float vR;
      void main() {
        vR = length(position.xy);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    // El haz se atenúa con la profundidad, como el degradado del corte SVG.
    fragmentShader: /* glsl */ `
      ${PALETA}
      uniform float uLuz;
      varying float vR;
      void main() {
        float a = mix(0.3, 0.03, smoothstep(${R0.toFixed(4)}, 1.0, vR)) * uLuz;
        gl_FragColor = vec4(MARCA * a, a);
      }
    `,
  });
  const aristasMat = new LineBasicMaterial({ ...aditivo, color: 0x4d94e7, opacity: 0 });
  const corteBorde = new LineBasicMaterial({ ...aditivo, color: 0x4d94e7, opacity: 0 });
  const corteLineas = new LineBasicMaterial({ ...aditivo, color: 0x4d94e7, opacity: 0 });

  const volumen = new Group(); // pivote en el centro del volumen
  const contenido = new Group();
  contenido.position.y = -CENTRO_Y;
  volumen.add(contenido);
  scene.add(volumen);

  contenido.add(new Points(crearPuntos(total), puntos));
  contenido.add(new LineSegments(crearAristas(), aristasMat));
  const corte = new Group();
  const [contorno, lineas] = crearContornoCorte();
  corte.add(new Mesh(new RingGeometry(R0, 1, 40, 6, -90 * GRADO - ABANICO, 2 * ABANICO), corteRelleno));
  corte.add(new LineSegments(contorno, corteBorde));
  corte.add(new LineSegments(lineas, corteLineas));
  contenido.add(corte);

  // Pose de reposo: tres cuartos desde arriba, con el vértice (transductor) arriba y el abanico abriéndose
  // hacia la izquierda de la tapa del equipo, donde el PNG tiene hueco.
  const POSE = { x: 0.32, y: -0.62, z: -0.12 };
  volumen.position.set(-0.06, 0.1, 0);
  // ponytail: se mide contra la carga de la página; si el hero estaba fuera de pantalla al cargar, tampoco hay intro.
  const disponible = Math.min(FIN, LIMITE - performance.now() / 1000);
  const ritmo = disponible >= MINIMO ? FIN / disponible : 0; // 0: sin intro
  let salida = 0;
  let inicio = -1; // reloj de pared de la intro: e.t se frena con fps bajos y rompería el tope de 5 s (WCAG 2.2.2)
  let fondo = 1; // borde inferior del contenedor en coordenadas del documento (se mide al redimensionar)

  return {
    scene,
    camera,
    redimensionar(ancho, alto) {
      const dpr = renderer.getPixelRatio();
      puntos.uniforms.uEscala!.value = (alto * dpr) / (2 * Math.tan((FOV * GRADO) / 2));
      puntos.uniforms.uMinimo!.value = 1.2 * dpr;
      // Contenedor más angosto que alto: la cámara se aleja para que el volumen quepa a lo ancho.
      const distancia = 3 * Math.max(1, 0.9 / (ancho / alto));
      camera.position.set(0, 0, distancia);
      puntos.uniforms.uNiebla!.value = [distancia - 0.7, distancia + 0.8];
      fondo = Math.max(1, contenedor.getBoundingClientRect().bottom + scrollY);
    },
    actualizar(e) {
      if (e.movimiento && inicio < 0) inicio = performance.now();
      const t = e.movimiento && ritmo ? Math.min(FIN, ((performance.now() - inicio) / 1000) * ritmo) : FIN;
      // 0 con la página arriba, 1 cuando el contenedor terminó de salir por arriba.
      const objetivo = e.movimiento ? limitar01(scrollY / fondo) : 0;
      salida = e.movimiento ? salida + (objetivo - salida) * (1 - Math.exp(-e.dt * 6)) : 0;

      const intro = limitar01(t / CONVERGER);
      const control = suave((t - BARRIDO[1]) / (FIN - BARRIDO[1]));
      const luz = suave((t - 0.7) / 0.5);
      const asentar = 1 - suave(t / 2.6);

      const px = e.puntero.x;
      const py = e.puntero.y;
      volumen.rotation.set(
        POSE.x + py * 0.18 - salida * 0.15,
        POSE.y + px * 0.24 + salida * 0.7 + asentar * 0.5,
        POSE.z,
        'YXZ',
      );
      const u = (t - BARRIDO[0]) / (BARRIDO[1] - BARRIDO[0]);
      const sigue = Math.max(-1, Math.min(1, px * 0.9 - salida * 1.8));
      corte.rotation.x = (barrido(limitar01(u)) + sigue * control) * CORTE_MAX;

      puntos.uniforms.uIntro!.value = intro;
      puntos.uniforms.uCorte!.value = corte.rotation.x;
      puntos.uniforms.uLuz!.value = luz;
      corteRelleno.uniforms.uLuz!.value = luz;
      aristasMat.opacity = 0.32 * suave(intro * 1.4 - 0.2);
      corteBorde.opacity = 0.8 * luz;
      corteLineas.opacity = 0.22 * luz;
      return t < FIN || Math.abs(objetivo - salida) > 1e-4;
    },
  };
};
