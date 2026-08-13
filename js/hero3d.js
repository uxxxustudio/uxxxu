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
   CREATE 3D LINE LETTER (U/X 개별 최적화)
===================================================== */
function createLetter(character, font, x, y, rotationY, scale, phase) {
  // 베벨 옵션을 사용하여 3D 볼륨감을 극대화합니다. (기존 옵션 유지)
  const geometry = new TextGeometry(character, {
    font: font,
    size: 4.1,
    depth: 0.72,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.055,
    bevelSegments: 2,
  });

  geometry.computeBoundingBox();

  /* Center Geometry */
  const box = geometry.boundingBox;
  const centerX = (box.max.x + box.min.x) / 2;
  const centerY = (box.max.y + box.min.y) / 2;

  geometry.translate(-centerX, -centerY, 0);

  /* =================================================
     [U/X 개별 처리 로직] (여기서 해결!)
   ================================================= */
  let wireGeometry;

  if (character === "U") {
    // [U 해결책] 곡면의 기둥 선들이 모두 보이도록 임계각 기준을 20 -> 3도로 낮춥니다.
    // 이렇게 하면 곡면 측면 연결선(Depth Edges)이 생략되지 않고 촘촘하게 복원됩니다.
    wireGeometry = new THREE.EdgesGeometry(geometry, 3);
  } else {
    // [X 해결책] 직선 기반이라 뭉치지 않으므로, 깔끔한 외곽선(Edges)을 위해 20도를 유지합니다.
    wireGeometry = new THREE.EdgesGeometry(geometry, 20);
  }

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
