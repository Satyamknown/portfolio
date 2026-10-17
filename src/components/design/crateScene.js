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
  BufferGeometry,
  BufferAttribute,
  LineSegments,
  LineBasicMaterial,
  CanvasTexture,
  IcosahedronGeometry,
  CircleGeometry,
  MeshStandardMaterial,
  Mesh,
  MeshLambertMaterial,
  MeshBasicMaterial,
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
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { World, Body, Box, Sphere as CSphere, Vec3, Material as CMaterial, ContactMaterial } from 'cannon-es';

const BASE = '/design/home/';

// The About spot: on the far side of the planet, below the horizon, so it never shows until the
// planet rolls round to it. Its direction from the planet's centre, and how far the planet turns.
const ABOUT_A = (115 * Math.PI) / 180;
const ABOUT_DIR = { x: 0, y: Math.cos(ABOUT_A), z: -Math.sin(ABOUT_A) };

// Rolling hills over the planet: height above the sphere for a unit direction, in metres.
// Flat where the crate lands and where the About camera stands, so both sit level.
// Used by the planet, the turf and the blades alike.
function hills(x, y, z) {
  let h =
    0.034 * Math.sin(x * 9.0 + 1.3) * Math.cos(z * 8.0 - 0.4) +
    0.022 * Math.sin(x * 15.0 + z * 11.0 + 0.7) * Math.sin(z * 14.0 - x * 6.0) +
    0.012 * Math.sin(x * 29.0 - z * 23.0) * Math.cos(x * 21.0 + z * 27.0 + y * 9.0);
  h = 0.03 + h;
  const c = Math.hypot(x / 0.3, z / 0.23);
  const t = Math.min(1, Math.max(0, (c - 1) / 0.9));
  const ang = Math.acos(Math.min(1, x * ABOUT_DIR.x + y * ABOUT_DIR.y + z * ABOUT_DIR.z));
  const a = Math.min(1, Math.max(0, (ang - 0.4) / 0.22));
  return h * t * t * (3 - 2 * t) * a * a * (3 - 2 * a);
}
function hillySphere(R, ws, hs, thetaLength) {
  const g = new SphereGeometry(R, ws, hs, 0, Math.PI * 2, 0, thetaLength);
  const p = g.attributes.position;
  const d = new Vector3();
  for (let i = 0; i < p.count; i++) {
    d.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
    d.multiplyScalar(R + hills(d.x, d.y, d.z));
    p.setXYZ(i, d.x, d.y, d.z);
  }
  g.computeVertexNormals();
  return g;
}
// Same pop as the Blender stills: up 10 cm, 2 cm toward the viewer, a 9° lean back,
// and the cover card slides 7.5 cm out of its folder.
const LIFT = 0.1;
const FORWARD = 0.02;
const CARD_OUT = 0.075;
const FRAME_H = 0.84; // ortho height that frames the crate, as in Blender
const SHIFT_Y = 0.045; // headroom above the crate for a popped folder

