import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Minimal White/Grey Glass & Ultra-fine Grid)
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
     LIGHTS (무채색 메탈/글래스 하이라이트 세팅)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
  scene.add(ambientLight);

  // U 모서리 쨍한 백색 하이라이트용 핀 조명
  const uHighlightLight = new THREE.DirectionalLight(0xffffff, 10.0);
  uHighlightLight.position.set(-3, 8, 12);
  scene.add(uHighlightLight);

  // 마우스 추적 은은한 조명
  const mouseLight = new THREE.PointLight(0xffffff, 8.0, 25);
  scene.add(mouseLight);

  // 대치감을 위한 쿨그레이 & 은은한 소프트 라이트
  const keyLight = new THREE.DirectionalLight(0xe2e8f0, 4.0);
  keyLight.position.set(10, 10, 8);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x94a3b8, 3.0);
  fillLight.position.set(-10, -8, 6);
  scene.add(fillLight);

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
     CONCAVE CURVED GRID GENERATOR
  ===================================================== */
  function createConcaveGridGeometry(width, height, stepX, stepY, curveAmount = 0.01) {
    const points = [];
    const resolution = 30;

    for (let x = -width / 2; x <= width / 2; x += stepX) {
      for (let i = 0; i < resolution; i++) {
        const t1 = i / resolution, t2 = (i + 1) / resolution;
        const y1 = -height / 2 + t1 * height, y2 = -height / 2 + t2 * height;
        const z1 = (x * x * 0.8 + y1 * y1) * curveAmount - 3.0;
        const z2 = (x * x * 0.8 + y2 * y2) * curveAmount - 3.0;
        points.push(x, y1, z1, x, y2, z2);
      }
    }

    for (let y = -height / 2; y <= height / 2; y += stepY) {
      for (let i = 0; i < resolution; i++) {
        const t1 = i / resolution, t2 = (i + 1) / resolution;
        const x1 = -width / 2 + t1 * width, x2 = -width / 2 + t2 * width;
        const z1 = (x1 * x1 * 0.8 + y * y) * curveAmount - 3.0;
        const z2 = (x2 * x2 * 0.8 + y * y) * curveAmount - 3.0;
        points.push(x1, y, z1, x2, y, z2);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }

  /* =====================================================
     BACKGROUND SPATIAL GRID (★ 4번: 라인 가늘고 미세하게)
  ===================================================== */
  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, 0, -3);

  const gridWidth = 36, gridHeight = 22, stepX = 2.4, stepY = 2.4, curveFactor = 0.01;
  const curvedGridGeo = createConcaveGridGeometry(gridWidth, gridHeight, stepX, stepY, curveFactor);

  // 그리드 라인 선명도 낮추어 얇고 섬세한 느낌 연출
  const gridMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xcbd5e1) }, // 연한 수채화 쿨그레이
      baseOpacity: { value: 0.14 },               // ★ 더 얇고 섬세하게 변경
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
        float fade = smoothstep(-11.0, -2.0, vPosition.y);
        gl_FragColor = vec4(color, baseOpacity * fade);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  gridGroup.add(new THREE.LineSegments(curvedGridGeo, gridMaterial));

  // ★ [3번 수정] 교차점 노드 스퀘어 크기 대폭 축소 (0.1 -> 0.035)
  const nodeGeo = new THREE.BoxGeometry(0.035, 0.035, 0.035);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.35 });

  for (let x = -gridWidth / 2; x <= gridWidth / 2; x += stepX * 2) {
    for (let y = -gridHeight / 2; y <= gridHeight / 2; y += stepY * 2) {
      if (y > -8) {
        const z = (x * x * 0.8 + y * y) * curveFactor - 3.0;
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(x, y, z);
        gridGroup.add(node);
      }
    }
  }
  scene.add(gridGroup);

  /* =====================================================
     U MATERIAL (★ 2번: 화이트 - 옅은 그레이 미니멀 그라데이션)
  ===================================================== */
  const tubeGlassMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,            // 그라데이션 컬러 반영
    roughness: 0.08,               // 뽀송뽀송하고 고급스러운 무광 유광 조합
    metalness: 0.1,
    transmission: 0.85,            // 투과성 유지
    ior: 1.42,                     // 정갈한 세라믹/글래스 굴절
    thickness: 1.5,
    attenuationColor: new THREE.Color(0xf8fafc),
    attenuationDistance: 2.0,
    clearcoat: 1.0,                // 표면 윤기 코팅
    clearcoatRoughness: 0.02,
    specularIntensity: 2.8,        // 백색 하이라이트
    specularColor: new THREE.Color(0xffffff),
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // X 글자용 얇은 라인재질
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a,
    transparent: true,
    opacity: 0.65,
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
          depth: 0.45,
          curveSegments: 32,
          bevelEnabled: true,
          bevelThickness: 0.42,
          bevelSize: 0.3,
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

    // ★ [2번 수정] U 글자 화이트 & 옅은 쿨그레이 트렌디 그라데이션
    if (isU) {
      const posAttr = geometry.attributes.position;
      const count = posAttr.count;
      const colors = new Float32Array(count * 3);

      const minY = box.min.y;
      const maxY = box.max.y;
      const height = maxY - minY;

      // 하단: 소프트한 쿨그레이 / 상단: 깨끗한 오프화이트
      const bottomColor = new THREE.Color(0x94a3b8); // 쿨 슬레이트 그레이
      const topColor = new THREE.Color(0xffffff);    // 퓨어 화이트

      for (let i = 0; i < count; i++) {
        const posY = posAttr.getY(i);
        const ratio = Math.min(Math.max((posY - minY) / height, 0), 1);

        const mixedColor = bottomColor.clone().lerp(topColor, ratio);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }

      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }

    const letterGroup = new THREE.Group();

    if (isU) {
      // U는 양감 있는 메시만 추가 (외곽선 삭제로 윗부분 검은 선 완전 제거)
      letterGroup.add(new THREE.Mesh(geometry, tubeGlassMaterial));
    } else {
      // ★ [1번 수정] X 글자에만 와이어프레임 라인 유지
      letterGroup.add(
        new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), lineMaterial)
      );
    }

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

    mouseLight.position.set(mouse.x * 12, mouse.y * 8, 6);

    gridGroup.position.x = -mouse.x * 0.3;
    gridGroup.position.y = -mouse.y * 0.2;

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
