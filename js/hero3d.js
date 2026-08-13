import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS
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
     FONT LOADER
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      createLetter("U", font, -2.9, -0.65, -0.42, 0.92, 0);
      createLetter("X", font, 2.25, 0.55, 0.42, 0.88, 1.7);
    },
    undefined,
    (error) => {
      console.error("Hero font load failed:", error);
    }
  );

  /* =====================================================
   CREATE 3D LINE LETTER (EDGES GEOMETRY FIX)
===================================================== */
function createLetter(character, font, x, y, rotationY, scale, phase) {
  // 1. bevelEnabled를 false로 설정하거나 베벨 값을 최소화하여 명확한 3D 두께 형성
  const geometry = new TextGeometry(character, {
    font: font,
    size: 4.1,
    depth: 0.8,         // 입체 두께감 유지
    curveSegments: 12,  // U자의 곡면을 더 부드럽게 표현
    bevelEnabled: false, // 통 입체감을 위해 베벨 비활성화 (권장)
  });

  geometry.computeBoundingBox();

  /* Center Geometry */
  const box = geometry.boundingBox;
  const centerX = (box.max.x + box.min.x) / 2;
  const centerY = (box.max.y + box.min.y) / 2;

  geometry.translate(-centerX, -centerY, 0);

  /* =================================================
      OUTLINE EDGES (임계각을 낮추어 앞/뒤 연결선 복원)
  ================================================= */
  // 20도 -> 3도로 변경하여 U자의 곡면 측면 연결선(Depth Edges)이 생략되지 않도록 처리
  const wireGeometry = new THREE.EdgesGeometry(geometry, 3);

  const wire = new THREE.LineSegments(wireGeometry, material);

  wire.position.set(x, y, 0);
  wire.scale.setScalar(scale);
  wire.rotation.y = rotationY;
  wire.rotation.x = -0.08;

  wire.userData = {
    baseX: x,
    baseY: y,
    baseRotationY: rotationY,
    phase: phase,
  };

  group.add(wire);
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
        object.userData.baseX + Math.sin(time * 0.55 + phase) * 0.1;
      object.position.y =
        object.userData.baseY + Math.cos(time * 0.7 + phase) * 0.12;

      object.rotation.y = object.userData.baseRotationY + mouse.x * 0.18;
      object.rotation.x = -0.08 + mouse.y * 0.06;
    });

    renderer.render(scene, camera);
  }

  resize();
  animate();
}
