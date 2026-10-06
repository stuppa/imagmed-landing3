// Transductor convexo en 3D para el encabezado del catálogo. El cuerpo sale de un torno (LatheGeometry)
// aplanado en profundidad y con la cara convexa curvada; anillo azul, lente oscura, alivio estriado y cable.
// Entra una sola vez al llegar a la sección (≈2 s); después solo lo mueven el scroll (gira sobre su eje)
// y el puntero (voltea hacia él). Debajo, una sombra suave sobre el "papel" de la página.
import {
  Box3,
  CatmullRomCurve3,
  DirectionalLight,
  Group,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  SplineCurve,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import type { CrearEscena, Estado } from '../escena3d';

// Medidas tomadas de transductor-convexo.png (1 unidad ≈ 100 px de la imagen), con la cara en y = 0.
const ANCHO = 1.07; // media anchura máxima de la cabeza
const ABOMBADO = 0.15; // flecha de la cara convexa
const FIN_ALIVIO = 4.15; // punta del alivio de cable
const CENTRO = 1.9; // altura del centro de giro: mitad del cuerpo
const INTRO = 2.2; // segundos de entrada (WCAG 2.2.2: < 5 s)

// Reposo: tres cuartos, la cabeza un poco hacia el frente para que se vea la lente.
const REPOSO = { giro: 0.4, guinada: 0.3, cabeceo: 0.14 };

const perfil = (puntos: [number, number][], n: number) =>
  new SplineCurve(puntos.map(([r, y]) => new Vector2(r, y))).getSpacedPoints(n);

/** Aplana la cabeza en profundidad y curva la cara (convexa en x, recta en z); normales suaves sin costura. */
function moldear(geo: BufferGeometry) {
  geo.deleteAttribute('normal');
  geo.deleteAttribute('uv');
  const g = mergeVertices(geo, 1e-4);
  const p = g.attributes.position!;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const curva = Math.max(0, 1 - (x / ANCHO) ** 2);
    const peso = 1 - MathUtils.smoothstep(y, 0, 0.9);
    const lente = MathUtils.smoothstep(-y, 0, 0.12) * 0.05; // la lente es más gruesa al centro
    p.setZ(i, p.getZ(i) * (0.56 + 0.44 * MathUtils.smoothstep(y, 0.4, 3)));
    p.setY(i, y - curva * (ABOMBADO * peso + lente));
  }
  g.computeVertexNormals();
  return g;
}