export async function createCrate(host, { onHover, onClick, onIntroDone, onBanner, reducedMotion }) {
  // rig = the scroll pose. Inside it the whole little world turns on the planet's centre (pivot):
  // the crate (body) on top, the planet and grass (ground), and the About camera on the far side.
  const R = 1.0; // the planet's radius, metres (the crate is 0.44 wide)
  const rig = new Group();
  const pivot = new Group();
  pivot.position.y = -R;
  rig.add(pivot);
  const top = new Group();
  top.position.y = R;
  pivot.add(top);
  const body = new Group();
  top.add(body);
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
  Object.assign(key.shadow.camera, { left: -0.75, right: 0.75, top: 0.75, bottom: -0.75, near: 0.2, far: 4 });
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
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const [gltf, camModel, planeModel] = await Promise.all([loader.loadAsync(BASE + 'crate.glb'), loader.loadAsync(BASE + 'camera.glb'), loader.loadAsync(BASE + 'plane.glb')]);
  draco.dispose();
  const fine = window.matchMedia('(pointer: fine)').matches;
  // the bare planet: dark soil-green, only seen at the very roots
  const planet = new Mesh(hillySphere(R, 220, 160, Math.PI), new MeshLambertMaterial({ color: 0x1f5a14 }));
  planet.position.y = -R + 0.012; // the crate settles a little into the grass
  planet.receiveShadow = true;
  // planet, turf and blades share one group
  const ground = new Group();
  top.add(ground);
  ground.add(planet);
  // lush turf over the whole visible planet, right up to the crate's walls
  const crateInv = { value: new Matrix4() }; // ground space -> crate space, to hide grass inside the crate only
  const aboutInv = { value: new Matrix4() }; // ground space -> About camera space, to trim the grass under it
  const turf = makeTurf(R, planet.position.y, fine ? 24 : 12, crateInv, aboutInv);
  for (const m of turf.meshes) ground.add(m);
  // longer wispy blades on top, for the silhouette the reference has
  const grass = makeGrass(planet.position, R, fine ? 70000 : 18000, crateInv, aboutInv, new Vector3(0, 1, 0), 80);
  ground.add(grass.mesh);
  const grass2 = makeGrass(planet.position, R, fine ? 20000 : 7000, crateInv, aboutInv, new Vector3(ABOUT_DIR.x, ABOUT_DIR.y, ABOUT_DIR.z), 45);
  ground.add(grass2.mesh);
  ground.add(makeDetails(planet.position, R));
  // the About camera: stands on the far side, upright to the planet there
  const aboutHolder = new Group();
  // on the actual surface there: the planet's centre sits 1.2 cm above the pivot, so offset by that
  aboutHolder.position.set(ABOUT_DIR.x, ABOUT_DIR.y, ABOUT_DIR.z).multiplyScalar(R).add(new Vector3(0, planet.position.y + R, 0));
  // upright on the planet there, front and right side to the viewer once it comes round, like the crate
  aboutHolder.quaternion.setFromAxisAngle(new Vector3(1, 0, 0), -ABOUT_A);
  pivot.add(aboutHolder);
  aboutHolder.add(camModel.scene);
  // the camera body settles a couple of centimetres into the turf, like the crate; the prints lie on it
  for (const o of [...camModel.scene.children]) if (!/^print-/.test(o.name)) o.position.y -= 0.02;
  const mePrint = camModel.scene.getObjectByName('print-me');
  const Y = new Vector3(0, 1, 0);
  const lay = (name, x, z, deg, y = 0.004) => {
    const o = camModel.scene.getObjectByName(name);
    o.position.set(x, y, z);
    o.quaternion.setFromAxisAngle(Y, (deg * Math.PI) / 180);
  };
  // all three prints lie in the grass in front of the camera, the owner's beside Stratalite
  // (positions must match the grass trim in ABOUT_TRIM)
  lay('print-me', -0.13, 0.33, 8, 0.007);
  lay('print-a', 0.1, 0.37, 20);
  lay('print-b', 0.3, 0.29, -12, 0.0055);
  // a dense tuft of grass round the camera's base, so it stands in the grass instead of on it
  scene.add(rig);
  rig.updateMatrixWorld(true);
  const toGround = new Matrix4().copy(ground.matrixWorld).invert().multiply(aboutHolder.matrixWorld);
  const upG = new Vector3(ABOUT_DIR.x, ABOUT_DIR.y, ABOUT_DIR.z);
  const tuft = (pos, dir) => {
    {
      // round the base: pick a side of the 0.34 x 0.30 footprint, just outside it
      const side = Math.floor(Math.random() * 4);
      const t = Math.random() - 0.5;
      const out = 0.004 + Math.random() * 0.03;
      if (side === 0) pos.set(t * 0.36, 0, 0.15 + out);
      else if (side === 1) pos.set(t * 0.36, 0, -0.15 - out);
      else if (side === 2) pos.set(0.17 + out, 0, t * 0.32);
      else pos.set(-0.17 - out, 0, t * 0.32);
    }
    pos.applyMatrix4(toGround);
    dir.copy(upG);
    return 0.03 + Math.random() * 0.032;
  };
  const tufts = makeGrass(planet.position, R, fine ? 3000 : 1200, crateInv, aboutInv, upG, 1, tuft);
  ground.add(tufts.mesh);
  camModel.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (o.material?.map) o.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // prints are glossy photo paper: keep them bright even where they face away from the sun
    if (/^print-/.test(o.parent?.name || '') && o.material) {
      const map = o.material.map;
      o.material = new MeshBasicMaterial(map ? { map, color: 0xf4f3ef, toneMapped: false } : { color: 0xe9e7e1, toneMapped: false });
    }
  });


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
    frustum();
    wake();
  };
  // A project open: the crate slides left so the project panel has the right side.
  let shift = 0;
  let shiftWant = 0;
  let focused = false;
  const frustum = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = land.cx - shift * w * 0.23;
    Object.assign(camera, {
      left: -cx * u,
      right: (w - cx) * u,
      top: SHIFT_Y + land.cy * u,
      bottom: SHIFT_Y - (h - land.cy) * u,
    });
    camera.updateProjectionMatrix();
  };
  const camDown = new Vector3(0, -1, 0).applyQuaternion(camera.quaternion);
  const flyer = makeFlyer(planeModel, scene, camera, renderer);
  const camRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const axisUp = new Vector3(0, 1, 0);
  const yawQ = new Quaternion();
  const TILT = (-24 * Math.PI) / 180; // camera elevation goes from about 39 to 15 degrees
  const ABOUT_TILT = 0; // About keeps the hero's three-quarter angle, just much closer
  const focusW = new Vector3();
  const focusC = new Vector3();
  let aboutP = 0;
  let aboutWant = 0;
  let hireP = 0;
  let hireWant = 0;
  const HIRE_ROLL = (110 * Math.PI) / 180; // Hire me: the planet rolls over to fresh grass on its other side
  // Opening a case study: the folder's cover card leaves the folder at the angle it sits, flips
  // over once, then flies to the viewer along an arc, banking like a plane, turning to face the
  // screen and growing until it fills it. Resolves when the screen is covered.
  let flight = null;
  const fq = new Quaternion();
  const fq2 = new Quaternion();
  const fp = new Vector3();
  const flyAxisZ = new Vector3(0, 0, 1);
  const updateFlight = (now) => {
    const f = flight;
    const t = Math.min(1, (now - f.t0) / f.dur);
    const a = Math.min(1, t / 0.34);
    const ea = 1 - Math.pow(1 - a, 3);
    const b = Math.max(0, (t - 0.26) / 0.74);
    const eb = b < 0.5 ? 4 * b * b * b : 1 - Math.pow(-2 * b + 2, 3) / 2;
    // out of the folder, along the card's own up
    fp.copy(f.p0).addScaledVector(f.up0, 0.13 * ea);
    // then a curve to the middle of the screen, in front of everything
    const k = 1 - eb;
    fp.multiplyScalar(k * k).addScaledVector(f.ctrl, 2 * k * eb).addScaledVector(f.p1, eb * eb);
    f.g.position.copy(fp);
    // one flip at its own angle, then turn to face the viewer, banking on the way
    fq.copy(f.q0).multiply(fq2.setFromAxisAngle(flyAxisZ, ea * Math.PI * 2));
    fq.slerp(f.q1, eb);
    fq.premultiply(fq2.setFromAxisAngle(f.view, Math.sin(eb * Math.PI) * 0.65));
    f.g.quaternion.copy(fq);
    f.g.scale.setScalar(1 + (f.s1 - 1) * Math.pow(eb, 1.7));
    if (t >= 1 && !f.fired) {
      f.fired = true;
      f.done();
    }
  };
  const easeAbout = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  // ---------------------------------------------------------------- motion
  const lean = new Quaternion();
  const axisX = new Vector3(1, 0, 0);
  const LEAN = (-9 * Math.PI) / 180;
  const TURN = (12 * Math.PI) / 180; // hero pose: turned a little more to the front, so the stickers read
  let progress = reducedMotion ? 1 : 0; // 0 = hero pose, 1 = Work pose
  let settled = false;
  let raf = 0;
  let last = 0;
  // ---------------------------------------------------------------- physics
  // A real rigid-body simulation (cannon-es), in the rig's own space: the planet is a solid
  // sphere, the crate a solid box (floor and four walls), each folder its own thin body. The
  // crate falls from above the window, lands, and the folders bounce off its floor and walls and
  // each other, ending up a little messy inside it.
  // Scrolling to the Work pose blends everything from where the simulation left it to the tidy row.
  const world = new World({ gravity: new Vec3(0, -4, 0), allowSleep: true }); // floaty enough to read
  world.solver.iterations = 16;
  const mGround = new CMaterial('ground');
  const mCrate = new CMaterial('crate');
  const mFolder = new CMaterial('folder');
  world.addContactMaterial(new ContactMaterial(mGround, mCrate, { friction: 0.8, restitution: 0.15 }));
  world.addContactMaterial(new ContactMaterial(mCrate, mFolder, { friction: 0.45, restitution: 0.18 }));
  world.addContactMaterial(new ContactMaterial(mFolder, mFolder, { friction: 0.25, restitution: 0.2 }));
  const planetBody = new Body({ mass: 0, material: mGround, shape: new CSphere(R) });
  planetBody.position.set(0, -R, 0); // its top at the crate's floor
  world.addBody(planetBody);
  const CW = 0.44, CD = 0.31, CH = 0.205, CT = 0.017; // the crate, as built in build.py
  const WALL = CH;
  // The crate itself always lands the same clean way: straight down, level, centred. It can only
  // move up and down (a bounce); only the folders inside are free to scatter.
  const crateBody = new Body({ mass: 3, material: mCrate, angularDamping: 0.4 });
  crateBody.linearFactor.set(0, 1, 0);
  crateBody.angularFactor.set(0, 0, 0);
  crateBody.addShape(new Box(new Vec3(CW / 2, CT / 2, CD / 2)), new Vec3(0, CT / 2, 0));
  for (const z of [CD / 2 - CT / 2, -(CD / 2 - CT / 2)]) crateBody.addShape(new Box(new Vec3(CW / 2, WALL / 2, CT / 2)), new Vec3(0, WALL / 2, z));
  for (const x of [CW / 2 - CT / 2, -(CW / 2 - CT / 2)]) crateBody.addShape(new Box(new Vec3(CT / 2, WALL / 2, CD / 2)), new Vec3(x, WALL / 2, 0));
  world.addBody(crateBody);
  for (const F of folders) {
    if (!F) continue;
    F.body = new Body({ mass: 0.15, material: mFolder, linearDamping: 0.04, angularDamping: 0.3 });
    F.body.addShape(new Box(new Vec3(0.186, 0.1325, 0.0065)), new Vec3(0, 0.1325, 0)); // origin at its foot, like the model
    world.addBody(F.body);
  }
  let drop = { t: -1, started: false, landed: false };
  crateBody.addEventListener('collide', (ev) => {
    if (ev.body !== planetBody || drop.landed) return;
    drop.landed = true;
    const t = performance.now() / 1000;
    grass.impact(t);
    turf.impact(t);
    // the jolt: a small extra hop and twist for each folder, so they settle a little messy
    for (const F of folders) {
      if (!F) continue;
      F.body.wakeUp();
      F.body.velocity.y += 0.08 + Math.random() * 0.17;
      F.body.angularVelocity.set((Math.random() * 2 - 1) * 0.9, (Math.random() * 2 - 1) * 0.35, (Math.random() * 2 - 1) * 0.6);
    }
  });
  const v3 = new Vector3();
  const q3 = new Quaternion();
  const invQ = new Quaternion();
  const ident = new Quaternion();
  const zero = new Vector3();
  // where folder F sits relative to the crate in the simulation, in the crate's own space
  const simLocal = (F, outP, outQ) => {
    invQ.set(crateBody.quaternion.x, crateBody.quaternion.y, crateBody.quaternion.z, crateBody.quaternion.w).invert();
    outP.set(F.body.position.x - crateBody.position.x, F.body.position.y - crateBody.position.y, F.body.position.z - crateBody.position.z).applyQuaternion(invQ);
    outQ.set(F.body.quaternion.x, F.body.quaternion.y, F.body.quaternion.z, F.body.quaternion.w).premultiply(invQ);
  };
  const apply = (F, tidy) => {
    const e = F.f;
    if (drop.started && tidy < 1) {
      simLocal(F, v3, q3);
      F.root.position.lerpVectors(v3, F.pos, tidy);
      F.root.quaternion.slerpQuaternions(q3, F.quat, tidy);
    } else {
      F.root.position.copy(F.pos);
      F.root.quaternion.copy(F.quat);
    }
    F.root.position.y += LIFT * e;
    F.root.position.z += FORWARD * e;
    F.root.quaternion.multiply(lean.setFromAxisAngle(axisX, LEAN * e));
    for (const L of F.lift) L.o.position.y = L.y + CARD_OUT * e;
  };

  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const place = () => {
    const e = ease(progress);
    const down = (hero.cy - land.cy) * u * (1 - e);
    rig.position.copy(camDown).multiplyScalar(down);
    // Work view: a lower camera angle (the scene tips toward the viewer), so the planet becomes a
    // horizon under the crate and the space above it stays white for project text
    // About: the planet rolls toward the viewer, the crate dips away, the camera comes over the top,
    // and the view tips almost straight down onto it
    const a = easeAbout(aboutP);
    rig.quaternion
      .setFromAxisAngle(camRight, TILT * e * (1 - a) + ABOUT_TILT * a)
      .multiply(yawQ.setFromAxisAngle(axisUp, TURN * (1 - e) * (1 - a)));
    pivot.rotation.x = ABOUT_A * a;
    pivot.rotation.z = HIRE_ROLL * easeAbout(hireP);
    rig.scale.setScalar(1 + 0.25 * (1 - e)); // a little bigger in the hero, as in the owner's mock
    if (a > 0) {
      // closer, and centred on the owner's photo (a little toward the camera body)
      rig.scale.multiplyScalar(1 + 0.62 * a);
      rig.updateMatrixWorld(true);
      mePrint.getWorldPosition(focusW);
      aboutHolder.getWorldPosition(focusC);
      focusW.lerp(focusC, 0.45).sub(rig.position);
      rig.position.addScaledVector(focusW, -a);
    }
    key.position.copy(rig.position).add(keyOff);
    key.target.position.copy(rig.position);
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
    if (hireP !== hireWant) {
      hireP = reducedMotion ? hireWant : Math.min(1, Math.max(0, hireP + Math.sign(hireWant - hireP) * (dt / 1700)));
      moving = true;
    }
    if (aboutP !== aboutWant) {
      aboutP = reducedMotion ? aboutWant : Math.min(1, Math.max(0, aboutP + Math.sign(aboutWant - aboutP) * (dt / 1700)));
      moving = true;
    }
    if (Math.abs(shiftWant - shift) > 0.001) {
      shift += (shiftWant - shift) * (reducedMotion ? 1 : 1 - Math.exp(-dt / 160));
      frustum();
      moving = true;
    }
    place();
    arrive(progress > 0.985);

    if (drop.t >= 0 && now >= drop.t) {
      drop.started = true;
      world.step(1 / 180, dt / 1000, 10);
    }
    if (drop.t >= 0) moving = true; // waiting for the headline, or simulating
    const tidy = reducedMotion || !drop.started ? 1 : ease(progress);
    if (drop.started && tidy < 1) {
      body.position.lerpVectors(v3.set(crateBody.position.x, crateBody.position.y, crateBody.position.z), zero, tidy);
      body.quaternion.slerpQuaternions(q3.set(crateBody.quaternion.x, crateBody.quaternion.y, crateBody.quaternion.z, crateBody.quaternion.w), ident, tidy);
    } else if (drop.started || drop.t < 0) {
      body.position.set(0, 0, 0);
      body.quaternion.identity();
    }
    const k = 1 - Math.exp(-dt / 70);
    for (const F of folders) {
      if (!F) continue;
      const d = F.want - F.f;
      if (Math.abs(d) > 0.001) {
        F.f += d * k;
        moving = true;
      } else F.f = F.want;
      apply(F, tidy);
    }
    // now and then, after the visitor has been here a while, the plane crosses the sky
    if (flyer.update(now, focused, hireWant === 1, reducedMotion)) moving = true;
    if (flight) {
      updateFlight(now);
      moving = true;
    }
    // the wind never stops, so the scene keeps drawing while the page is visible
    if (!reducedMotion) {
      grass.tick(now / 1000);
      grass2.tick(now / 1000);
      tufts.tick(now / 1000);
      turf.tick(now / 1000);
      moving = true;
    }
    body.updateMatrix();
    scene.updateMatrixWorld();
    crateInv.value.copy(body.matrixWorld).invert().multiply(ground.matrixWorld);
    aboutInv.value.copy(aboutHolder.matrixWorld).invert().multiply(ground.matrixWorld);
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
    if (flyer.hit(ray)) return -2; // the banner
    const hits = ray.intersectObject(src, true);
    for (const h of hits) if (h.object.userData.folder !== undefined) return h.object.userData.folder;
    return -1;
  };
  let hover = -1;
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || !settled || focused) return;
    const i = pick(e);
    if (i !== hover) {
      hover = i;
      renderer.domElement.style.cursor = i >= 0 || i === -2 ? 'pointer' : '';
      onHover?.(Math.max(-1, i));
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
    if (i === -2) return onBanner?.();
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
    // a project panel is open (crate slides left, hover pauses) or closed
    // Hire me: the planet rolls over, the plane flies in and hovers, the form takes the right side
    setHire(on) {
      hireWant = on ? 1 : 0;
      this.setFocus(on);
      if (on) shiftWant = window.innerWidth > 1100 ? 0.9 : 0;
      wake();
    },
    setAbout(on) {
      aboutWant = on ? 1 : 0;
      this.setFocus(on);
      // About text sits on the right (like a project), so the camera scene goes left
      if (on) shiftWant = window.innerWidth > 1100 ? 0.98 : 0;
      wake();
    },
    setFocus(on) {
      focused = on;
      shiftWant = on && window.innerWidth > 1100 ? 1 : 0;
      if (on) {
        hover = -1;
        renderer.domElement.style.cursor = '';
      }
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
      if (import.meta.env.DEV) window.__crate = { api: this, body, rig, crateBody, get drop() { return drop; }, get folders() { return folders; }, get aboutP() { return aboutP; }, get hireP() { return hireP; }, flyer, camera, renderer, scene };
      if (reducedMotion) return wake();
      // start fully above the window, level, everything at rest
      const h = (window.innerHeight + land.size) * u / 0.78 / 1.25;
      crateBody.position.set(0, h, 0);
      crateBody.quaternion.set(0, 0, 0, 1);
      crateBody.velocity.setZero();
      crateBody.angularVelocity.setZero();
      for (const F of folders) {
        if (!F) continue;
        v3.copy(F.pos).applyQuaternion(q3.set(crateBody.quaternion.x, crateBody.quaternion.y, crateBody.quaternion.z, crateBody.quaternion.w));
        F.body.position.set(v3.x + crateBody.position.x, v3.y + crateBody.position.y, v3.z + crateBody.position.z);
        const fq = q3.clone().multiply(F.quat);
        F.body.quaternion.set(fq.x, fq.y, fq.z, fq.w);
        F.body.velocity.setZero();
        F.body.angularVelocity.setZero();
      }
      drop = { t: at, started: false, landed: false };
      body.position.set(0, h, 0); // hidden above until it starts
      wake();
    },
    // where folder i's cover card is on screen right now, as 4 points in viewport px
    // fly folder i's cover card out of the crate and over the whole screen
    flyCover(i) {
      const F = folders[i];
      if (!F?.cover) return Promise.resolve();
      scene.updateMatrixWorld(true);
      const g = new Group();
      F.cover.matrixWorld.decompose(g.position, g.quaternion, new Vector3());
      scene.add(g);
      g.updateMatrixWorld(true);
      const parts = F.lift.map((L) => L.o);
      F.lift = []; // the folder stops moving them
      for (const o of parts) g.attach(o);
      const coverScale = new Vector3().setFromMatrixScale(F.cover.matrixWorld);
      const w = (camera.right - camera.left) / camera.zoom;
      const h = (camera.top - camera.bottom) / camera.zoom;
      const up0 = new Vector3(0, 0, -1).applyQuaternion(g.quaternion); // the card's own up
      const view = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
      const p1 = new Vector3(0, 0, -0.97).unproject(camera);
      const p0 = g.position.clone();
      const ctrl = p0.clone().addScaledVector(up0, 0.3).lerp(p1, 0.35).addScaledVector(new Vector3(0, 1, 0).applyQuaternion(camera.quaternion), 0.18);
      const q1 = camera.quaternion.clone().multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2));
      const s1 = Math.max(w / coverScale.x, h / (coverScale.z || coverScale.y)) * 1.06;
      return new Promise((done) => {
        flight = { g, p0, p1, ctrl, up0, view, q0: g.quaternion.clone(), q1, s1, t0: performance.now(), dur: reducedMotion ? 1 : 1500 * (import.meta.env.DEV ? window.__slow || 1 : 1), done, fired: false };
        wake();
      });
    },
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
      grass2.dispose();
      tufts.dispose();
      turf.dispose();
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

