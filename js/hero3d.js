import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (화면 전체 자유 배치 버전)
========================================================= */

export function initHero3D() {
  const container = document.getElementById("hero-3d");
  if (!container) return;

  /* =====================================================
     SCENE & CAMERA
     (넓은 배치를 위해 FOV를 더 넓히고 카메라를 뒤로 뺐습니다)
  ===================================================== */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    48, // 화면 전체를 커버하기 위해 화각을 더 넓힙니다 (기존 34)
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 25); // 배치를 위해 카메라를 뒤로 더 이동 (기존 15)

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
     FONT LOADER & 다중 배치
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      // -------------------------------------------------
      // [U X X X U] 화면 전체 자유 배치 튜닝
      // createLetter(글자, 폰트, x, y, rotY, rotX, scale, phase)
      // -------------------------------------------------

      // 1. 좌측 상단 U (화면 모서리로 크게 배치)
      createLetter("U", font, -8.0, 4.5, -0.42, 0.05, 1.1, 0);

      // 2. 우측 상단 X (폰트 크기를 다양하게)
      createLetter("X", font, 7.5, 4.8, 0.2, -0.1, 0.9, 0.8);

      // 3. 중앙 중상단 X (작고 뒤쪽에 배치하여 원근감 연출)
      createLetter("X", font, 0.0, 2.5, 0.15, 0.2, 0.65, 1.7);

      // 4. 좌측 하단 X (조금 더 앞쪽에 배치)
      createLetter("X", font, -7.8, -4.5, -0.2, 0.0, 0.95, 2.5);

      // 5. 우측 하단 U (화면 전체를 균형 있게 채움)
      createLetter("U", font, 8.2, -4.2, 0.42, -0.08, 1.05, 3.2);
    },
    undefined,
    (error) => {
      console.error("Hero font load failed:", error);
    }
  );

  /* =====================================================
     CREATE 3D LINE LETTER (EDGES GEOMETRY)
  ===================================================== */
  function createLetter(
    character,
    font,
    x,
    y,
    rotationY,
    rotationX,
    scale,
    phase
  ) {
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

    /* OUTLINE EDGES ONLY */
    const wireGeometry = new THREE.EdgesGeometry(geometry, 20);
    const wire = new THREE.LineSegments(wireGeometry, material);

    wire.position.set(x, y, 0);
    wire.scale.setScalar(scale);
    wire.rotation.y = rotationY;
    wire.rotation.x = rotationX; // 기본 기울기 적용

    wire.userData = {
      baseX: x,
      baseY: y,
      baseRotationY: rotationY,
      baseRotationX: rotationX, // 애니메이션 기준값으로 저장
      phase: phase,
    };

    group.add(wire);
  }

  /* =====================================================
     MOUSE & INTERACTION (모션 느낌 유지)
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
     ANIMATION LOOP (모션 느낌 유지)
  ===================================================== */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // 마우스 팔로잉 (Lerp)
    mouse.x += (target.x - mouse.x) * 0.035;
    mouse.y += (target.y - mouse.y) * 0.035;

    group.children.forEach((object) => {
      const phase = object.userData.phase;

      // 1. 부유 모션 (둥실거림) - 그대로 유지
      object.position.x =
        object.userData.baseX + Math.sin(time * 0.55 + phase) * 0.1;
      object.position.y =
        object.userData.baseY + Math.cos(time * 0.7 + phase) * 0.12;

      // 2. 마우스 반응 회전 - 그대로 유지 (baseRotationX 기반으로 수정)
      object.rotation.y = object.userData.baseRotationY + mouse.x * 0.18;
      object.rotation.x = object.userData.baseRotationX + mouse.y * 0.06;
    });

    renderer.render(scene, camera);
  }

  resize();
  animate();
}
