import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Original Ocean-Blue Glass & Pure Light Edge)
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
     LIGHTS (테두리 음영을 밝혀주는 백색 림 조명)
  ===================================================== */
  const ambientLight = new THREE.AmbientLight(0xf0f9ff, 2.0);
  scene.add(ambientLight);

  // U 모서리 백색 하이라이트 전용 핀 조명
  const uHighlightLight = new THREE.DirectionalLight(0xffffff, 14.0);
  uHighlightLight.position.set(-2, 6, 10);
  scene.add(uHighlightLight);

  // 마우스 추적 조명
  const mouseLight = new THREE.PointLight(0xffffff, 8.0, 25);
  scene.add(mouseLight);

  // 오로라 컬러 림 조명
  const skyLight = new THREE.DirectionalLight(0x0284c7, 5.0);
  skyLight.position.set(12, 10, 8);
  scene.add(skyLight);

  const pinkLight = new THREE.DirectionalLight(0xf43f5e, 3.5);
  pinkLight.position.set(-12, -10, 6);
  scene.add(pinkLight);

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
     BACKGROUND SPATIAL GRID
  ===================================================== */
  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, 0, -3);

  const gridWidth = 36, gridHeight = 22, stepX = 2.4, stepY = 2.4, curveFactor = 0.01;
  const curvedGridGeo = createConcaveGridGeometry(gridWidth, gridHeight, stepX, stepY, curveFactor);

  const gridMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xcbd5e1) },
      baseOpacity: { value: 0.14 },
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

  // 미세한 노드
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
     U MATERIAL (이전의 투명 블루 틴트 컬러 + 맑은 백색 림 적용)
  ===================================================== */
  const tubeGlassMaterial = new THREE.MeshPhysicalMaterial({
    vertexColors: true,            // 이전 블루 그라데이션 복구
    roughness: 0.05,               // 매끈한 오션 젤리/글래스 질감
    metalness: 0.0,
    transmission: 0.90,            // 뒤쪽 글자 비치는 투과율
    ior: 1.12,                     // 굴절률을 낮춰 엣지의 칙칙한 그레이 음영 왜곡 방지
    thickness: 0.3,                // 두께 음영 최소화
    attenuationColor: new THREE.Color(0x2563eb), // 깊이감 있는 블루 틴트
    attenuationDistance: 2.0,
    
    // 어두운 모서리 음영 방지용 미세 화이트 발광
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 0.15,

    clearcoat: 1.0,
    clearcoatRoughness: 0.0,

    // 테두리에 #FFFFFF 빛만 밝게 형성되도록 스페큘러 극대화
    specularIntensity: 5.0,
    specularColor: new THREE.Color(0xffffff),

    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  // X 글자용 와이어프레임 라인 재질
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

    // ★ 이전 마음에 들어 하셨던 블루-스카이블루 VERTEX COLOR 복구
    if (isU) {
      const posAttr = geometry.attributes.position;
      const count = posAttr.count;
      const colors = new Float32Array(count * 3);

      const minY = box.min.y;
      const maxY = box.max.y;
      const height = maxY - minY;

      const bottomColor = new THREE.Color(0x38bdf8); // 하단: 투명 스카이 블루
      const topColor = new THREE.Color(0x1d4ed8);    // 상단: 딥 딥블루

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
      // U 글자는 추가 엣지 라인 없이 순수 반투명 메시만 배치 (어두운 외곽선 지우기)
      letterGroup.add(new THREE.Mesh(geometry, tubeGlassMaterial));
    } else {
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
