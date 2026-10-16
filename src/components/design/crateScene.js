// The live 3D crate on /design: the Blender model (public/design/home/crate.glb, exported by
// design-portfolio-blender/build.py --glb) drawn with three.js. Loaded lazily, so three.js and
// the model download right after the hero paints.
//
// One canvas covers the whole window. After the headline is in, the crate falls in from above the
// window and lands; the impact throws the folders up out of it and they fall back in under gravity. Scrolling then carries it from that hero pose (low in
// the window, turned a little to the front) to the isometric Work pose. The scene reads the scroll
// position itself on every frame, so the crate tracks the scroll with no lag. Folders lift with a damped ease every frame (smooth at any frame rate). The scene only
// renders while something moves, so an idle page costs nothing.
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  DirectionalLight,
  HemisphereLight,
  PlaneGeometry,
  SphereGeometry,
  BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  MeshLambertMaterial,
  InstancedMesh,
  DoubleSide,
  Vector4,
  Matrix4,
  Color,
  VSMShadowMap,
  PMREMGenerator,
  Raycaster,
  Vector2,
  Vector3,
  Quaternion,
  Group,
  SRGBColorSpace,
  AgXToneMapping,
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
const FRAME_H = 0.84; // ortho height that frames the crate, as in Blender
const SHIFT_Y = 0.045; // headroom above the crate for a popped folder

