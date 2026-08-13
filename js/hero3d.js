import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (U 곡선 복원 및 통 입체 최적화 버전)
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
   CREATE 3D LINE LETTER (U/X 개별 최적화 - 최종 해결책)
===================================================== */
function createLetter(character, font, x, y, rotationY, scale, phase) {
  
  // [핵심 수정 포인트] U와 X에 대해 각각 다른 지오메트리 옵션을 설정합니다.
  const textOptions = {
    font: font,
    size: 4.1,
    depth: 0.72,
    curveSegments: 8, // 부드러운 곡선을 위해 기본 세그먼트를 8로 복원
  };

  if (character === "U") {
    // [U 해결책] 곡면 겹침 및 지저분한 선 발생을 완전히 막기 위해 베벨을 끕니다. (깔끔한 직각 입체 형성)
    textOptions.bevelEnabled = false;
  } else {
    // [X 유지] 각진 형태를 위해 베벨 옵션을 기존처럼 유지합니다.
    textOptions.bevelEnabled = true;
    textOptions.bevelThickness = 0.09;
    textOptions.bevelSize = 0.055;
    textOptions.bevelSegments: 2;
  }

  const geometry = new TextGeometry(character, textOptions);

  geometry.computeBoundingBox();

  /* Center Geometry */
  const box = geometry.boundingBox;
  const centerX = (box.max.x + box.min.x) / 2;
  const centerY = (box.max.y + box.min.y) / 2;

  geometry.translate(-centerX, -centerY, 0);

  /* =================================================
     OUTLINE EDGES ONLY (임계각 최적화)
   ================================================= */
  // 꺾임 기준 각도를 대폭 낮추어(2도), 부드러운 U자의 곡면 기둥 선들이 생략되지 않도록 처리
  const wireGeometry = new THREE.EdgesGeometry(geometry, 2);

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
