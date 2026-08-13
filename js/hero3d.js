import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (오류 수정 및 통 입체 최적화)
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
     CREATE 3D LINE LETTER
  ===================================================== */
  function createLetter(character, font, x, y, rotationY, scale, phase) {
    const textOptions = {
      font: font,
      size: 4.1,
      depth: 0.72,
      curveSegments: 6, // 부드러우면서도 선이 뭉치지 않는 적절한 분할
    };

    if (character === "U") {
      // U는 베벨을 꺼서 지저분하게 겹치는 이중 선을 방지합니다.
      textOptions.bevelEnabled = false;
    } else {
      // X는 입체감을 위해 베벨을 유지합니다.
      textOptions.bevelEnabled = true;
      textOptions.bevelThickness = 0.09;
      textOptions.bevelSize = 0.055;
      textOptions.bevelSegments = 2;
    }

    const geometry = new TextGeometry(character, textOptions);

    geometry.computeBoundingBox();

    /* Center Geometry */
    const box = geometry.boundingBox;
    const centerX = (box.max.x + box.min.x) / 2;
    const centerY = (box.max.y + box.min.y) / 2;

    geometry.translate(-centerX, -centerY, 0);

    /* =================================================
       OUTLINE EDGES ONLY (임계각 조정으로 통 입체 유지)
    ================================================= */
    // thresholdAngle: 15도 이상 꺾이는 외곽 및 통 입체 연결 테두리선만 남깁니다.
    const wireGeometry = new THREE.EdgesGeometry(geometry, 15);

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
