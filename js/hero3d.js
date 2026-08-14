import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Angled Perspective Grid & Crisp Object Lines)
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
     LIGHTS (마우스 추적 하이라이트 + 오로라 3색 광원)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xe0f2fe, 1.2);
  scene.add(ambientLight);

  // 마우스 추적 백색 핀 조명 (#ffffff 하이라이트)
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

  // 상단 태양광 (Warm Cream)
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
     BACKGROUND ANGLED GRID (원근 각도가 살아있는 은은한 3D 그리드)
  ===================================================== */
  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, -0.5, -5);

  // ★ 공간감이 느껴지도록 X, Y축을 경사지게 기울임 (투시 원근감 연출)
  gridGroup.rotation.x = Math.PI * 0.12;  // 위아래 입체 각도
  gridGroup.rotation.y = -Math.PI * 0.08; // 좌우 소실점 각도

  // 아주 가볍고 실선처럼 실피하게 지나가는 그리드 라인
  const gridHelper = new THREE.GridHelper(45, 18, 0x94a3b8, 0xe2e8f0);
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.1; // 아주 연하게 '느낌만' 주도록 설정
  gridGroup.add(gridHelper);

  // 십자(+) 포인트
  const crossMaterial = new THREE.LineBasicMaterial({
    color: 0x64748b,
    transparent: true,
    opacity: 0.15,
  });

  for (let x = -15; x <= 15; x += 5) {
    for (let z = -15; z <= 15; z += 5) {
      const crossGeo = new THREE.BufferGeometry();
      const s = 0.12;
      const vertices = new Float32Array([
        x - s, 0, z,  x + s, 0, z,
        x, 0, z - s,  x, 0, z + s
      ]);
      crossGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const cross = new THREE.LineSegments(crossGeo, crossMaterial);
      gridGroup.add(cross);
    }
  }
  scene.add(gridGroup);

  /* =====================================================
     MATERIALS (투명 오로라 유무 + 또렷한 라인)
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

  // ★ 오브젝트 테두리 & X 형태 와이어프레임 라인 (진하고 선명하게 수정)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a,            // 진한 다크 슬레이트 네이비
    transparent: true,
    opacity: 0.68,              // 선명도가 살아나도록 0.68로 상향
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

    // 진하고 또렷해진 EdgesGeometry 와이어프레임
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

    // 마우스 따라 움직이는 백색 하이라이트
    mouseLight.position.x = mouse.x * 12;
    mouseLight.position.y = mouse.y * 8;
    mouseLight.position.z = 6;

    // 각도가 들어간 배경 그리드 패럴랙스
    gridGroup.position.x = -mouse.x * 0.4;
    gridGroup.position.y = -0.5 - mouse.y * 0.3;

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