// The three prints in the About camera's own space (x across, z toward the front, y up), as laid
// out in design-portfolio-blender/camera.py: 1 right under a print, fading out just past its edge.
// Only there is the grass cut short; everywhere else it grows up round the prints and the camera.
const ABOUT_TRIM = `
float printMask(vec3 a, vec2 c, float th) {
  vec2 d = a.xz - c;
  float lx = d.x * cos(th) - d.y * sin(th);
  float lz = d.x * sin(th) + d.y * cos(th);
  return (1.0 - smoothstep(0.1, 0.118, abs(lx))) * (1.0 - smoothstep(0.121, 0.139, abs(lz)));
}
float aboutTrim(vec3 p) {
  vec3 a = (uAboutInv * vec4(p, 1.0)).xyz;
  if (abs(a.y) > 0.12) return 0.0;
  float m = printMask(a, vec2(-0.13, 0.33), 0.1396);
  m = max(m, printMask(a, vec2(0.1, 0.37), 0.3491));
  return max(m, printMask(a, vec2(0.3, 0.29), -0.2094));
}`;

// Grass blades: one instanced, tapered strip per blade, standing out of the planet's top cap,
// thinning toward the cap's edge and none under the crate. Wind and the landing shockwave bend each
// blade in the vertex shader (more at the tip), so thousands of blades cost one draw call.
function makeGrass(center, R, count, crateInv, aboutInv, axis, capDeg, sample) {
  const blade = new PlaneGeometry(1, 1, 1, 4);
  blade.translate(0, 0.5, 0);
  const p = blade.attributes.position;
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (1 - p.getY(i) * 0.92)); // taper to a point
  const uniforms = { uTime: { value: 0 }, uImpact: { value: new Vector4(0, 0, -100, 0) } };
  const mat = new MeshLambertMaterial({ side: DoubleSide });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms, { uCrateInv: crateInv, uAboutInv: aboutInv });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform vec4 uImpact;\nvarying float vH;\nvarying vec3 vRig;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vH = position.y;
        vec3 root = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        float k = position.y * position.y;
        // each blade arcs over in its own direction, and the same rolling wind waves bend it
        float bh = length(instanceMatrix[1].xyz);
        float wave = sin(dot(root.xz, vec2(0.8, 0.6)) * 7.0 - uTime * 1.5) * 0.5 + 0.5;
        vec2 bdir = normalize(vec2(fract(sin(dot(root.xz, vec2(12.9898, 78.233))) * 43758.5453) - 0.5, fract(sin(dot(root.xz, vec2(39.35, 11.13))) * 24634.63) - 0.5) + 1e-4);
        vec2 push = bdir * 0.8 + vec2(0.8, 0.6) * (0.12 + 0.45 * wave) + vec2(sin(uTime * 3.1 + root.x * 13.0), sin(uTime * 2.7 + root.z * 11.0)) * 0.06;
        vec2 d = root.xz - uImpact.xy;
        float dist = length(d);
        float age = uTime - uImpact.z;
        float ring = age > 0.0 ? exp(-pow((dist - age * 0.9) / 0.09, 2.0)) * exp(-age * 1.6) * uImpact.w : 0.0;
        push += (d / max(dist, 1e-4)) * ring * 1.2;
        transformed += inverse(mat3(instanceMatrix)) * vec3(push.x, 0.0, push.y) * k * bh;
        transformed.y -= k * length(push) * 0.3; // a bent blade droops instead of stretching
        vRig = (instanceMatrix * vec4(transformed, 1.0)).xyz;`
      );
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vH;\nvarying vec3 vRig;\nuniform mat4 uCrateInv;\nuniform mat4 uAboutInv;\n' + ABOUT_TRIM)
      .replace('#include <color_fragment>', '#include <color_fragment>\nvec3 cl = (uCrateInv * vec4(vRig, 1.0)).xyz;\nif (abs(cl.x) < 0.218 && abs(cl.z) < 0.153 && cl.y > -0.06 && cl.y < 0.21) discard;\nif (aboutTrim(vRig) > 0.5) discard;\ndiffuseColor.rgb *= mix(0.5, 1.18, vH);');
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
  // four greens, deep to yellow-lime, like a sunlit lawn
  const tones = ['#3a901c', '#5db62c', '#8fd640', '#c4ec5e'].map((h) => new Color(h));
  const c = new Color();
  // blades grow in clumps: each clump is a centre on the cap, its blades scattered round it
  const clump = new Vector3();
  let clumpLeft = 0;
  const tangentA = new Vector3();
  const tangentB = new Vector3();
  const CAP = (capDeg * Math.PI) / 180; // a cap of blades around `axis`
  const cosCap = Math.cos(CAP);
  const toAxis = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), axis);
  let n = 0;
  for (let tries = 0; n < count && tries < count * 4; tries++) {
    // uniform over the cap
    const ct = 1 - Math.random() * (1 - cosCap);
    const st = Math.sqrt(1 - ct * ct);
    const ph = Math.random() * Math.PI * 2;
    let h;
    if (sample) {
      h = sample(pos, dir); // a hand-placed tuft: the sampler gives the spot, the up direction and the height
    } else {
      if (clumpLeft <= 0) {
        clump.set(st * Math.cos(ph), ct, st * Math.sin(ph)).applyQuaternion(toAxis);
        clumpLeft = 6 + Math.floor(Math.random() * 12);
      }
      clumpLeft--;
      tangentA.set(0, 1, 0).cross(clump).normalize();
      tangentB.copy(clump).cross(tangentA);
      const rr = Math.sqrt(Math.random()) * 0.011;
      const aa = Math.random() * Math.PI * 2;
      dir.copy(clump).addScaledVector(tangentA, Math.cos(aa) * rr).addScaledVector(tangentB, Math.sin(aa) * rr).normalize();
      pos.copy(dir).multiplyScalar(R + hills(dir.x, dir.y, dir.z)).add(center);
      h = 0.03 + Math.random() * 0.034;
    }
    q.setFromUnitVectors(up, dir).multiply(yaw.setFromAxisAngle(up, Math.random() * Math.PI * 2));
    sc.set(0.0016 + Math.random() * 0.0016, h, 1);
    m4.compose(pos, q, sc);
    mesh.setMatrixAt(n, m4);
    const t = Math.random() * 3;
    mesh.setColorAt(n, c.copy(tones[Math.floor(t)]).lerp(tones[Math.min(3, Math.floor(t) + 1)], t % 1));
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

// Turf: the sphere drawn again in thin shells, each a little further out. Every shell keeps only
// the fragments where a strand of grass reaches that height (a hash per tiny cell of the
// surface), so stacked together they read as dense, soft grass: dark at the roots, lime at the
// tips. Wind and the landing ring lean the upper shells. One sphere per shell, shared geometry.
function makeTurf(R, offsetY, layers, crateInv, aboutInv) {
  const H = 0.036; // grass height, metres
  const geo = hillySphere(R, 240, 180, Math.PI);
  const shared = { uTime: { value: 0 }, uImpact: { value: new Vector4(0, 0, -100, 0) } };
  const meshes = [];
  for (let i = 1; i <= layers; i++) {
    const t = i / layers;
    const mat = new MeshLambertMaterial({ color: 0xffffff });
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, shared, { uT: { value: t }, uCrateInv: crateInv, uAboutInv: aboutInv });
      const head = `uniform float uT;\nuniform float uTime;\nuniform vec4 uImpact;\nuniform mat4 uCrateInv;\nuniform mat4 uAboutInv;\nvarying vec3 vSurf;\nvarying vec3 vRig;\nvarying float vWave;\n` + ABOUT_TRIM;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + head).replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vSurf = normalize(position) * ${R.toFixed(3)};
        vec3 nrm = normalize(position);
        // short, trimmed grass under the About camera and its prints, so nothing pokes through them
        float trim = 1.0 - 0.88 * aboutTrim(position + vec3(0.0, ${offsetY.toFixed(4)}, 0.0));
        transformed += nrm * uT * ${H} * trim;
        // wind as slow waves rolling across the field, plus a light flutter
        float wave = sin(dot(vSurf.xz, vec2(0.8, 0.6)) * 7.0 - uTime * 1.5) * 0.5 + 0.5;
        vWave = wave;
        vec3 w = vec3(0.8, 0.0, 0.6) * (0.2 + 0.8 * wave) + vec3(sin(uTime * 2.3 + vSurf.x * 9.0), 0.0, sin(uTime * 2.0 + vSurf.z * 8.0)) * 0.1;
        vec3 rp = transformed + vec3(0.0, ${offsetY.toFixed(4)}, 0.0);
        vec2 d = rp.xz - uImpact.xy;
        float dist = length(d);
        float age = uTime - uImpact.z;
        float ring = age > 0.0 ? exp(-pow((dist - age * 0.9) / 0.09, 2.0)) * exp(-age * 1.6) * uImpact.w : 0.0;
        w.xz += (d / max(dist, 1e-4)) * ring * 4.0;
        w -= nrm * dot(w, nrm);
        transformed += w * uT * uT * ${(H * 0.6).toFixed(4)} * trim;
        vRig = transformed + vec3(0.0, ${offsetY.toFixed(4)}, 0.0);`
      );
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + head + `
        float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }`).replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        // grass everywhere, even where the crate will land; only hidden inside the crate itself
        vec3 cl = (uCrateInv * vec4(vRig, 1.0)).xyz;
        if (abs(cl.x) < 0.218 && abs(cl.z) < 0.153 && cl.y > -0.06 && cl.y < 0.21) discard;
        vec3 q = vSurf * 300.0; // strands about two pixels wide: finer ones alias into ripples
        vec3 cell = floor(q);
        float r = hash13(cell);
        // tufts: strands are taller in clumps and shorter between them, so the turf is bumpy, not flat
        float tuft = 0.62 + 0.38 * sin(vSurf.x * 41.0 + sin(vSurf.z * 37.0) * 2.0) * sin(vSurf.z * 43.0 - vSurf.x * 13.0);
        float h = (0.35 + 0.65 * r) * tuft;
        if (uT > h) discard;
        // each strand sits at its own random spot in its cell, so no rows or rings ever line up
        vec3 jit = vec3(hash13(cell + 1.7), hash13(cell + 3.1), hash13(cell + 5.3)) - 0.5;
        vec3 lp = fract(q) - 0.5 - jit * 0.55;
        if (length(lp) > 0.7 * (1.0 - uT / h) + 0.08) discard;
        float k = uT / h;
        vec3 root = vec3(0.05, 0.22, 0.016);
        vec3 tip = mix(vec3(0.24, 0.78, 0.03), vec3(0.52, 0.90, 0.07), hash13(cell + 7.0));
        // broad light and dark patches across the field, as in a real lawn
        float lawn = 0.8 + 0.28 * sin(vSurf.x * 6.3 + sin(vSurf.z * 4.1) * 1.7) * sin(vSurf.z * 5.2 - vSurf.x * 2.3);
        diffuseColor.rgb = mix(root, tip * lawn, smoothstep(0.0, 1.0, k)) * (0.6 + 0.4 * uT);
        diffuseColor.rgb *= 0.93 + 0.17 * vWave * uT; // the sheen where a wave bends the grass`
      );
    };
    const m = new Mesh(geo, mat);
    m.position.y = offsetY;
    m.receiveShadow = true;
    m.renderOrder = i;
    meshes.push(m);
  }
  return {
    meshes,
    tick: (time) => (shared.uTime.value = time),
    impact: (time) => shared.uImpact.value.set(0, 0, time, 1),
    dispose: () => {
      geo.dispose();
      meshes.forEach((m) => m.material.dispose());
    },
  };
}

