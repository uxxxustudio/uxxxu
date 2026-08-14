import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Kakao ESG Style - Curved Dome Spatial Grid)
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

  // 마우스 추적 백색 핀 조명 (#fff 스펙큘러)
  const mouseLight = new THREE.PointLight(0xffffff, 18.0, 25);
  scene.add(mouseLight);

  // 멀티 컬러 오로라 광원들
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
     CURVED DOME GRID (공간을 감싸는 레퍼런스 스타일 곡면 그리드)
  ===================================================== */
  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, 0, -8); // 깊숙한 배경 공간에 배치

  // 볼록한 돔(Dome) 형태의 지오메트리 생성
  const domeRadius = 22;
  const domeGeo = new THREE.SphereGeometry(
    domeRadius,
    32, // 세로 격자 수
    20, // 가로 격자 수
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.48 // 화면을 감싸는 호 형태
  );

  // 와이어프레임 라인으로 추출
  const wireGeo = new THREE.WireframeGeometry(domeGeo);

  // 1. 휘어지는 그리드 라인 재질 (하단 부드러운 페이드 처리)
  const curvedGridMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x64748b) },
      baseOpacity: { value: 0.28 },
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
        // Y축 아래쪽으로 갈수록 자연스럽게 녹아들며 연해지는 그라데이션
        float fade = smoothstep(-10.0, 5.0, vPosition.y);
        gl_FragColor = vec4(color, baseOpacity * fade);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  const curvedGrid = new THREE.LineSegments(wireGeo, curvedGridMaterial);
  // 카메라를 향해 돔의 안쪽 곡면이 보이도록 회전 및 위치 조정
  curvedGrid.rotation.x = Math.PI * 0.55;
  gridGroup.add(curvedGrid);

  // 2. 레퍼런스 특유의 포인트 포인트(Node Dots) 추가
  const nodeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  // 돔 곡면의 일정 간격 노드에 사각형 점 배치
  const posAttribute = domeGeo.attributes.position;
  for (let i = 0; i < posAttribute.count; i += 18) {
    const x = posAttribute.getX(i);
    const y = posAttribute.getY(i);
    const z = posAttribute.getZ(i);

    // 하단 너무 깊은 곳은 생략
    if (y > -8) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, y, z);
      node.rotation.x = Math.PI * 0.55;
      gridGroup.add(node);
    }
  }

  scene.add(gridGroup);

  /* =====================================================
     MATERIALS (오로라 틴트 글래스 + 또렷한 오브젝트 테두리)
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

    // 마우스 하이라이트 핀 조명
    mouseLight.position.set(mouse.x * 12, mouse.y * 8, 6);

    // ★ 곡면 3D 돔 그리드의 다이내믹 시점 반응 (마우스 반응에 따라 공간이 회전)
    gridGroup.rotation.y = mouse.x * 0.08;
    gridGroup.rotation.x = -mouse.y * 0.05;

    // 메인 그래픽 개체 부유 모션
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
