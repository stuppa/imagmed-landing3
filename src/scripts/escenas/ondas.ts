// Campo de ondas acústicas detrás del formulario de contacto: una malla de puntos en perspectiva que se levanta
// al paso de pulsos de ultrasonido (un seno con envolvente gaussiana) que se expanden en anillos.
// El emisor sigue al cursor sobre el plano; sin cursor (táctil) queda en la zona de la sección que se está leyendo.
// Emiten el cursor al moverse y el scroll; la cámara se inclina y se acerca con el scroll.
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
} from 'three';
import type { CrearEscena } from '../escena3d';

const ANILLOS = 10;
const MASCARAS = 3; // formulario y bloques de texto, marcados con data-ondas-mascara="<cuánto apagan, 0…1>"
const VIDA = 2.6; // s que tarda un pulso en apagarse
const VEL = 6; // unidades/s del frente de onda
const LEJOS = 44; // distancia a la que la malla ya se perdió en la niebla (más en pantallas angostas)
/** Segundos (desde que la sección asoma) de los pulsos de entrada: el último se apaga antes de los 5 s (WCAG 2.2.2). */
const INTRO = [0.15, 0.95, 1.75];

const vertexShader = /* glsl */ `
  #define ANILLOS ${ANILLOS}
  uniform float uT;
  uniform vec4 uAnillos[ANILLOS]; // x, z del origen; nacimiento (s); amplitud
  uniform vec3 uEmisor; // x, z; intensidad del foco bajo el cursor
  uniform float uTam;
  uniform vec2 uLimite; // tamaño mínimo y máximo del punto en px
  uniform vec4 uCaja; // mín x, máx x, mín z, máx z de la malla
  uniform vec2 uNiebla; // distancia donde empieza y donde termina la niebla
  varying float vBrillo;
  varying float vOnda;

  void main() {
    vec3 p = position;
    float h = 0.0;
    for (int i = 0; i < ANILLOS; i++) {
      vec4 a = uAnillos[i];
      float edad = uT - a.z;
      if (edad <= 0.0 || edad >= ${VIDA.toFixed(1)}) continue;
      float d = distance(p.xz, a.xy);
      float x = d - edad * ${VEL.toFixed(1)};
      float vida = 1.0 - edad / ${VIDA.toFixed(1)};
      // Pulso de ultrasonido: unos ciclos de seno dentro de una campana, que se atenúa con el tiempo y la distancia.
      h += a.w * exp(-x * x * 0.5) * cos(x * 3.0) * vida * vida / (1.0 + d * 0.04);
    }
    float dE = distance(p.xz, uEmisor.xy);
    float foco = uEmisor.z * exp(-dE * dE * 0.06);
    p.y += h * 1.3 + foco * 0.45;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float z = -mv.z;
    // Las crestas brillan; los valles apenas: cada pulso se lee como un anillo y no como bandas iguales.
    float onda = clamp(h, 0.0, 1.0) + 0.35 * clamp(-h, 0.0, 1.0);
    gl_PointSize = clamp(uTam * (1.0 + onda * 0.9 + foco * 0.5) / z, uLimite.x, uLimite.y);

    // Niebla al fondo y bordes de la malla desvanecidos: nunca se ve dónde termina.
    float niebla = 1.0 - smoothstep(uNiebla.x, uNiebla.y, z);
    vec2 borde = min(position.xz - uCaja.xz, uCaja.yw - position.xz);
    vBrillo = niebla * smoothstep(0.0, 4.0, min(borde.x, borde.y));
    vOnda = max(onda, foco * 0.55);
  }
`;

