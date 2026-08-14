import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Clean Curved Barrel Grid - No Distortion)
========================================================= */

export function initHero3D() {
  const container = document.getElementById("hero-3d");
  if (!container) return;

  /* =====================================================
     SCENE & CAMERA
  ===================================================== */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  /* =====================================================
     LIGHTS
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xe0f2fe, 1.2);
  scene.add(ambientLight);

  // 마우스 추적 백색 핀 조명
  const mouseLight = new THREE.PointLight(0xffffff, 18.0, 25);
  scene.add(mouseLight);

  // 멀티 컬러 오로라 광원
  const skyLight = new THREE.DirectionalLight(0x0284c7, 6.0);
  skyLight.position.set(12, 10, 8);
  scene.add(skyLight);

  const pinkLight = new THREE.DirectionalLight(0xf43f5e, 5.0);
  pinkLight.position.set(-12, -10, 6);
  scene.add(pinkLight);

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
     CLEAN CURVED GRID GENERATOR (직교 곡면 그리드)
  ===================================================== */
  function createCurvedGridGeometry(width, height, stepX, stepY, curveAmount = 0.008) {
    const points = [];
    const resolution = 30; // 곡선의 부드러움 정도

    // 1. 수직 곡선들 생성
    for (let x = -width / 2; x <= width / 2; x += stepX) {
      for (let i = 0; i < resolution; i++) {
        const t1 = i / resolution;
        const t2 = (i + 1) / resolution;

        const y1 = -height / 2 + t1 * height;
        const y2 = -height / 2 + t2 * height;

        // 중앙이 앞으로 튀어나오고 외곽이 뒤로 휘어지는 볼록 곡률 계산
        const z1 = -(x * x * 0.8 + y1 * y1) * curveAmount;
        const z2 = -(x * x * 0.8 + y2 * y2) * curveAmount;

        points.push(x, y1, z1, x, y2, z2);
      }
    }

    // 2. 수평 곡선들 생성
    for (let y = -height / 2; y <= height / 2; y += stepY) {
      for (let i = 0; i < resolution; i++) {
        const t1 = i / resolution;
        const t2 = (i + 1) / resolution;

        const x1 = -width / 2 + t1 * width;
        const x2 = -width / 2 + t2 * width;

        const z1 = -(x1 * x1 * 0.8 + y * y) * curveAmount;
        const z2 = -(x2 * x2 * 0.8 + y * y) * curveAmount;

        points.push(x1, y, z1, x2, y, z2);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }

  /* =====================================================
     BACKGROUND SPATIAL GRID
  ===================================================== */
  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, 0, -4); 

  const gridWidth = 36;
  const gridHeight = 22;
  const stepX = 2.4;
  const stepY = 2.4;
  const curveFactor = 0.009; // 곡률 강도 (숫자가 클수록 더 볼록해짐)

  const curvedGridGeo = createCurvedGridGeometry(gridWidth, gridHeight, stepX, stepY, curveFactor);

  // 하단 페이드아웃 Shader
  const gridMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x94a3b8) },
      baseOpacity: { value: 0.25 },
    },
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float baseOpacity;
      varying vec3 vPosition;

      void main() {
        // Y축 하단(-4 이하)으로 갈수록 부드럽게 연해짐
        float fade = smoothstep(-11.0, -3.0, vPosition.y);
        gl_FragColor = vec4(color, baseOpacity * fade);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  const gridMesh = new THREE.LineSegments(curvedGridGeo, gridMaterial);
  gridGroup.add(gridMesh);

  // 교차점 노드 점들 (Node Dots)
  const nodeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.6 });

  for (let x = -gridWidth / 2; x <= gridWidth / 2; x += stepX * 2) {
    for (let y = -gridHeight / 2; y <= gridHeight / 2; y += stepY * 2) {
      if (y > -8) { // 최하단 노드는 생략
        const z = -(x * x * 0.8 + y * y) * curveFactor;
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(x, y, z);
        gridGroup.add(node);
      }
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

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.72,
  });

  /* =====================================================
     FONT LOADER & BATCH CREATION
  ===================================================== */
  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      createLetter("U", font, -2.9, -0.65, -0.42, 0.92, 0);
      createLetter("X", font, 2.25, 0.55, 0.42, 0.88, 1.7);
      createLetter("X", font, -2.3, 3.8, 0.35, 0.52, 0.8);
      createLetter("X", font, 5.3, -3.2, 0.45, 0.55, 2.3);
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
    geometry.translate(-(box.max.x + box.min.x) / 2, -(box.max.y + box.min.y) / 2, 0);

    const letterGroup = new THREE.Group();
    if (isU) letterGroup.add(new THREE.Mesh(geometry, tubeGlassMaterial));
    letterGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), lineMaterial));

    letterGroup.position.set(x, y, 0);
    letterGroup.scale.setScalar(scale);
    letterGroup.rotation.y = rotationY;
    letterGroup.rotation.x = -0.08;
    letterGroup.userData = { baseX: x, baseY: y, baseRotationY: rotationY, phase: phase };
    group.add(letterGroup);
  }

  /* =====================================================
     MOUSE & INTERACTION
  ===================================================== */
  const target = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0 };

  window.addEventListener(
    "mousemove",
    (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = -(e.clientY / window.innerHeight) * 2 + 1;
    },
    { passive: true }
  );

  /* =====================================================
     RESIZE & RESPONSIVE SCALE
  ===================================================== */
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    const isMobile = window.innerWidth < 768;
    camera.aspect = width / height;
    camera.position.z = isMobile ? 18.5 : 15;
    camera.updateProjectionMatrix();

    group.scale.setScalar(isMobile ? 0.68 : 1.0);
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

    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;

    // 마우스 추적 조명
    mouseLight.position.set(mouse.x * 12, mouse.y * 8, 6);

    // 미세 패럴랙스
    gridGroup.position.x = -mouse.x * 0.3;
    gridGroup.position.y = -mouse.y * 0.2;

    // 메인 글자 그래픽 부유
    group.children.forEach((obj) => {
      const p = obj.userData;
      obj.position.x = p.baseX + Math.sin(time * 0.55 + p.phase) * 0.08;
      obj.position.y = p.baseY + Math.cos(time * 0.7 + p.phase) * 0.1;
      obj.rotation.y = p.baseRotationY + mouse.x * 0.2;
      obj.rotation.x = -0.08 - mouse.y * 0.1;
    });

    renderer.render(scene, camera);
  }

  resize();
  animate();
}
