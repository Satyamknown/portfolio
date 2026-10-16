// The live 3D crate on /design: the Blender model (public/design/home/crate.glb, exported by
// design-portfolio-blender/build.py --glb) drawn with three.js. Loaded lazily, so three.js and
// the model only download when the Work screen comes near.
//
// Folders lift with a damped ease every frame (smooth at any frame rate). The scene only
// renders while something moves, so an idle page costs nothing.
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
  PMREMGenerator,
  Raycaster,
  Vector2,
  Vector3,
  Quaternion,
  Group,
  SRGBColorSpace,
  AgXToneMapping,
  VSMShadowMap,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const BASE = '/design/home/';
// Same pop as the Blender stills: up 10 cm, 2 cm toward the viewer, a 9° lean back,
// and the cover card slides 7.5 cm out of its folder.
const LIFT = 0.1;
const FORWARD = 0.02;
const CARD_OUT = 0.075;
const FRAME_H = 0.82; // ortho height that frames the crate, as in Blender
const SHIFT_Y = 0.051; // headroom above the crate for a popped folder

export async function createCrate(host, { onHover, onClick, onIntroDone, reducedMotion }) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = AgXToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap;
  renderer.domElement.className = 'dh-gl';
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;

  // Key and fill placed like the Blender area lights (glTF is Y-up: Blender x,y,z -> x,z,-y).
  const key = new DirectionalLight(0xfff6ec, 3.4);
  key.position.set(-0.9, 1.4, 0.7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.blurSamples = 16;
  Object.assign(key.shadow.camera, { left: -0.7, right: 0.7, top: 0.7, bottom: -0.7, near: 0.1, far: 5 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.002;
  key.shadow.radius = 14;
  scene.add(key);
  const fill = new DirectionalLight(0xeef4ff, 0.4);
  fill.position.set(1.0, 0.9, 0.4);
  scene.add(fill);
  scene.add(new HemisphereLight(0xffffff, 0xcfd8e2, 0.5));

  const floor = new Mesh(new PlaneGeometry(6, 6), new ShadowMaterial({ opacity: 0.13 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const draco = new DRACOLoader().setDecoderPath(BASE + 'draco/');
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(BASE + 'crate.glb');
  draco.dispose();

  // Everything sits in one group so the intro can jump the whole crate.
  const rig = new Group();
  scene.add(rig);
  const src = gltf.scene;
  const camNode = src.getObjectByName('Camera');
  rig.add(src);

  const folders = [];
  src.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      const m = o.material;
      if (m && m.name.startsWith('sticker-')) {
        // die-cut stickers: hard alpha edge, no sorting trouble, crisp at any zoom
        m.transparent = false;
        m.alphaTest = 0.5;
        m.depthWrite = true;
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        o.castShadow = false;
      }
      if (m?.map) m.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      // the Blender stills get a saturation grade after rendering; do the same to the flat colours
      if (m && !m.map && /^(crate|manila)$/.test(m.name) && !m.userData.graded) {
        const hsl = {};
        m.color.getHSL(hsl);
        m.color.setHSL(hsl.h, Math.min(1, hsl.s * 1.65), Math.min(1, hsl.l * 1.04));
        m.userData.graded = true;
      }
      if (m && /-img$/.test(m.name)) m.roughness = 0.3; // the covers are glossy card
    }
    const hit = /^folder-(\d+)-/.exec(o.name);
    if (hit) {
      const i = Number(hit[1]);
      const lift = [...o.children].filter((c) => /-(card|cover)$/.test(c.name));
      folders[i] = {
        root: o,
        pos: o.position.clone(),
        quat: o.quaternion.clone(),
        lift: lift.map((c) => ({ o: c, y: c.position.y })),
        cover: o.children.find((c) => /-cover$/.test(c.name)),
        f: 0,
        want: 0,
        shake: 0,
      };
      o.traverse((c) => (c.userData.folder = i));
    }
  });

  // Blender's ortho camera, with its lens shift done as an off-centre frustum.
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
  if (camNode) {
    camNode.updateWorldMatrix(true, false);
    camNode.getWorldPosition(camera.position);
    camNode.getWorldQuaternion(camera.quaternion);
  }
  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    const halfH = FRAME_H / 2;
    const halfW = (halfH * w) / h;
    Object.assign(camera, { left: -halfW, right: halfW, top: halfH + SHIFT_Y, bottom: -halfH + SHIFT_Y });
    camera.updateProjectionMatrix();
    wake();
  };

  // ---------------------------------------------------------------- motion
  const lean = new Quaternion();
  const axisX = new Vector3(1, 0, 0);
  const LEAN = (-9 * Math.PI) / 180;
  let intro = reducedMotion ? 1 : 0; // 0 hidden, then 0..1 while the crate jumps in
  let introT = -1;
  let raf = 0;
  let last = 0;

  const apply = (F, t) => {
    const e = F.f;
    // a small wobble after the intro jump that dies away
    const wob = F.shake > 0 ? Math.sin(t * 0.032 + F.root.id) * 0.06 * F.shake : 0;
    F.root.position.set(F.pos.x, F.pos.y + LIFT * e + Math.abs(wob) * 0.04, F.pos.z + FORWARD * e);
    lean.setFromAxisAngle(axisX, LEAN * e + wob * 0.5);
    F.root.quaternion.copy(F.quat).multiply(lean);
    for (const L of F.lift) L.o.position.y = L.y + CARD_OUT * e;
  };

  const springIn = (p) => {
    // jump: rise past the mark, drop back, settle (easeOutBack-ish with one bounce)
    const c = 2.2;
    return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
  };

  const frame = (now) => {
    raf = 0;
    const dt = Math.min(64, last ? now - last : 16);
    last = now;
    let moving = false;

    if (introT >= 0 && intro < 1) {
      intro = Math.min(1, (now - introT) / 900);
      const s = springIn(intro);
      rig.position.y = (1 - s) * -0.25;
      rig.scale.setScalar(0.82 + 0.18 * s);
      moving = true;
      if (intro >= 1) {
        rig.position.y = 0;
        rig.scale.setScalar(1);
        onIntroDone?.();
      }
    }

    const k = 1 - Math.exp(-dt / 70);
    for (const F of folders) {
      if (!F) continue;
      if (F.shake > 0) {
        F.shake = Math.max(0, F.shake - dt / 1100);
        moving = true;
      }
      const d = F.want - F.f;
      if (Math.abs(d) > 0.001) {
        F.f += d * k;
        moving = true;
      } else F.f = F.want;
      apply(F, now);
    }
    renderer.render(scene, camera);
    if (moving) wake();
    else last = 0;
  };
  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- pointer
  const ray = new Raycaster();
  const ndc = new Vector2();
  const pick = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObject(src, true);
    for (const h of hits) if (h.object.userData.folder !== undefined) return h.object.userData.folder;
    return -1;
  };
  let hover = -1;
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || intro < 1) return;
    const i = pick(e);
    if (i !== hover) {
      hover = i;
      renderer.domElement.style.cursor = i >= 0 ? 'pointer' : '';
      onHover?.(i);
    }
  };
  const onLeave = (e) => {
    if (e.pointerType !== 'mouse') return;
    hover = -1;
    renderer.domElement.style.cursor = '';
    onHover?.(-1);
  };
  let down = null;
  const onDown = (e) => (down = { x: e.clientX, y: e.clientY });
  const onUp = (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) return (down = null);
    down = null;
    const i = pick(e);
    if (i >= 0) onClick?.(i, e.pointerType);
  };
  const el = renderer.domElement;
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onUp);

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  renderer.compile(scene, camera);
  if (!reducedMotion) {
    rig.scale.setScalar(0.001);
  }
  renderer.render(scene, camera);

  return {
    // which folder is up (-1 = none); several can be easing at once, only one is wanted
    setTarget(i) {
      folders.forEach((F, k) => F && (F.want = k === i ? 1 : 0));
      wake();
    },
    // the crate jumps in, the folders rattle, then everything settles
    playIntro() {
      if (introT >= 0 || reducedMotion) {
        if (reducedMotion) onIntroDone?.();
        return;
      }
      introT = performance.now();
      folders.forEach((F) => F && (F.shake = 1));
      wake();
    },
    // where folder i's cover card is on screen right now, as 4 points in viewport px
    coverQuad(i) {
      const F = folders[i];
      if (!F?.cover) return null;
      const g = F.cover.geometry;
      g.computeBoundingBox();
      const b = g.boundingBox;
      const size = new Vector3();
      b.getSize(size);
      // the cover is a flat plane: use its two long axes
      const axes = ['x', 'y', 'z'].sort((a, c) => size[c] - size[a]).slice(0, 2);
      const r = el.getBoundingClientRect();
      const pts = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ].map(([u, v]) => {
        const p = b.min.clone();
        p[axes[0]] = u ? b.max[axes[0]] : b.min[axes[0]];
        p[axes[1]] = v ? b.min[axes[1]] : b.max[axes[1]];
        F.cover.localToWorld(p);
        p.project(camera);
        return [r.left + ((p.x + 1) / 2) * r.width, r.top + ((1 - p.y) / 2) * r.height];
      });
      return pts;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          const m = o.material;
          m.map?.dispose();
          m.dispose();
        }
      });
      pmrem.dispose();
      renderer.dispose();
      el.remove();
    },
  };
}