const fragmentShader = /* glsl */ `
  #define MASCARAS ${MASCARAS}
  uniform vec3 uColor;
  uniform vec3 uCresta;
  uniform vec4 uMascaras[MASCARAS]; // rectángulos en px del lienzo (origen abajo a la izquierda)
  uniform float uFuerzas[MASCARAS];
  uniform float uPluma;
  varying float vBrillo;
  varying float vOnda;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    float disco = 1.0 - smoothstep(0.25, 0.5, r);
    // Detrás del formulario y del texto el campo se apaga, con borde suave: la lectura va primero.
    float calma = 1.0;
    for (int i = 0; i < MASCARAS; i++) {
      vec4 m = uMascaras[i];
      vec2 dentro = smoothstep(m.xy - uPluma, m.xy + uPluma, gl_FragCoord.xy)
        * (1.0 - smoothstep(m.zw - uPluma, m.zw + uPluma, gl_FragCoord.xy));
      calma = min(calma, 1.0 - uFuerzas[i] * dentro.x * dentro.y);
    }
    float a = (0.42 + 1.5 * vOnda) * vBrillo * disco * calma;
    gl_FragColor = vec4(mix(uColor, uCresta, vOnda) * a, a); // premultiplicado, se suma sobre el negro
  }
`;

// Solo puntos de borde suave y sin profundidad: el antialias (MSAA) y el búfer de profundidad no cambian nada en la
// imagen y, en un lienzo del alto de toda la sección, son mucha memoria de GPU en el celular.
export const lienzo = { antialias: false, depth: false };