// Stones and daisies scattered over the planet, as in the owner's reference: a few smooth pale
// pebbles half-sunk in the grass, and small white daisies with yellow centres standing just above
// it. Kept clear of the crate's spot and the About camera's spot.
function makeDetails(center, R) {
  const group = new Group();
  const dir = new Vector3();
  const about = new Vector3(ABOUT_DIR.x, ABOUT_DIR.y, ABOUT_DIR.z);
  const up = new Vector3(0, 1, 0);
  // a random spot on a cap of `deg` degrees round `axis`, avoiding the two busy spots
  const spot = (axis, deg) => {
    const q = new Quaternion().setFromUnitVectors(up, axis);
    for (let k = 0; k < 40; k++) {
      const ct = 1 - Math.random() * (1 - Math.cos((deg * Math.PI) / 180));
      const st = Math.sqrt(1 - ct * ct);
      const ph = Math.random() * Math.PI * 2;
      dir.set(st * Math.cos(ph), ct, st * Math.sin(ph)).applyQuaternion(q);
      if (dir.y > 0.85 && Math.abs(dir.x) < 0.34 && Math.abs(dir.z) < 0.28) continue; // the crate
      if (dir.angleTo(about) < 0.42) continue; // the camera and its prints
      return dir.clone();
    }
    return null;
  };
  const place = (o, d, lift) => {
    o.position.copy(d).multiplyScalar(R + hills(d.x, d.y, d.z) + lift).add(center);
    o.quaternion.setFromUnitVectors(up, d);
  };

  // pebbles: a squashed, softly dented sphere each
  const stoneMat = new MeshStandardMaterial({ color: 0xa9a499, roughness: 0.9, metalness: 0 });
  for (let k = 0; k < 9; k++) {
    const d = spot(k < 6 ? up : about, k < 6 ? 55 : 40);
    if (!d) continue;
    const g = new IcosahedronGeometry(1, 3);
    const p = g.attributes.position;
    const seed = Math.random() * 10;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = 1 + 0.08 * Math.sin(x * 3.1 + seed) * Math.sin(y * 2.7 - seed) + 0.05 * Math.sin(z * 5.3 + seed * 2);
      p.setXYZ(i, x * n, y * n, z * n);
    }
    g.computeVertexNormals();
    const size = 0.025 + Math.random() * 0.035;
    const m = new Mesh(g, stoneMat);
    m.scale.set(size * (1 + Math.random() * 0.5), size * 0.55, size);
    place(m, d, -size * 0.12); // half-sunk
    m.rotateY(Math.random() * Math.PI);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  }

  // daisies: eight petals and a yellow heart, on a short stalk just above the grass tips
  const petals = [];
  for (let k = 0; k < 8; k++) {
    const pg = new CircleGeometry(1, 10);
    pg.scale(0.22, 1, 1);
    pg.translate(0, 0.62, 0);
    pg.rotateZ((k / 8) * Math.PI * 2);
    petals.push(pg);
  }
  const petalGeo = mergeGeometries(petals);
  petalGeo.rotateX(-Math.PI / 2);
  const heartGeo = new SphereGeometry(0.3, 10, 6);
  heartGeo.scale(1, 0.5, 1);
  const N = 160;
  const petalMesh = new InstancedMesh(petalGeo, new MeshLambertMaterial({ color: 0xfbfaf4, side: DoubleSide }), N);
  const heartMesh = new InstancedMesh(heartGeo, new MeshLambertMaterial({ color: 0xf2c230 }), N);
  const o = new Group();
  let n = 0;
  for (let k = 0; k < N; k++) {
    const d = spot(k < 115 ? up : about, k < 115 ? 70 : 45);
    if (!d) continue;
    place(o, d, 0.034 + Math.random() * 0.012);
    o.rotateY(Math.random() * Math.PI * 2);
    o.rotateX((Math.random() - 0.5) * 0.5);
    o.scale.setScalar(0.006 + Math.random() * 0.004);
    o.updateMatrix();
    petalMesh.setMatrixAt(n, o.matrix);
    heartMesh.setMatrixAt(n, o.matrix);
    n++;
  }
  petalMesh.count = heartMesh.count = n;
  for (const m of [petalMesh, heartMesh]) {
    m.instanceMatrix.needsUpdate = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    group.add(m);
  }
  return group;
}

