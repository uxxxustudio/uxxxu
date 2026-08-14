import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Dynamic Gradient & Mouse Light & 3D Grid)
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
     LIGHTS (마우스 추적 하이라이트 + 삼색 오로라 그라데이션)
  ===================================================== */
  // 은은한 베이스 환경광
  const ambientLight = new THREE.AmbientLight(0xe0f2fe, 1.2);
  scene.add(ambientLight);

  // ★ 1. [핵심] 마우스를 따라다니는 강한 백색 핀 조명 (#ffffff 하이라이트 생성)
  const mouseLight = new THREE.PointLight(0xffffff, 18.0, 25);
  scene.add(mouseLight);

  // 2. 우측 상단: 깊은 스카이블루 광원
  const skyLight = new THREE.DirectionalLight(0x0284c7, 6.0);
  skyLight.position.set(12, 10, 8);
  scene.add(skyLight);

  // 3. 좌측 하단: 레퍼런스 특유의 포인트 코랄 핑크 광원 (그라데이션 형성)
  const pinkLight = new THREE.DirectionalLight(0xf43f5e, 5.0);
  pinkLight.position.set(-12, -10, 6);
  scene.add(pinkLight);

  // 4. 상단: 따스한 태양광 (Warm Cream)
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
     BACKGROUND SPATIAL GRID (공간감을 높이는 대형 그리드)
  ===================================================== */
  const gridGroup = new THREE.Group();
  gridGroup.position.z = -4; // 텍스트 뒤편 공간에 배치

  // 메인 대형 그리드 선
  const gridHelper = new THREE.GridHelper(30, 12, 0x94a3b8, 0xcbd5e1);
  gridHelper.rotation.x = Math.PI / 2; // 세로 벽면처럼 배치
  gridGroup.add(gridHelper);

  // 그리드 교차점십자(+) 포인트들
  const crossMaterial = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 });
  for (let x = -12; x <= 12; x += 5) {
    for (let y = -8; y <= 8; y += 4) {
      const crossGeo = new THREE.BufferGeometry();
      const s = 0.15; // 십자 크기
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
     MATERIALS (반사율과 빛 굴절을 극대화한 오로라 글래스)
  ===================================================== */
  const tubeGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,            // 아이시 스카이블루 베이스
    roughness: 0.02,            // 극도로 매끈한 표면 -> fff 하이라이트 쨍하게 맺힘
    metalness: 0.05,
    transmission: 0.88,         // 맑은 투과율
    ior: 1.48,                  // 튜브 곡면 굴절 강화
    thickness: 2.0,             // 빛이 오로라처럼 차오르는 깊이
    attenuationColor: 0x38bdf8, // 산란 스카이블루
    attenuationDistance: 2.0,
    transparent: true,
    opacity: 0.45,
    clearcoat: 1.0,             // 표면 코팅층 (강한 스펙큘러 생성)
    clearcoatRoughness: 0.0,    // 쨍한 #fff 반사 포인트를 위해 0으로 설정
    reflectivity: 1.0,
    depthWrite: true,
    side: THREE.DoubleSide,
  });

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x475569,
    transparent: true,
    opacity: 0.18,
  });

  /* =====================================================
     FONT LOADER & BATCH CREATION
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      // 1. 메인 U (통통한 튜브 베벨)
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
          bevelThickness: 0.38,      // 튜브 굴곡 강화
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
      target.y = -(event.clientY / window.innerHeight) * 2 + 1; // Y축 반전 보정
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

    // 부드러운 마우스 보평
    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;

    // ★ 마우스 위치에 따른 조명 움직임 (텍스트 곡면 표면에 쨍한 #ffffff 하이라이트 연출)
    mouseLight.position.x = mouse.x * 12;
    mouseLight.position.y = mouse.y * 8;
    mouseLight.position.z = 6; // 텍스트 앞쪽에서 비춤

    // 배경 그리드 미세 패럴랙스 (공간감 극대화)
    gridGroup.position.x = -mouse.x * 0.5;
    gridGroup.position.y = -mouse.y * 0.3;

    // 메인 그래픽 개체 회전 및 부유 반응
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
