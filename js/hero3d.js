import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (하이엔드 베벨 글래스 & 스튜디오 림라이트)
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
     STUDIO LIGHTING (유리 엣지 반사광 극대화)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // 1. 모서리에 쨍한 하이라이트를 만드는 주 핀 조명
  const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
  keyLight.position.set(10, 15, 12);
  scene.add(keyLight);

  // 2. 우측 상단에서 비추어 입체감을 살리는 림 라이트
  const rimLight = new THREE.DirectionalLight(0xffffff, 3.0);
  rimLight.position.set(-10, 10, -5);
  scene.add(rimLight);

  // 3. 하단 입체감을 돋보이게 하는 리플렉션 조명
  const fillLight = new THREE.DirectionalLight(0xdce2df, 2.0);
  fillLight.position.set(-6, -10, 8);
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
    color: 0x111111,
    transparent: true,
    opacity: 0.4,
  });

  // 2. 프리미엄 아크릴 글래스 재질 (U 글자용)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.08,           // 매끄러운 표면광
    metalness: 0.0,
    transmission: 0.9,         // 높은 투과율로 뒤쪽 HTML 글자 투과
    ior: 1.48,                 // 아크릴/유리 고유 굴절률
    thickness: 1.2,            // 두께감 있는 빛 분산
    transparent: true,
    opacity: 0.35,              // 맑게 떨어지는 틴트
    clearcoat: 1.0,            // 표면 강한 코팅 반사층
    clearcoatRoughness: 0.05,  // 엣지 반사를 선명하게
    reflectivity: 0.8,
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
      // 1. 메인 U (베벨 글래스 + 테두리 라인)
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
     CREATE 3D LETTER (Bevel 입체 곡면 추가)
  ===================================================== */
  function createLetter(character, font, x, y, rotationY, scale, phase) {
    const isU = character === "U";

    // U 글자에 고급스러운 모서리 Bevel(라운딩 깎기) 적용
    const geometryOptions = isU
      ? {
          font: font,
          size: 4.1,
          depth: 0.65,
          curveSegments: 32,
          bevelEnabled: true,       // ★ 핵심: 모서리 곡면 깎기 활성화
          bevelThickness: 0.08,    // 깎이는 깊이
          bevelSize: 0.06,         // 깎이는 너비
          bevelOffset: 0,
          bevelSegments: 8,        // 모서리를 아주 부드럽게
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

    // U 글자에 베벨 글래스 Mesh 추가
    if (isU) {
      const mesh = new THREE.Mesh(geometry, glassMaterial);
      letterGroup.add(mesh);
    }

    // 테두리 라인 유지
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
