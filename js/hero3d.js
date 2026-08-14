import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Haoqi Design Style - Aurora Glass Tube)
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
     LIGHTS (오로라/유리 림라이트 4점 조명)
  ===================================================== */
  // 기본 은은한 환경광
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  // 1. 우측 상단 쨍한 스카이블루 림라이트 (메인 반사)
  const keyLight = new THREE.DirectionalLight(0x38bdf8, 6.0);
  keyLight.position.set(12, 15, 10);
  scene.add(keyLight);

  // 2. 좌측 상단 은은한 핑크/바이올렛 림라이트
  const violetLight = new THREE.DirectionalLight(0xc084fc, 5.0);
  violetLight.position.set(-12, 10, -2);
  scene.add(violetLight);

  // 3. 하단 레몬/화이트 하이라이트 (튜브 곡면 부각)
  const bottomLight = new THREE.DirectionalLight(0xfef08a, 3.0);
  bottomLight.position.set(0, -12, 8);
  scene.add(bottomLight);

  // 4. 중앙 쨍한 화이트 핀 조명 (글래스 반짝임 생성)
  const pointLight = new THREE.PointLight(0xffffff, 4.0, 20);
  pointLight.position.set(0, 2, 8);
  scene.add(pointLight);

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
     AURORA TUBE GLASS MATERIAL (레퍼런스 특유의 오로라 유리)
  ===================================================== */
  const tubeGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc7d2fe,             // 소프트 퍼리윙클 블루 베이스
    roughness: 0.08,             // 맑고 표면 광택이 강한 매끈함
    metalness: 0.1,
    transmission: 0.85,          // 뒤쪽 배경 및 텍스트 맑게 투과
    ior: 1.42,                   // 튜브 유리 특유의 소프트한 굴절
    thickness: 2.2,              // 오로라 빛이 내부에 차오르는 두께감
    attenuationColor: 0x6366f1,  // 내부 산란 인디고/블루 틴트
    attenuationDistance: 1.8,
    transparent: true,
    opacity: 0.5,
    clearcoat: 1.0,              // 쨍한 코팅 반사 layer
    clearcoatRoughness: 0.03,    // 모서리 반사를 아주 쨍하게
    reflectivity: 0.95,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.25,
  });

  /* =====================================================
     FONT LOADER & BATCH CREATION
  ===================================================== */
  const loader = new FontLoader();

  // 곡선이 부드러운 폰트로 가져옵니다
  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      // 1. 메인 U (통통하고 곡면 베벨이 진하게 들어간 튜브 폰트)
      createLetter("U", font, -2.9, -0.65, -0.42, 0.92, 0);

      // 2. 메인 X
      createLetter("X", font, 2.25, 0.55, 0.42, 0.88, 1.7);

      // 3. 미니 X들
      createLetter("X", font, -2.3, 3.8, 0.35, 0.52, 0.8);
      createLetter("X", font, 5.3, -3.2, 0.45, 0.55, 2.3);
    },
    undefined,
    (error) => {
      console.error("Hero font load failed:", error);
    }
  );

  /* =====================================================
     CREATE 3D LETTER (둥글둥글한 튜브 라운딩 베벨)
  ===================================================== */
  function createLetter(character, font, x, y, rotationY, scale, phase) {
    const isU = character === "U";

    // 튜브 느낌을 내기 위해 Bevel Thickness와 Size를 크게 주어 둥글게 깎음
    const geometryOptions = isU
      ? {
          font: font,
          size: 4.1,
          depth: 0.4,                // 두께는 살짝 줄이고
          curveSegments: 32,
          bevelEnabled: true,
          bevelThickness: 0.35,      // ★ 극적으로 모서리를 둥글게 만들어 튜브 형태화
          bevelSize: 0.25,           // ★ 볼륨감 있는 곡면
          bevelOffset: 0,
          bevelSegments: 16,         // 완벽히 부드러운 곡면
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

    if (isU) {
      const mesh = new THREE.Mesh(geometry, tubeGlassMaterial);
      letterGroup.add(mesh);
    }

    // 외곽 Wireframe
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

    // 조명 약간 둥둥 뜨는 모션으로 오로라 반사 연출
    pointLight.position.x = Math.sin(time * 0.8) * 4;
    pointLight.position.y = Math.cos(time * 0.6) * 3 + 2;

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
