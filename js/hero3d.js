import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (맑은 프리미엄 글래스 질감 수정 버전)
========================================================= */

export function initHero3D() {
  const container = document.getElementById("hero-3d");
  if (!container) return;

  /* =====================================================
     SCENE & CAMERA
  ===================================================== */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  /* =====================================================
     LIGHTS (유리 반사 및 림라이트)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  // 유리 모서리 하이라이트를 위한 메인 조명
  const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
  mainLight.position.set(6, 10, 8);
  scene.add(mainLight);

  // 은은한 #DCE2DF 림라이트
  const rimLight = new THREE.DirectionalLight(0xdce2df, 1.2);
  rimLight.position.set(-8, -6, 5);
  scene.add(rimLight);

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
     MATERIALS
  ===================================================== */
  // 1. 앞쪽 선명한 외곽선
  const frontLineMaterial = new THREE.LineBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.55,
    depthTest: true,
  });

  // 2. 유리 너머 비치는 뒷선 (약간 굴절되어 비치는 느낌)
  const backLineMaterial = new THREE.LineBasicMaterial({
    color: 0x222222,
    transparent: true,
    opacity: 0.22,
    depthTest: false,
  });

  // 3. 물리 기반 맑은 글래스 재질 (MeshPhysicalMaterial)
  const clearGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdce2df,         // 메인 틴트 컬러
    metalness: 0.0,          // 금속성 제거 (탁함 방지)
    roughness: 0.08,         // 표면을 매우 매끄럽게
    transmission: 0.88,      // 맑은 빛 투과율
    ior: 1.18,               // 자연스러운 유리 굴절률
    transparent: true,
    opacity: 0.25,           // 베이스 알맹이 투명도
    clearcoat: 1.0,          // 유리 표면 쨍한 코팅층
    clearcoatRoughness: 0.05,
    reflectivity: 0.5,
    depthWrite: false,       // 맑게 겹쳐보이도록 처리
  });

  /* =====================================================
     FONT LOADER
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      // 1. 메인 U (맑은 글래스 적용)
      createLetter("U", font, -2.9, -0.65, -0.42, 0.92, 0);

      // 2. 메인 X
      createLetter("X", font, 2.25, 0.55, 0.42, 0.88, 1.7);

      // 3. 상단 미니 X
      createLetter("X", font, -2.3, 3.8, 0.35, 0.52, 0.8);

      // 4. 하단 우측 미니 X
      createLetter("X", font, 5.3, -3.2, 0.45, 0.55, 2.3);
    },
    undefined,
    (error) => {
      console.error("Hero font load failed:", error);
    }
  );

  /* =====================================================
     CREATE 3D LETTER
  ===================================================== */
  function createLetter(character, font, x, y, rotationY, scale, phase) {
    const isU = character === "U";

    const geometry = new TextGeometry(character, {
      font: font,
      size: 4.1,
      depth: 0.72,
      curveSegments: isU ? 30 : 1,
      bevelEnabled: false,
    });

    geometry.computeBoundingBox();

    /* Center Geometry */
    const box = geometry.boundingBox;
    const centerX = (box.max.x + box.min.x) / 2;
    const centerY = (box.max.y + box.min.y) / 2;

    geometry.translate(-centerX, -centerY, 0);

    const letterGroup = new THREE.Group();
    const wireGeometry = new THREE.EdgesGeometry(geometry, 20);

    if (isU) {
      // [1] 유리 너머로 은은하게 비치는 뒷선
      const backWire = new THREE.LineSegments(wireGeometry, backLineMaterial);
      backWire.renderOrder = 0;
      letterGroup.add(backWire);

      // [2] 맑은 반투명 유리 메쉬
      const mesh = new THREE.Mesh(geometry, clearGlassMaterial);
      mesh.renderOrder = 1;
      letterGroup.add(mesh);

      // [3] 가장 앞쪽 외곽선
      const frontWire = new THREE.LineSegments(wireGeometry, frontLineMaterial);
      frontWire.renderOrder = 2;
      letterGroup.add(frontWire);
    } else {
      const wire = new THREE.LineSegments(wireGeometry, frontLineMaterial);
      letterGroup.add(wire);
    }

    letterGroup.position.set(x, y, 0);
    letterGroup.scale.setScalar(scale);
    letterGroup.rotation.y = rotationY;
    letterGroup.rotation.x = -0.08;

    letterGroup.userData = {
      baseX: x,
      baseY: y,
      baseRotationY: rotationY,
      phase: phase,
    };

    group.add(letterGroup);
  }

  /* =====================================================
     MOUSE & INTERACTION
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
     ANIMATION LOOP
  ===================================================== */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    mouse.x += (target.x - mouse.x) * 0.035;
    mouse.y += (target.y - mouse.y) * 0.035;

    group.children.forEach((object) => {
      const phase = object.userData.phase;

      object.position.x =
        object.userData.baseX + Math.sin(time * 0.55 + phase) * 0.08;
      object.position.y =
        object.userData.baseY + Math.cos(time * 0.7 + phase) * 0.1;

      object.rotation.y = object.userData.baseRotationY + mouse.x * 0.15;
      object.rotation.x = -0.08 + mouse.y * 0.05;
    });

    renderer.render(scene, camera);
  }

  resize();
  animate();
}