export const crear: CrearEscena = (renderer, contenedor) => {
  renderer.toneMapping = NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap; // three r186 quitó PCFSoftShadowMap (avisaba en consola); PCF ya suaviza con shadow.radius
  const lienzo = renderer.domElement;
  lienzo.style.opacity = '0';

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const cuarto = new RoomEnvironment();
  scene.environment = pmrem.fromScene(cuarto, 0.04).texture;
  scene.environmentIntensity = 0.5;
  cuarto.dispose();
  pmrem.dispose();

  const camera = new PerspectiveCamera(24, 1, 0.1, 100);

  // Detalle según el tamaño del lienzo: en móvil el transductor mide ~170 px.
  // ponytail: se decide una vez al montar; si se gira el teléfono o se agranda la ventana conserva el detalle bajo.
  const fino = Math.min(contenedor.clientWidth, contenedor.clientHeight) > 140;
  const radiales = fino ? 96 : 56;

  const blanco = new MeshPhysicalMaterial({ color: 0xeef1f5, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 });
  const gris = new MeshPhysicalMaterial({ color: 0xd3d9e1, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.2 });
  const azul = new MeshPhysicalMaterial({
    color: 0x0066dd,
    emissive: 0x0066dd,
    emissiveIntensity: 0.35,
    roughness: 0.3,
    clearcoat: 1,
  });
  const oscuro = new MeshPhysicalMaterial({ color: 0x4a525e, roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const negro = new MeshPhysicalMaterial({ color: 0x232934, roughness: 0.42, clearcoat: 0.35 });

  const malla = (geo: BufferGeometry, material: MeshPhysicalMaterial) => {
    const m = new Mesh(geo, material);
    m.castShadow = true;
    return m;
  };

  // Carcasa: cabeza ancha, cintura y cuello (radio, altura).
  const carcasa = perfil(
    [
      [0.96, 0],
      [1.03, 0.07],
      [1.07, 0.25],
      [1.05, 0.5],
      [1, 0.75],
      [0.92, 0.97],
      [0.82, 1.18],
      [0.71, 1.38],
      [0.61, 1.58],
      [0.54, 1.8],
      [0.505, 2.05],
      [0.495, 2.4],
      [0.485, 2.7],
      [0.455, 2.88],
      [0.39, 2.99],
      [0.31, 3.05],
      [0.2, 3.08],
    ],
    fino ? 90 : 56,
  );
  // Lente acústica: la banda oscura de la cara.
  const lente = perfil(
    [
      [0, -0.12],
      [0.6, -0.12],
      [0.88, -0.11],
      [0.95, -0.08],
      [0.985, -0.03],
      [0.985, 0.02],
      [0.95, 0.05],
    ],
    24,
  );
  // Alivio de cable con estrías, cerrado contra el cable.
  const alivio: Vector2[] = [];
  for (let i = 0, n = fino ? 160 : 90; i <= n; i++) {
    const y = MathUtils.lerp(2.98, FIN_ALIVIO, i / n);
    const base = MathUtils.lerp(0.315, 0.25, MathUtils.smoothstep(y, 3.05, FIN_ALIVIO));
    const surco = y > 3.2 && y < 3.98 ? 0.02 * Math.max(0, Math.cos(((y - 3.2) / 0.13) * Math.PI * 2)) ** 8 : 0;
    alivio.push(new Vector2(base - surco, y));
  }
  alivio.push(new Vector2(0.21, FIN_ALIVIO + 0.02), new Vector2(0.13, FIN_ALIVIO + 0.03));

  const sonda = new Group(); // gira sobre su eje (y local)
  sonda.position.y = -CENTRO;
  const anillo = malla(new TorusGeometry(0.318, 0.03, 12, radiales), azul);
  anillo.rotation.x = Math.PI / 2;
  anillo.position.y = 3.06;
  sonda.add(
    malla(moldear(new LatheGeometry(carcasa, radiales)), blanco),
    malla(moldear(new LatheGeometry(lente, radiales)), oscuro),
    malla(new LatheGeometry(alivio, Math.round(radiales / 2)), gris),
    anillo,
  );

  // eje: inclina el transductor según la forma del lienzo. El cable cuelga de él pero no gira con la sonda
  // (el alivio es redondo, así que el giro sobre el eje se ve continuo).
  const eje = new Group();
  const cable = malla(new TubeGeometry(), negro);
  const pivote = new Group(); // puntero, scroll y entrada
  eje.add(sonda);
  pivote.add(eje, cable);
  scene.add(pivote);

  // El cable sale por el eje, se acuesta enseguida y cuelga apenas hacia la derecha, fuera del lienzo.
  const tramo: Vector3[] = [];
  const rehacerCable = (ang: number) => {
    const a = new Vector3(Math.cos(ang), Math.sin(ang), 0);
    const p0 = a.clone().multiplyScalar(FIN_ALIVIO - CENTRO - 0.1);
    const p1 = p0.clone().addScaledVector(a, 0.55);
    const p2 = p1.clone().add(new Vector3(0.9, -0.06, -0.2));
    const p3 = p2.clone().add(new Vector3(1.6, -0.3, -0.4));
    tramo.splice(0, 3, p0, p1, p2);
    const curva = new CatmullRomCurve3([
      p0,
      p1,
      p2,
      p3,
      p3.clone().add(new Vector3(3, -0.35, -0.6)),
      p3.clone().add(new Vector3(15, -0.5, -1.6)),
    ]);
    cable.geometry.dispose();
    cable.geometry = new TubeGeometry(curva, fino ? 160 : 90, 0.125, 12);
  };

  // Luz principal desde arriba a la izquierda (modela el blanco), una frontal débil que solo proyecta la sombra
  // sobre la página y un contraluz azulado para despegar el borde inferior del fondo claro.
  const luz = new DirectionalLight(0xffffff, 3.2);
  luz.position.set(-3, 7, 4);
  const frontal = new DirectionalLight(0xffffff, 0.35);
  frontal.position.set(-1.2, 3, 10);
  frontal.castShadow = true;
  frontal.shadow.mapSize.set(512, 512);
  frontal.shadow.radius = 10;
  frontal.shadow.blurSamples = 16;
  Object.assign(frontal.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 25 });
  const contraluz = new DirectionalLight(0xa9c8ff, 1.2);
  contraluz.position.set(2, -3, -6);
  scene.add(luz, frontal, contraluz);

  const papel = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ color: 0x0b1220, opacity: 0.16, depthWrite: false }));
  papel.position.z = -1.3;
  papel.receiveShadow = true;
  papel.renderOrder = -1;
  scene.add(papel);

  // Pose: reposo + entrada (0 → 1) + puntero + scroll.
  let centro = new Vector3();
  const posar = (entrada: number, puntero: Estado['puntero'], scroll: number) => {
    const falta = 1 - entrada;
    sonda.rotation.y = REPOSO.giro - falta * 2.6 + (scroll - 0.5) * 1.8;
    pivote.rotation.set(
      REPOSO.cabeceo + puntero.y * 0.22 + (scroll - 0.5) * 0.3,
      REPOSO.guinada + puntero.x * 0.32 - falta * 0.6,
      0,
    );
    pivote.position.set(-centro.x, -centro.y + falta * 0.5, 0);
    pivote.scale.setScalar(1 - falta * 0.12);
  };

  // Encuadre: inclinación según la proporción del lienzo y distancia para que el cuerpo quepa con margen.
  const caja = new Box3();
  const tamano = new Vector3();
  const redimensionar = (ancho: number, alto: number) => {
    const aspecto = ancho / alto;
    const ang = MathUtils.degToRad(MathUtils.lerp(36, 11, MathUtils.smoothstep(aspecto, 1, 2.8)));
    eje.rotation.z = ang - Math.PI / 2;
    rehacerCable(ang);
    centro = new Vector3();
    posar(1, { x: 0, y: 0 }, 0.5);
    pivote.updateMatrixWorld(true);
    // Cuerpo más el arranque del cable; lo demás del cable puede salir por la derecha.
    caja.setFromObject(sonda, true);
    for (const p of tramo) caja.expandByPoint(p.clone().addScalar(0.15)).expandByPoint(p.clone().subScalar(0.15));
    caja.getCenter(centro).add(new Vector3(0, -0.15, 0)); // un poco arriba: abajo cae la sombra
    caja.getSize(tamano);
    const tan = Math.tan(MathUtils.degToRad(camera.fov / 2));
    const d = Math.max((tamano.y * 1.45) / (2 * tan), (tamano.x * 1.2) / (2 * tan * aspecto)) + tamano.z / 2;
    camera.position.set(0, 0, d);
    camera.lookAt(0, 0, 0);
  };

  let inicio = -1;
  let scrollSuave = 0.5;

  return {
    scene,
    camera,
    redimensionar,
    actualizar(e) {
      if (!e.movimiento) {
        lienzo.style.opacity = '1';
        posar(1, { x: 0, y: 0 }, 0.5);
        return false;
      }
      // Espera a que la sección asome de verdad (el montaje carga un poco antes).
      if (inicio < 0) {
        if (e.scroll < 0.12) return false;
        inicio = e.t;
        scrollSuave = e.scroll;
      }
      const k = Math.min(1, (e.t - inicio) / INTRO);
      const entrada = 1 - (1 - k) ** 4;
      lienzo.style.opacity = String(Math.min(1, k / 0.25));
      scrollSuave += (e.scroll - scrollSuave) * (1 - Math.exp(-e.dt * 6));
      posar(entrada, e.puntero, scrollSuave);
      return k < 1 || Math.abs(e.scroll - scrollSuave) > 1e-4;
    },
  };
};
