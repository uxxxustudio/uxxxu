import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Option A: Minimal Crystal Glass)
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
     LIGHTS (맑고 깨끗한 스튜디오 조명)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // 1. 메인 핀 조명 (모서리 하이라이트)
  const keyLight = new THREE.DirectionalLight(0xffffff, 5.0);
  keyLight.position.set(10, 15, 12);
  scene.add(keyLight);

  // 2. 소프트 반사 림라이트
  const rimLight = new THREE.DirectionalLight(0xe2e8f0, 3.5);
  rimLight.position.set(-10, 10, -5);
  scene.add(rimLight);

  // 3. 하단 입체 보조광
  const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
  fillLight.position.set(0, -10, 8);
  scene.add(fillLight);

  /* =====================================================
     RENDERER
  ===================================================== */
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
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
  // 1. 외곽 테두리선 (X 글자용)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.35,
  });

  // 2. 무채색 크리스탈 글래스 (U 글자용)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,            // Pure White
    roughness: 0.04,            // 매끄러운 유리 질감
    metalness: 0.0,
    transmission: 0.95,         // 높은 투과율 (뒤쪽 텍스트 명확히 투과)
    ior: 1.48,                  // 크리스탈/아크릴 굴절률
    thickness: 1.0,             // 맑고 가벼운 두께감
    attenuationColor: 0xffffff, // 둔탁함 없는 Pure White 산란
    transparent: true,
    opacity: 0.3,               // 맑게 떨어지는 틴트
    clearcoat: 1.0,             // 표면 쨍한 투명 코팅
    clearcoatRoughness: 0.02,
    reflectivity: 0.9,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  /* =====================================================
     FONT LOADER & BATCH CREATION
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      // 1. 메인 U (크리스탈 글래스 + 테두리)
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

    const geometryOptions = isU
      ? {
          font: font,
          size: 4.1,
          depth: 0.65,
          curveSegments: 32,
          bevelEnabled: true,
          bevelThickness: 0.09,
          bevelSize: 0.07,
          bevelOffset: 0,
          bevelSegments: 8,
        }
      : {
          font: font,
          size: 4.1,
          depth: 0.72,
          curveSegments: 1,
          bevelEnabled: false,
        };

    const geometry = new TextGeometry(character, geometryOptions);

    geometry.computeBoundingBox();

    /* Center Geometry */
    const box = geometry.boundingBox;
    const centerX = (box.max.x + box.min.x) / 2;
    const centerY = (box.max.y + box.min.y) / 2;

    geometry.translate(-centerX, -centerY, 0);

    const letterGroup = new THREE.Group();

    // U 글자에 크리스탈 글래스 Mesh 추가
    if (isU) {
      const mesh = new THREE.Mesh(geometry, glassMaterial);
      letterGroup.add(mesh);
    }

    // 테두리선 유지
    const wireGeometry = new THREE.EdgesGeometry(geometry, 25);
    const wire = new THREE.LineSegments(wireGeometry, lineMaterial);
    letterGroup.add(wire);

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
     RESIZE & RESPONSIVE SCALE
  ===================================================== */
  function updateResponsiveScale() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    const isMobile = window.innerWidth < 768;

    camera.aspect = width / height;
    camera.position.z = isMobile ? 18.5 : 15;
    camera.updateProjectionMatrix();

    const targetScale = isMobile ? 0.68 : 1.0;
    group.scale.setScalar(targetScale);

    renderer.setSize(width, height, false);
  }

  function resize() {
    updateResponsiveScale();
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