export const crear: CrearEscena = (renderer, contenedor) => {
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.5, 200);
  const pr = renderer.getPixelRatio();
  const fino = matchMedia('(pointer: fine)').matches;
  const seccion = contenedor.closest('section') ?? contenedor;
  const tapados = [...seccion.querySelectorAll<HTMLElement>('[data-ondas-mascara]')].slice(0, MASCARAS);

  const anillos = Array.from({ length: ANILLOS }, () => new Vector4(0, 0, -1e3, 0));
  const emisor = new Vector3();
  const caja = new Vector4();
  const mascaras = Array.from({ length: MASCARAS }, () => new Vector4(-1e4, -1e4, -1e4, -1e4));
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uT: { value: 0 },
      uAnillos: { value: anillos },
      uEmisor: { value: emisor },
      uTam: { value: 1 },
      uLimite: { value: new Vector2(1.2 * pr, 7 * pr) },
      uCaja: { value: caja },
      uNiebla: { value: new Vector2() },
      uMascaras: { value: mascaras },
      uFuerzas: { value: Array.from({ length: MASCARAS }, (_, i) => Number(tapados[i]?.dataset.ondasMascara) || 0) },
      uPluma: { value: 56 * pr },
      // Colores en sRGB tal cual (el shader no convierte): --color-marca y un azul casi blanco en las crestas.
      uColor: { value: new Vector3(0, 0x66 / 255, 0xdd / 255) },
      uCresta: { value: new Vector3(0.66, 0.82, 1) },
    },
    transparent: true,
    premultipliedAlpha: true,
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });
  const puntos = new Points(new BufferGeometry(), material);
  puntos.frustumCulled = false;
  scene.add(puntos);

  // Cámara: el scroll la inclina hacia abajo y la acerca; el cursor la desplaza un poco de lado (paralaje).
  let angosto = 0; // 0 escritorio … 1 móvil en vertical (la sección es mucho más alta que ancha)
  let lejos = LEJOS;
  const objetivo = new Vector3();
  const posar = (s: number, px: number) => {
    // El borde superior del lienzo siempre mira por debajo del horizonte; en pantallas altas, más hacia abajo,
    // para que el plano llene el lienzo y no quede una franja de niebla detrás del título.
    const base = Math.max(30, camera.fov / 2 + 12 + 10 * angosto);
    const angulo = MathUtils.degToRad(base + 16 * s);
    const d = MathUtils.lerp(23, 17, s);
    objetivo.set(0, 0, MathUtils.lerp(0, -3, s));
    camera.position.set(px * 1.8, Math.sin(angulo) * d, objetivo.z + Math.cos(angulo) * d);
    camera.lookAt(objetivo);
    camera.updateMatrixWorld();
  };

  const rayo = new Raycaster();
  const suelo = new Plane(new Vector3(0, 1, 0), 0);
  const ndc = new Vector2();
  const punto = new Vector3();
  /** Punto del plano bajo una coordenada de pantalla (-1…1); si apunta sobre el horizonte, lo lleva a la niebla. */
  const proyectar = (x: number, y: number, destino: Vector3) => {
    rayo.setFromCamera(ndc.set(x, y), camera);
    const o = rayo.ray.origin;
    if (!rayo.ray.intersectPlane(suelo, destino) || Math.hypot(destino.x - o.x, destino.z - o.z) > lejos) {
      const dir = rayo.ray.direction;
      const k = lejos / (Math.hypot(dir.x, dir.z) || 1);
      destino.set(o.x + dir.x * k, 0, o.z + dir.z * k);
    }
    return destino;
  };

  // La malla cubre lo que ve la cámara en ambos extremos del scroll y del paralaje; la densidad depende del tamaño.
  const construir = (ancho: number, alto: number) => {
    caja.set(Infinity, -Infinity, Infinity, -Infinity);
    for (const s of [0, 1])
      for (const px of [-1, 1]) {
        posar(s, px);
        for (const x of [-1, 1])
          for (const y of [-1, 1]) {
            proyectar(x, y, punto);
            caja.set(
              Math.min(caja.x, punto.x),
              Math.max(caja.y, punto.x),
              Math.min(caja.z, punto.z),
              Math.max(caja.w, punto.z),
            );
          }
      }
    caja.add(new Vector4(-2, 2, -2, 2));
    const { x: x0, y: x1, z: z0, w: z1 } = caja;
    const total = MathUtils.clamp((ancho * alto) / (75 - 20 * angosto), 3500, 18000);
    const paso = Math.sqrt(((x1 - x0) * (z1 - z0)) / total);
    const cols = Math.ceil((x1 - x0) / paso);
    const filas = Math.ceil((z1 - z0) / paso);
    const pos = new Float32Array(cols * filas * 3);
    let i = 0;
    for (let f = 0; f < filas; f++)
      for (let c = 0; c < cols; c++) {
        // Filas alternadas medio paso: rompe el muaré del fondo.
        pos[i++] = x0 + (c + (f % 2) * 0.5) * paso;
        pos[i++] = 0;
        pos[i++] = z0 + f * paso;
      }
    puntos.geometry.dispose();
    puntos.geometry = new BufferGeometry();
    puntos.geometry.setAttribute('position', new Float32BufferAttribute(pos, 3));
    return paso;
  };

  let siguiente = 0;
  const emitir = (x: number, z: number, amplitud: number, t: number) => {
    anillos[siguiente]!.set(x, z, t, amplitud);
    siguiente = (siguiente + 1) % ANILLOS;
  };

  // Estado de la interacción.
  let inicio = -1; // e.t en que la sección asomó y empezaron los pulsos de entrada
  let intro = 0;
  let suave = -1; // scroll suavizado
  let previo = 0;
  let recorrido = 0; // del emisor desde el último pulso
  let deslizado = 0; // scroll acumulado desde el último pulso
  let ultimo = -1;
  const anterior = new Vector3();
  let primeraVez = true;

  return {
    scene,
    camera,
    redimensionar(ancho, alto) {
      angosto = MathUtils.clamp((1.3 - camera.aspect) / 0.9, 0, 1);
      lejos = LEJOS * (1 + 0.6 * angosto);
      material.uniforms.uNiebla!.value.set(lejos * (0.35 + 0.15 * angosto), lejos);
      // Angosto: más campo vertical para no ver solo una franja del plano.
      camera.fov = MathUtils.clamp(
        MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(29)) / camera.aspect)),
        38,
        70,
      );
      camera.updateProjectionMatrix();
      const paso = construir(ancho, alto);
      // Tamaño del punto: un tercio del paso de la malla, en px del lienzo.
      material.uniforms.uTam!.value = (paso * 0.34 * alto * pr) / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
      const c = contenedor.getBoundingClientRect();
      tapados.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        mascaras[i]!.set(
          (r.left - c.left) * pr,
          (c.bottom - r.bottom) * pr,
          (r.right - c.left) * pr,
          (c.bottom - r.top) * pr,
        );
      });
    },
    actualizar(e) {
      const u = material.uniforms;
      if (!e.movimiento) {
        // Pose fija: tres pulsos congelados a distintas edades, desde abajo, entre el texto y el formulario.
        posar(0.5, 0);
        proyectar(-0.18 * (1 - angosto), -0.6, punto);
        anillos.forEach((a, i) => a.set(punto.x, punto.z, i < 3 ? 1.75 - i * 0.6 : -1e3, 1));
        u.uT!.value = 2;
        emisor.set(punto.x, punto.z, 0);
        return false;
      }

      const t = e.t;
      const k = 1 - Math.exp(-e.dt * 4);
      suave = suave < 0 ? e.scroll : suave + (e.scroll - suave) * k;
      const activo = fino && Math.abs(e.puntero.x) + Math.abs(e.puntero.y) > 0.002;
      const fuera = Math.abs(e.puntero.x) > 0.985 || Math.abs(e.puntero.y) > 0.985;
      posar(suave, e.puntero.x);

      // Emisor: bajo el cursor; sin cursor, a 60 % de la altura de la pantalla (donde se está leyendo),
      // recorriendo el campo de izquierda a derecha con el scroll.
      if (activo && !fuera) proyectar(e.puntero.x, -e.puntero.y, punto);
      else {
        const arriba = innerHeight - e.scroll * (innerHeight + e.alto); // borde superior de la sección en pantalla
        const y = MathUtils.clamp(1 - (2 * (innerHeight * 0.6 - arriba)) / e.alto, -0.9, 0.9);
        proyectar(MathUtils.lerp(-0.7, 0.1, suave) * (1 - 0.4 * angosto), y, punto);
      }
      emisor.x = punto.x;
      emisor.y = punto.z;
      const foco = activo && !fuera ? 1 : 0;
      emisor.z += (foco - emisor.z) * k;
      if (primeraVez) {
        anterior.copy(punto);
        previo = e.scroll;
        primeraVez = false;
      }

      // Pulsos de entrada cuando la sección ya se ve.
      if (inicio < 0 && e.scroll > 0.08) inicio = t;
      while (inicio >= 0 && intro < INTRO.length && t - inicio >= INTRO[intro]!) {
        emitir(punto.x, punto.z, 1, inicio + INTRO[intro++]!);
      }

      // Pulsos por interacción: al mover el cursor (cada tanto recorrido) y al hacer scroll.
      if (activo && !fuera) {
        const tramo = punto.distanceTo(anterior);
        recorrido += tramo;
        if (recorrido > 3.2 && t - ultimo > 0.3) {
          emitir(punto.x, punto.z, MathUtils.clamp(tramo / (e.dt || 1) / 30, 0.45, 1), t);
          recorrido = 0;
          ultimo = t;
        }
      }
      anterior.copy(punto);
      deslizado += Math.abs(e.scroll - previo);
      previo = e.scroll;
      if (deslizado > 0.05 && t - ultimo > 0.3) {
        emitir(punto.x, punto.z, MathUtils.clamp(deslizado * 10, 0.5, 1), t);
        deslizado = 0;
        ultimo = t;
      }
      u.uT!.value = t;

      const vivos = anillos.some((a) => t - a.z < VIDA);
      return (
        vivos ||
        (inicio >= 0 && intro < INTRO.length) ||
        Math.abs(e.scroll - suave) > 1e-4 ||
        Math.abs(foco - emisor.z) > 1e-3
      );
    },
  };
};