export async function createCrate(host, { onHover, onClick, onIntroDone, reducedMotion }) {
  // rig = the scroll pose (crate + its shadow); body = the crate alone, so it can fall onto the shadow.
  const rig = new Group();
  const body = new Group();
  rig.add(body);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); // full-window canvas: keep it cheap
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
  // Real-time soft shadow. A small map with a blur keeps it soft and cheap; the light rides
  // along with the crate (see place()), so the shadow camera can stay tight around it.
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.55, right: 0.55, top: 0.55, bottom: -0.55, near: 0.2, far: 4 });
  key.shadow.radius = 9;
  key.shadow.blurSamples = 10;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.003;
  scene.add(key.target);
  const keyOff = key.position.clone();
  scene.add(key);
  const fill = new DirectionalLight(0xeef4ff, 0.4);
  fill.position.set(1.0, 0.9, 0.4);
  scene.add(fill);
  scene.add(new HemisphereLight(0xffffff, 0xcfd8e2, 0.5));


  // The ground: a big round grass planet the crate lands on, with live grass blades over its
  // visible top. They sway in the wind and are flattened outward by the landing. The crate's
  // real-time shadow falls on both.
  const draco = new DRACOLoader().setDecoderPath(BASE + 'draco/');
  const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(BASE + 'crate.glb');
  draco.dispose();
  const R = 1.0; // the planet's radius, metres (the crate is 0.44 wide)
  const sphere = new SphereGeometry(R, 160, 120);
  {
    // patchy turf colour, so the bare part of the planet reads as grass too, not plastic
    const p = sphere.attributes.position;
    const col = new Float32Array(p.count * 3);
    const a = new Color('#2f561b');
    const b = new Color('#4d7a27');
    const t = new Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) * 9, y = p.getY(i) * 9, z = p.getZ(i) * 9;
      const nz = Math.sin(x + Math.sin(z * 1.3)) * Math.sin(z - Math.cos(y * 1.7)) * 0.5 + Math.sin(x * 2.7 + y * 3.1 - z * 2.3) * 0.25;
      t.copy(a).lerp(b, 0.5 + nz * 0.6);
      col.set([t.r, t.g, t.b], i * 3);
    }
    sphere.setAttribute('color', new BufferAttribute(col, 3));
  }
  const planet = new Mesh(sphere, new MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
  planet.position.y = -R + 0.012; // the crate settles a little into the grass
  planet.receiveShadow = true;
  rig.add(planet);
  const grass = makeGrass(planet.position, R, window.matchMedia('(pointer: fine)').matches ? 64000 : 22000);
  rig.add(grass.mesh);


  scene.add(rig);
  const src = gltf.scene;
  const camNode = src.getObjectByName('Camera');
  body.add(src);

  const folders = [];
  src.traverse((o) => {
    if (o.isMesh) {
      const m = o.material;
      o.castShadow = true;
      o.receiveShadow = true; // folders shade each other and the inside of the crate
      if (m && m.name.startsWith('sticker-')) {
        // die-cut stickers: hard alpha edge, no sorting trouble, crisp at any zoom
        m.transparent = false;
        m.alphaTest = 0.5;
        m.depthWrite = true;
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
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
        // loose-file physics: height above its slot, vertical speed, tilt and tilt speed
        py: 0,
        vy: 0,
        rx: 0,
        wx: 0,
        rz: 0,
        wz: 0,
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
  // Work pose: the crate's frame (FRAME_H world units) fills `land.size` px centred at
  // land.cx, land.cy of the window. The hero pose sits lower and turned.
  let land = { cx: window.innerWidth / 2, cy: window.innerHeight / 2, size: 600 };
  let hero = { cy: window.innerHeight * 0.95 };
  let u = FRAME_H / land.size; // world units per px
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    u = FRAME_H / land.size;
    Object.assign(camera, {
      left: -land.cx * u,
      right: (w - land.cx) * u,
      top: SHIFT_Y + land.cy * u,
      bottom: SHIFT_Y - (h - land.cy) * u,
    });
    camera.updateProjectionMatrix();
    wake();
  };
  const camDown = new Vector3(0, -1, 0).applyQuaternion(camera.quaternion);

  // ---------------------------------------------------------------- motion
  const lean = new Quaternion();
  const axisX = new Vector3(1, 0, 0);
  const LEAN = (-9 * Math.PI) / 180;
  const TURN = (12 * Math.PI) / 180; // hero pose: turned a little more to the front, so the stickers read
  let progress = reducedMotion ? 1 : 0; // 0 = hero pose, 1 = Work pose
  let settled = false;
  let raf = 0;
  let last = 0;
  let drop = { t: -1, h: 0, landed: false }; // the fall from above the window
  const DROP_MS = 1050;

  const axisZ = new Vector3(0, 0, 1);
  const tiltZ = new Quaternion();
  const G = 5; // softer than real gravity: at this scale 9.8 is over before the eye catches it
  // Throw every folder up out of the crate; each gets its own speed and spin, like loose files.
  const kick = (power) => {
    folders.forEach((F, i) => {
      if (!F) return;
      const r = Math.sin(i * 12.9898 + power * 78.233) * 43758.5453;
      const rnd = r - Math.floor(r); // a fixed pseudo-random 0..1 per folder
      F.vy = power * (1.1 + 0.45 * rnd); // 12-24 cm out of the crate
      F.wx = power * (rnd > 0.5 ? 1 : -1) * (2.2 + 2.4 * rnd);
      F.wz = power * (i % 2 ? 1 : -1) * (1.4 + 1.6 * rnd);
    });
  };
  // One physics step: gravity, a bounce off the crate floor that loses most of its energy,
  // and a damped spring that rights the tilt.
  const physics = (F, dt) => {
    F.vy -= G * dt;
    F.py += F.vy * dt;
    if (F.py <= 0) {
      F.py = 0;
      F.vy = F.vy < -0.25 ? -F.vy * 0.32 : 0;
      F.wx += F.vy ? (F.rx > 0 ? -1 : 1) * 0.6 : 0; // landing knocks the tilt a little
    }
    // in the air a folder tumbles freely; back in its slot the crate walls snap it upright
    const air = F.py > 0;
    for (const [a, w] of [['rx', 'wx'], ['rz', 'wz']]) {
      F[w] += ((air ? -22 : -150) * F[a] - (air ? 1.2 : 7) * F[w]) * dt;
      F[a] += F[w] * dt;
    }
    return F.py > 0 || Math.abs(F.vy) > 1e-3 || Math.abs(F.rx) + Math.abs(F.wx) + Math.abs(F.rz) + Math.abs(F.wz) > 1e-3;
  };
  // Scatter: after each landing every folder settles a little out of place (higher, leaning,
  // shifted, twisted), different every time. Scrolling to the Work pose tidies them up.
  const axisY = new Vector3(0, 1, 0);
  const twist = new Quaternion();
  let messIn = 0; // 0 before the first landing, eases to 1 as the folders come down scattered
  const scatter = () =>
    folders.forEach((F) => {
      if (!F) return;
      const r = () => Math.random() * 2 - 1;
      F.mess = { x: r() * 0.014, y: Math.random() * 0.045, rx: r() * 0.12, rz: r() * 0.1, ry: r() * 0.07 };
    });
  const apply = (F, m) => {
    const e = F.f;
    const M = F.mess || { x: 0, y: 0, rx: 0, rz: 0, ry: 0 };
    F.root.position.set(F.pos.x + M.x * m, F.pos.y + LIFT * e + F.py + M.y * m, F.pos.z + FORWARD * e);
    // the crate walls hold a folder upright until it is clear of the rim, then it may tumble
    const out = Math.min(1, F.py / 0.13);
    lean.setFromAxisAngle(axisX, LEAN * e + F.rx * out + M.rx * m);
    F.root.quaternion.copy(F.quat).multiply(lean);
    F.root.quaternion.multiply(tiltZ.setFromAxisAngle(axisZ, F.rz * out + M.rz * m));
    if (M.ry) F.root.quaternion.multiply(twist.setFromAxisAngle(axisY, M.ry * m));
    for (const L of F.lift) L.o.position.y = L.y + CARD_OUT * e;
  };

  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const place = () => {
    const e = ease(progress);
    const down = (hero.cy - land.cy) * u * (1 - e);
    rig.position.copy(camDown).multiplyScalar(down);
    rig.rotation.y = TURN * (1 - e);
    rig.scale.setScalar(1 + 0.25 * (1 - e)); // a little bigger in the hero, as in the owner's mock
    key.position.copy(rig.position).add(keyOff);
    key.target.position.copy(rig.position);
  };
  // Fall: accelerate down (gravity), land at 62%, one small bounce, settle.
  const fall = (p) => {
    if (p < 0.62) return 1 - (p / 0.62) ** 2;
    const b = (p - 0.62) / 0.38;
    return Math.sin(b * Math.PI) * 0.07 * (1 - b);
  };
  const readScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  };
  const arrive = (now) => {
    if (now === settled) return;
    settled = now;
    el.style.pointerEvents = now ? 'auto' : 'none';
    if (now && !arrived) {
      arrived = true;
      if (!reducedMotion) kick(0.35); // a light jostle as it settles in the Work pose
      setTimeout(() => onIntroDone?.(), reducedMotion ? 0 : 450);
    }
    if (!now) {
      hover = -1;
      onHover?.(-1);
    }
  };
  let arrived = false;

  const frame = (now) => {
    raf = 0;
    const dt = Math.min(64, last ? now - last : 16);
    last = now;
    let moving = false;

    progress = reducedMotion ? 1 : Math.min(1, Math.max(0, readScroll()));
    place();
    arrive(progress > 0.985);

    if (drop.t >= 0 && now >= drop.t) {
      const p = Math.min(1, (now - drop.t) / DROP_MS);
      const y = fall(p);
      body.position.y = drop.h * y;
      if (!drop.landed && p >= 0.62) {
        drop.landed = true;
        grass.impact(now / 1000);
        scatter();
        kick(1);
      }
      if (p < 1) moving = true;
      else drop.t = -2;
    } else if (drop.t >= 0) moving = true; // waiting for the headline to finish

    // the scatter fades in as the folders land, and fades out as the scroll reaches the Work pose
    if (drop.landed && messIn < 1) {
      messIn = Math.min(1, messIn + dt / 450);
      moving = true;
    }
    const mess = messIn * (1 - ease(progress));
    const k = 1 - Math.exp(-dt / 70);
    for (const F of folders) {
      if (!F) continue;
      // fixed small steps, so the bounces look the same at any frame rate
      for (let n = Math.ceil(dt / 8), h = dt / 1000 / n; n > 0; n--) if (physics(F, h)) moving = true;
      const d = F.want - F.f;
      if (Math.abs(d) > 0.001) {
        F.f += d * k;
        moving = true;
      } else F.f = F.want;
      apply(F, mess);
    }
    // the wind never stops, so the scene keeps drawing while the page is visible
    if (!reducedMotion) {
      grass.tick(now / 1000);
      moving = true;
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
    if (e.pointerType !== 'mouse' || !settled) return;
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

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', wake, { passive: true });
  resize();
  place();
  el.style.pointerEvents = 'none';
  renderer.compile(scene, camera);
  renderer.render(scene, camera);

  return {
    // which folder is up (-1 = none); several can be easing at once, only one is wanted
    setTarget(i) {
      folders.forEach((F, k) => F && (F.want = k === i ? 1 : 0));
      wake();
    },
    // where the crate sits in the Work pose and in the hero pose, in window px
    setLayout(f, heroCy) {
      land = f;
      hero = { cy: heroCy };
      resize();
    },
    // The crate falls in from above the window at `at` (a performance.now() time).
    playDrop(at) {
      if (import.meta.env.DEV) window.__crate = { api: this, body, rig, get drop() { return drop; }, get folders() { return folders; } };
      if (reducedMotion) return wake();
      // high enough that the crate starts fully above the window, whatever the pose
      drop = { t: at, h: ((window.innerHeight + land.size) * u) / 0.78, landed: false };
      body.position.y = drop.h;
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
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', wake);
      grass.dispose();
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

// Grass blades: one instanced, tapered strip per blade, standing out of the planet's top cap,
// thinning toward the cap's edge and none under the crate. Wind and the landing shockwave bend each
// blade in the vertex shader (more at the tip), so thousands of blades cost one draw call.
function makeGrass(center, R, count) {
  const blade = new PlaneGeometry(1, 1, 1, 4);
  blade.translate(0, 0.5, 0);
  const p = blade.attributes.position;
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (1 - p.getY(i) * 0.92)); // taper to a point
  const uniforms = { uTime: { value: 0 }, uImpact: { value: new Vector4(0, 0, -100, 0) } };
  const mat = new MeshLambertMaterial({ side: DoubleSide });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform vec4 uImpact;\nvarying float vH;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vH = position.y;
        vec3 root = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        float k = position.y * position.y;
        float gust = sin(uTime * 1.3 + root.x * 2.1 + root.z * 1.4);
        float sway = gust * 0.7 + sin(uTime * 2.9 + root.x * 5.3 - root.z * 4.1) * 0.3;
        vec2 push = vec2(0.9, 0.35) * sway;
        vec2 d = root.xz - uImpact.xy;
        float dist = length(d);
        float age = uTime - uImpact.z;
        float ring = age > 0.0 ? exp(-pow((dist - age * 0.9) / 0.09, 2.0)) * exp(-age * 1.6) * uImpact.w : 0.0;
        push += (d / max(dist, 1e-4)) * ring * 5.0;
        transformed += inverse(mat3(instanceMatrix)) * vec3(push.x, 0.0, push.y) * k * 0.008;`
      );
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vH;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(0.38, 1.0, vH);');
  };

  const mesh = new InstancedMesh(blade, mat, count);
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  const pos = new Vector3();
  const dir = new Vector3();
  const m4 = new Matrix4();
  const q = new Quaternion();
  const yaw = new Quaternion();
  const sc = new Vector3();
  const up = new Vector3(0, 1, 0);
  const deep = new Color('#24461a');
  const light = new Color('#6c9a2c');
  const c = new Color();
  const CAP = (50 * Math.PI) / 180; // blades over the top 50 degrees, thinning out; the planet's own green beyond
  const cosCap = Math.cos(CAP);
  let n = 0;
  for (let tries = 0; n < count && tries < count * 4; tries++) {
    // uniform over the cap
    const ct = 1 - Math.random() * (1 - cosCap);
    const st = Math.sqrt(1 - ct * ct);
    const ph = Math.random() * Math.PI * 2;
    dir.set(st * Math.cos(ph), ct, st * Math.sin(ph));
    pos.copy(dir).multiplyScalar(R).add(center);
    if (Math.abs(pos.x) < 0.232 && Math.abs(pos.z) < 0.167) continue; // under the crate
    const th = Math.acos(ct) / CAP; // 0 at the top, 1 at the cap's edge
    if (Math.random() > (1 - Math.min(1, Math.max(0, (th - 0.35) / 0.65))) ** 1.6) continue;
    const h = (0.016 + Math.random() * 0.022) * (1 - Math.min(0.6, Math.max(0, (th - 0.6) * 1.5)));
    q.setFromUnitVectors(up, dir).multiply(yaw.setFromAxisAngle(up, Math.random() * Math.PI * 2));
    sc.set(0.0022 + Math.random() * 0.0018, h, 1);
    m4.compose(pos, q, sc);
    mesh.setMatrixAt(n, m4);
    mesh.setColorAt(n, c.copy(deep).lerp(light, Math.random() * 0.85));
    n++;
  }
  mesh.count = n;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return {
    mesh,
    tick: (t) => (uniforms.uTime.value = t),
    impact: (t) => uniforms.uImpact.value.set(0, 0, t, 1),
    dispose: () => {
      blade.dispose();
      mat.dispose();
    },
  };
}
