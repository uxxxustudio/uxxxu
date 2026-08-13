import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Chromatic Dispersion 프리즘 글래스 적용)
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
     LIGHTS (프리즘 하이라이트 극대화 조명 세팅)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // 프리즘 빛갈림을 만들어내는 메인 딥 조명
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(7, 12, 8);
  scene.add(keyLight);

  // 은은한 #DCE2DF 보조 림라이트
  const fillLight = new THREE.DirectionalLight(0xdce2df, 1.8);
  fillLight.position.set(-7, -6, 6);
  scene.add(fillLight);

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
  // 1. 외곽 테두리선
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.65,
  });

  // 2. Chromatic Dispersion 프리즘 글래스 재질 (U 전용)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdce2df,
    roughness: 0.06,          // 표면을 아주 매끄럽게 잡아 분광을 선명하게 함
    metalness: 0.02,
    transmission: 0.88,       // 맑은 빛 투과율
    ior: 1.52,                // 유리 고유 굴절률 (Glass IOR)
    thickness: 1.8,           // 두께감이 입혀져 내부 빛갈림 형성
    dispersion: 0.18,         // ★ 프리즘 무지갯빛 분광 효과
    clearcoat: 1.0,           // 유리 표면 쨍한 반사 코팅
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.85,
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
      // 1. 메인 U (프리즘 글래스 + 테두리 라인)
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

    // U 글자에 프리즘 글래스 Mesh 추가
    if (isU) {
      const mesh = new THREE.Mesh(geometry, glassMaterial);
      letterGroup.add(mesh);
    }

    // 테두리 라인 유지
    const wireGeometry = new THREE.EdgesGeometry(geometry, 20);
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
     RESIZE & RESPONSIVE SCALE (모바일 자동 보정)
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
