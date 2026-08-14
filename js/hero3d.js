import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Kakao Tech Style - Sharp 2D Layout Grid)
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
     LIGHTS (마우스 추적 하이라이트 + 오로라 광원)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xe0f2fe, 1.2);
  scene.add(ambientLight);

  // 마우스 추적 백색 핀 조명
  const mouseLight = new THREE.PointLight(0xffffff, 18.0, 25);
  scene.add(mouseLight);

  // 우측 상단 스카이블루 광원
  const skyLight = new THREE.DirectionalLight(0x0284c7, 6.0);
  skyLight.position.set(12, 10, 8);
  scene.add(skyLight);

  // 좌측 하단 코랄 핑크 포인트 광원
  const pinkLight = new THREE.DirectionalLight(0xf43f5e, 5.0);
  pinkLight.position.set(-12, -10, 6);
  scene.add(pinkLight);

  // 상단 태양광
  const sunLight = new THREE.DirectionalLight(0xfef08a, 4.0);
  sunLight.position.set(0, 15, 5);
  scene.add(sunLight);

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
     KAKAO STYLE 2D LAYOUT GRID (선명한 2D 세로/가로 그리드)
  ===================================================== */
  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, 0, -4); // 카메라 정면 평면에 배치

  const gridLines = [];
  const width = 36;   // 전체 화면 커버 폭
  const height = 24;  // 전체 화면 커버 높이
  const stepX = 2.4;  // 세로 격자 간격
  const stepY = 2.4;  // 가로 격자 간격

  // 1. 수직선 생성
  for (let x = -width / 2; x <= width / 2; x += stepX) {
    gridLines.push(x, -height / 2, 0, x, height / 2, 0);
  }

  // 2. 수평선 생성
  for (let y = -height / 2; y <= height / 2; y += stepY) {
    gridLines.push(-width / 2, y, 0, width / 2, y, 0);
  }

  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridLines, 3));

  // 선명하게 보이는 카카오 스타일 슬레이트 라인 매터리얼
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.22,      // 안 보이던 문제 해결 (선명도 대폭 보정)
  });

  const gridMesh = new THREE.LineSegments(gridGeo, gridMat);
  gridGroup.add(gridMesh);

  // 3. 교차점 (+) 십자 마크 시스템
  const crossMaterial = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.45,      // 십자 마크 포인트 강화
  });

  for (let x = -width / 2; x <= width / 2; x += stepX * 2) {
    for (let y = -height / 2; y <= height / 2; y += stepY * 2) {
      const crossGeo = new THREE.BufferGeometry();
      const s = 0.16; // 십자 크기
      const vertices = new Float32Array([
        x - s, y, 0,  x + s, y, 0,
        x, y - s, 0,  x, y + s, 0
      ]);
      crossGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const cross = new THREE.LineSegments(crossGeo, crossMaterial);
      gridGroup.add(cross);
    }
  }
  scene.add(gridGroup);

  /* =====================================================
     MATERIALS
  ===================================================== */
  const tubeGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    roughness: 0.02,
    metalness: 0.05,
    transmission: 0.88,
    ior: 1.48,
    thickness: 2.0,
    attenuationColor: 0x38bdf8,
    attenuationDistance: 2.0,
    transparent: true,
    opacity: 0.45,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    reflectivity: 1.0,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  // 또렷한 오브젝트 도면 라인
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.7,
  });

  /* =====================================================
     FONT LOADER & BATCH CREATION
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      // 1. 메인 U
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
     CREATE 3D LETTER
  ===================================================== */
  function createLetter(character, font, x, y, rotationY, scale, phase) {
    const isU = character === "U";

    const geometryOptions = isU
      ? {
          font: font,
          size: 4.1,
          depth: 0.4,
          curveSegments: 32,
          bevelEnabled: true,
          bevelThickness: 0.38,
          bevelSize: 0.28,
          bevelOffset: 0,
          bevelSegments: 16,
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

    const box = geometry.boundingBox;
    const centerX = (box.max.x + box.min.x) / 2;
    const centerY = (box.max.y + box.min.y) / 2;

    geometry.translate(-centerX, -centerY, 0);

    const letterGroup = new THREE.Group();

    if (isU) {
      const mesh = new THREE.Mesh(geometry, tubeGlassMaterial);
      letterGroup.add(mesh);
    }

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
      target.y = -(event.clientY / window.innerHeight) * 2 + 1;
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

    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;

    // 마우스 추적 하이라이트
    mouseLight.position.x = mouse.x * 12;
    mouseLight.position.y = mouse.y * 8;
    mouseLight.position.z = 6;

    // 카카오 2D 레이아웃 그리드 미세 패럴랙스
    gridGroup.position.x = -mouse.x * 0.3;
    gridGroup.position.y = -mouse.y * 0.2;

    group.children.forEach((object) => {
      const phase = object.userData.phase;

      object.position.x =
        object.userData.baseX + Math.sin(time * 0.55 + phase) * 0.08;
      object.position.y =
        object.userData.baseY + Math.cos(time * 0.7 + phase) * 0.1;

      object.rotation.y = object.userData.baseRotationY + mouse.x * 0.2;
      object.rotation.x = -0.08 - mouse.y * 0.1;
    });

    renderer.render(scene, camera);
  }

  resize();
  animate();
}