// The banner plane: a chubby cartoon fighter in the crate's blue (design-portfolio-blender/plane.py)
// towing a cloth banner, "Hire me for work", across the sky behind the planet, right to
// left: the first time after the visitor has been on the page a while, then every so often. The
// banner is a small cloth simulation (verlet points held by springs): its front edge hangs on the two
// tow ropes and the airflow streams it back, with a gust rippling down its length. Click: Contact.
function makeFlyer(model, scene, camera, renderer) {
  const FIRST = 14000; // ms on the page before the first pass
  const EVERY = 45000;
  const DUR = 13000;
  const plane = new Group();
  plane.add(model.scene);
  model.scene.scale.setScalar(0.6);
  model.scene.traverse((o) => o.isMesh && (o.castShadow = false));
  const prop = model.scene.getObjectByName('prop');
  const tow = model.scene.getObjectByName('tow');
  // a faint disc where the blades sweep, so the propeller reads as spinning fast, not strobing
  if (prop) {
    const disc = new Mesh(new CircleGeometry(0.108, 48), new MeshBasicMaterial({ color: 0x3a3f46, transparent: true, opacity: 0.16, depthWrite: false, side: DoubleSide }));
    disc.position.z = 0.053;
    prop.add(disc);
  }
  plane.visible = false;
  scene.add(plane);

  // the cloth's look: cream fabric, red dashed stitching, grommets, a swallowtail end. Drawn twice:
  // with the ropes on the left (flying left, tail streaming right) and on the right (hovering,
  // facing right); either way the words read normally.
  const L = 0.82;
  const H = 0.14;
  const label = 'HIRE ME FOR WORK  ↗';
  const drawCloth = (ropesRight) => {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 324;
    const g = c.getContext('2d');
    const W = c.width;
    const X = (x) => (ropesRight ? W - x : x); // mirror the shape, never the words
    const notch = 120;
    const m = 26;
    const outline = (inset) => {
      g.beginPath();
      g.moveTo(X(inset), inset);
      g.lineTo(X(W - inset - (inset ? 8 : 0)), inset);
      g.lineTo(X(W - notch - inset * 0.8), c.height / 2);
      g.lineTo(X(W - inset - (inset ? 8 : 0)), c.height - inset);
      g.lineTo(X(inset), c.height - inset);
      g.closePath();
    };
    g.fillStyle = '#f3eee2';
    outline(0);
    g.fill();
    g.strokeStyle = '#d4483a';
    g.lineWidth = 5;
    g.setLineDash([22, 16]);
    outline(m);
    g.stroke();
    g.setLineDash([]);
    for (const y of [m + 30, c.height - m - 30]) {
      g.fillStyle = '#8a6a3c';
      g.beginPath();
      g.arc(X(44), y, 16, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#f3eee2';
      g.beginPath();
      g.arc(X(44), y, 7, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#141414';
    let fs = 170;
    do {
      g.font = `600 ${fs}px "Instrument Sans", "Helvetica Neue", Arial, sans-serif`;
      fs -= 4;
    } while (g.measureText(label).width > W - notch - 220 && fs > 40); // fit the cloth, never clipped
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    // the words are part of the cloth's own texture, so they bend and ripple with it
    g.fillText(label, ropesRight ? W / 2 + notch / 2 - 30 : (W - notch) / 2 + 30, c.height / 2 + 8);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const tex = drawCloth(false);
  const texR = drawCloth(true);

  // the cloth: NX x NY points, simulated in world space
  const NX = 34;
  const NY = 6;
  const geo = new PlaneGeometry(L, H, NX - 1, NY - 1);
  const clothMat = new MeshLambertMaterial({ map: tex, side: DoubleSide, alphaTest: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.32 });
  const banner = new Mesh(geo, clothMat);
  banner.frustumCulled = false;
  banner.visible = false;
  scene.add(banner);
  const uv0 = Array.from({ length: geo.attributes.uv.count }, (_, k) => geo.attributes.uv.getX(k));
  const P = []; // current
  const Q = []; // previous
  for (let k = 0; k < NX * NY; k++) {
    P.push(new Vector3());
    Q.push(new Vector3());
  }
  const id = (i, j) => j * NX + i; // PlaneGeometry order: rows top to bottom, columns left to right
  const dx = L / (NX - 1);
  const dy = H / (NY - 1);
  const ropeGeo = new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(12), 3));
  const ropes = new LineSegments(ropeGeo, new LineBasicMaterial({ color: 0x8a6a3c }));
  ropes.frustumCulled = false;
  ropes.visible = false;
  scene.add(ropes);

  const right = new Vector3();
  const up = new Vector3();
  const fwd = new Vector3();
  const view = new Vector3();
  const p = new Vector3();
  const tgt = new Vector3();
  const towW = new Vector3();
  const pinTop = new Vector3();
  const pinBot = new Vector3();
  const tmp = new Vector3();
  const flatR = new Vector3();
  const flatV = new Vector3();
  let next = FIRST;
  let t0 = -1;
  let last = 0;
  let hov = 0; // 0 off, 1 hovering, 2 leaving
  let h0 = 0;
  let lastDir = 0;
  let relay = false;
  const show = (on) => (plane.visible = banner.visible = ropes.visible = on);
  const trailV = new Vector3(); // the way the banner streams: behind the plane
  const pins = () => {
    // the banner's front edge hangs a rope's length behind the tow point
    pinTop.copy(towW).addScaledVector(trailV, 0.12).addScaledVector(up, H / 2 - 0.005);
    pinBot.copy(towW).addScaledVector(trailV, 0.12).addScaledVector(up, -H / 2 - 0.005);
  };
  const lay = () => {
    for (let j = 0; j < NY; j++)
      for (let i = 0; i < NX; i++) {
        P[id(i, j)].copy(pinTop).addScaledVector(trailV, i * dx).addScaledVector(up, -j * dy);
        Q[id(i, j)].copy(P[id(i, j)]);
      }
  };
  const step = (h, time) => {
    const h2 = h * h;
    for (let j = 0; j < NY; j++)
      for (let i = 1; i < NX; i++) {
        const k = id(i, j);
        const a = P[k];
        const b = Q[k];
        tmp.copy(a);
        const along = i / (NX - 1);
        // airflow streams it back, a gust ripples down it, a little gravity
        const gust = Math.sin(time * 7.2 - i * 0.5) * (0.4 + along);
        a.x += (a.x - b.x) * 0.965;
        a.y += (a.y - b.y) * 0.965;
        a.z += (a.z - b.z) * 0.965;
        a.addScaledVector(trailV, 3.2 * h2).addScaledVector(up, (gust * 1.1 - 0.35) * h2).addScaledVector(view, Math.cos(time * 6.1 - i * 0.45) * 0.7 * along * h2);
        b.copy(tmp);
      }
    // springs along and across, a few passes
    for (let it = 0; it < 7; it++) {
      for (let j = 0; j < NY; j++)
        for (let i = 0; i < NX; i++) {
          if (i + 1 < NX) link(id(i, j), id(i + 1, j), dx, i === 0);
          if (j + 1 < NY) link(id(i, j), id(i, j + 1), dy, i === 0);
          // bending: every other point, so the cloth ripples but never folds over itself
          if (i + 2 < NX) link(id(i, j), id(i + 2, j), dx * 2, i === 0);
          if (j + 2 < NY) link(id(i, j), id(i, j + 2), dy * 2, i === 0);
          if (i + 1 < NX && j + 1 < NY) link(id(i, j), id(i + 1, j + 1), Math.hypot(dx, dy), i === 0);
        }
      // the front edge is a rod between the two ropes
      for (let j = 0; j < NY; j++) P[id(0, j)].lerpVectors(pinTop, pinBot, j / (NY - 1));
    }
  };
  const link = (a, b, rest, pinnedA) => {
    tmp.subVectors(P[b], P[a]);
    const d = tmp.length() || 1e-6;
    const k = (d - rest) / d;
    if (pinnedA) P[b].addScaledVector(tmp, -k);
    else {
      P[a].addScaledVector(tmp, k * 0.5);
      P[b].addScaledVector(tmp, -k * 0.5);
    }
  };

  return {
    plane,
    banner,
    // returns true while flying. `hire`: fly in and hover over the planet (the Hire me view)
    update(now, paused, hire, still) {
      right.set(1, 0, 0).applyQuaternion(camera.quaternion);
      up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
      view.copy(fwd).negate();
      let dir; // -1 flying left (the flyby), +1 flying right (hovering, facing the form)
      if (hire || hov > 0) {
        // Hire me: in from the left, then a slow hover over the planet; out to the right after
        if (hire && hov === 0) {
          hov = 1;
          h0 = now;
          t0 = -1;
          last = now;
          relay = true;
          show(true);
        }
        if (!hire && hov === 1) {
          hov = 2;
          h0 = now;
        }
        dir = 1;
        const k = Math.min(1, (now - h0) / 1800);
        const e = hov === 1 ? 1 - Math.pow(1 - k, 3) : k * k;
        const x = hov === 1 ? -1.6 + 1.68 * e : 0.08 + 1.9 * e;
        if (hov === 2 && k >= 1) {
          hov = 0;
          show(false);
          next = now + EVERY;
          return false;
        }
        p.set(still ? 0 : x, 0.5 + Math.sin(now * 0.0019) * 0.03, 0.6).unproject(camera);
      } else {
        if (t0 < 0) {
          if (now < next || paused || still) return false;
          t0 = now;
          last = now;
          relay = true;
          show(true);
        }
        const t = (now - t0) / DUR;
        if (t >= 1) {
          t0 = -1;
          next = now + EVERY;
          show(false);
          return false;
        }
        dir = -1;
        p.set(1.55 - 3.4 * t, 0.66 + Math.sin(now * 0.0016) * 0.03, 0.6).unproject(camera);
      }
      if (dir !== lastDir) {
        lastDir = dir;
        clothMat.map = clothMat.emissiveMap = dir > 0 ? texR : tex;
        clothMat.needsUpdate = true;
        const uv = geo.attributes.uv;
        for (let k = 0; k < uv.count; k++) uv.setX(k, dir > 0 ? 1 - uv0[k] : uv0[k]);
        uv.needsUpdate = true;
        relay = true;
      }
      trailV.copy(right).multiplyScalar(-dir);
      plane.position.copy(p);
      // it flies level with the ground (not square to the screen), so the camera looks down onto it
      // from above and both wings show; the nose is turned a little toward the viewer
      plane.up.set(0, 1, 0);
      flatR.set(right.x, 0, right.z).normalize();
      flatV.set(view.x, 0, view.z).normalize();
      tgt.copy(p).addScaledVector(flatR, dir).addScaledVector(flatV, 0.35);
      plane.lookAt(tgt);
      plane.rotateZ(Math.sin(now * 0.0021) * 0.08 + 0.05 * -dir);
      if (prop) prop.rotation.z += 0.42;
      plane.updateMatrixWorld(true);
      if (tow) tow.getWorldPosition(towW);
      else towW.copy(p).addScaledVector(trailV, 0.17);
      pins();
      if (relay) {
        lay();
        relay = false;
      }
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      for (let n = Math.ceil(dt / 0.008), h = dt / n; n > 0; n--) step(h, now / 1000);
      const pos = geo.attributes.position;
      for (let k = 0; k < P.length; k++) pos.setXYZ(k, P[k].x, P[k].y, P[k].z);
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      const r = ropeGeo.attributes.position;
      r.setXYZ(0, towW.x, towW.y, towW.z);
      r.setXYZ(1, pinTop.x, pinTop.y, pinTop.z);
      r.setXYZ(2, towW.x, towW.y, towW.z);
      r.setXYZ(3, pinBot.x, pinBot.y, pinBot.z);
      r.needsUpdate = true;
      return true;
    },
    hit(ray) {
      return banner.visible && ray.intersectObject(banner, false).length > 0;
    },
  };
}
