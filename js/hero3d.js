import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (화면 전체 자유 배치 버전)
========================================================= */

export function initHero3D() {
  const container = document.getElementById("hero-3d");
  if (!container) return;

  /* =====================================================
     SCENE & CAMERA
     (넓은 배치를 위해 FOV를 더 넓히고 카메라를 뒤로 뺐습니다)
  ===================================================== */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    48, // 화면 전체를 커버하기 위해 화각을 더 넓힙니다 (기존 34)
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 25); // 배치를 위해 카메라를 뒤로 더 이동 (기존 15)

  /* =====================================================
     RENDERER
  ===================================================== */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  container.appendChild(renderer.domElement);

  /* =====================================================
     GRAPHIC GROUP
  ===================================================== */
  const group = new THREE.Group();
  scene.add(group);

  /* =====================================================
     LINE MATERIAL
  ===================================================== */
  const material = new THREE.LineBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.58,
  });

  /* =====================================================
     FONT LOADER & 다중 배치
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
  "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
  (font) => {

    /* =================================================
       U · X · X · X · U
       HERO 전체 화면 자유 배치
    ================================================= */

    // ① U — 왼쪽 중단 / 큰 사이즈
    createLetter(
      "U",
      font,
      -4.8,
      0.25,
      -0.42,
      -0.08,
      0.78,
      0
    );

    // ② X — 왼쪽 상단
    createLetter(
      "X",
      font,
      -2.1,
      2.75,
      0.28,
      0.08,
      0.46,
      1.7
    );

    // ③ X — 중앙 / 가장 작게
    createLetter(
      "X",
      font,
      1.15,
      1.55,
      -0.20,
      -0.04,
      0.38,
      3.2
    );

    // ④ X — 오른쪽 상단
    createLetter(
      "X",
      font,
      4.35,
      2.45,
      0.34,
      0.06,
      0.62,
      4.8
    );

    // ⑤ U — 오른쪽 하단
    createLetter(
      "U",
      font,
      4.85,
      -1.75,
      0.30,
      -0.05,
      0.54,
      6.1
    );

  },
  undefined,
  (error) => {
    console.error("Hero font load failed:", error);
  }
);

  /* =====================================================
     CREATE 3D LINE LETTER (EDGES GEOMETRY)
  ===================================================== */
 function createLetter(
  character,
  font,
  x,
  y,
  rotationY,
  rotationX,
  scale,
  phase
) {

  /* =================================================
     2D SHAPE
     앞면의 U / X 외곽선을 기준으로 생성
  ================================================= */

  const shapes = font.generateShapes(character, 4.1);

  const depth = 0.72;

  const points = [];

  /* =================================================
     SHAPE PATH 추출
     앞면 외곽선 + 홀( U 내부 ) 외곽선
  ================================================= */

  shapes.forEach((shape) => {

    const outer = shape.getPoints(32);

    points.push({
      type: "outer",
      points: outer
    });

    shape.holes.forEach((hole) => {

      const holePoints = hole.getPoints(32);

      points.push({
        type: "hole",
        points: holePoints
      });

    });

  });


  /* =================================================
     전체 중심 계산
  ================================================= */

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  points.forEach((path) => {

    path.points.forEach((p) => {

      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);

      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);

    });

  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;


  /* =================================================
     LINE POSITION
  ================================================= */

  const positions = [];

  const frontZ = depth / 2;
  const backZ = -depth / 2;


  /* =================================================
     ① 앞면 외곽선
     
     앞쪽 U 라인은 하나만 존재
  ================================================= */

  points.forEach((path) => {

    const pts = path.points;

    for (let i = 0; i < pts.length; i++) {

      const a = pts[i];
      const b = pts[(i + 1) % pts.length];

      positions.push(
        a.x - centerX,
        a.y - centerY,
        frontZ,

        b.x - centerX,
        b.y - centerY,
        frontZ
      );

    }

  });


  /* =================================================
     ② 측면 깊이선
     
     뒤쪽 외곽선을 그리지 않고
     앞 → 뒤로 연결되는 선만 생성
  ================================================= */

  points.forEach((path) => {

    const pts = path.points;

    /*
      모든 점에 선을 만들면 너무 촘촘해지므로
      일정 간격으로만 측면선을 생성
    */

    const step = Math.max(
      1,
      Math.floor(pts.length / 18)
    );

    for (let i = 0; i < pts.length; i += step) {

      const p = pts[i];

      positions.push(
        p.x - centerX,
        p.y - centerY,
        frontZ,

        p.x - centerX,
        p.y - centerY,
        backZ
      );

    }

  });


  /* =================================================
     BUFFER GEOMETRY
  ================================================= */

  const lineGeometry =
    new THREE.BufferGeometry();

  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions,
      3
    )
  );


  /* =================================================
     LINE
  ================================================= */

  const wire =
    new THREE.LineSegments(
      lineGeometry,
      material
    );


  /* =================================================
     POSITION / SCALE / ROTATION
  ================================================= */

  wire.position.set(
    x,
    y,
    0
  );

  wire.scale.setScalar(scale);

  wire.rotation.y = rotationY;

  wire.rotation.x = rotationX;


  /* =================================================
     MOTION DATA
  ================================================= */

  wire.userData = {

    baseX: x,

    baseY: y,

    baseRotationY:
      rotationY,

    baseRotationX:
      rotationX,

    phase: phase

  };


  group.add(wire);
}

  /* =====================================================
     MOUSE & INTERACTION (모션 느낌 유지)
  ===================================================== */
  const target = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0 };

  window.addEventListener(
    "mousemove",
    (event) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  /* =====================================================
     RESIZE
  ===================================================== */
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
  }

  window.addEventListener("resize", resize);

  /* =====================================================
     ANIMATION LOOP (모션 느낌 유지)
  ===================================================== */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // 마우스 팔로잉 (Lerp)
    mouse.x += (target.x - mouse.x) * 0.035;
    mouse.y += (target.y - mouse.y) * 0.035;

    group.children.forEach((object) => {
      const phase = object.userData.phase;

      // 1. 부유 모션 (둥실거림) - 그대로 유지
      object.position.x =
        object.userData.baseX + Math.sin(time * 0.55 + phase) * 0.1;
      object.position.y =
        object.userData.baseY + Math.cos(time * 0.7 + phase) * 0.12;

      // 2. 마우스 반응 회전 - 그대로 유지 (baseRotationX 기반으로 수정)
      object.rotation.y = object.userData.baseRotationY + mouse.x * 0.18;
      object.rotation.x = object.userData.baseRotationX + mouse.y * 0.06;
    });

    renderer.render(scene, camera);
  }

  resize();
  animate();
}
