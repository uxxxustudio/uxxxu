import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (면 경계가 명확히 살아나는 입체 아크릴 글래스)
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
     LIGHTS (면의 각도 명암 대비를 극대화하는 조명 세팅)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  // 1. 앞면을 밝게 비추는 직사광
  const frontLight = new THREE.DirectionalLight(0xffffff, 4.0);
  frontLight.position.set(5, 10, 15);
  scene.add(frontLight);

  // 2. 측면 음영을 살려주는 우측 쿨그레이 조명
  const sideLight = new THREE.DirectionalLight(0xc1c7cd, 3.5);
  sideLight.position.set(-15, -5, 5);
  scene.add(sideLight);

  // 3. 모서리 베벨 선을 쨍하게 찍어주는 림라이트
  const rimLight = new THREE.DirectionalLight(0xffffff, 5.0);
  rimLight.position.set(12, 12, -2);
  scene.add(rimLight);

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
     MATERIALS (앞면과 측면 분리 적용)
  ===================================================== */
  // 1. 외곽 테두리선 (X 글자용)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.3,
  });

  // 2-A. 앞면 매터리얼 (맑고 높은 투과율)
  const frontMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.92,        // 뒤쪽 글자 맑게 투과
    ior: 1.45,
    transparent: true,
    opacity: 0.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.8,
    depthWrite: true,
  });

  // 2-B. 측면/두께 매터리얼 (살짝 톤이 잡히며 꺾이는 경계 강조)
  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdce2df,            // 옅은 음영 톤
    roughness: 0.15,            // 약간 매트하게 꺾이는 텍스처
    metalness: 0.0,
    transmission: 0.75,         // 측면은 좀 더 밀도감 있게
    ior: 1.5,
    transparent: true,
    opacity: 0.55,              // 앞면보다 짙어서 경계선이 뚜렷해짐
    clearcoat: 0.5,
    depthWrite: true,
  });

  /* =====================================================
     FONT LOADER & BATCH CREATION
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      // 1. 메인 U (멀티 매터리얼 분리 + 테두리)
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
          depth: 0.75,               // 두께감을 조금 늘려 각도 부각
          curveSegments: 32,
          bevelEnabled: true,
          bevelThickness: 0.1,       // 깎이는 모서리 강화
          bevelSize: 0.08,
          bevelOffset: 0,
          bevelSegments: 6,
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

    // U 글자에 앞면/측면 멀티 매터리얼 적용 [앞/뒷면, 측면]
    if (isU) {
      const mesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
      letterGroup.add(mesh);
    }

    // 외곽 테두리선
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
