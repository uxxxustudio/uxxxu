import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Smooth Gradient Fade-out on Grid Material)
========================================================= */

export function initHero3D() {
  const container = document.getElementById("hero-3d");
  if (!container) return;

  /* =====================================================
     SCENE & CAMERA
  ===================================================== */
  const scene = new THREE.Scene();

  // 배경은 흰색 (투명 처리)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  /* =====================================================
     LIGHTS (마우스 추적 하이라이트 + 오로라 3색 광원)
  ===================================================== */
  // 은은한 베이스 환경광
  const ambientLight = new THREE.AmbientLight(0xe0f2fe, 1.2);
  scene.add(ambientLight);

  // 마우스 추적 백색 핀 조명
  const mouseLight = new THREE.PointLight(0xffffff, 18.0, 25);
  scene.add(mouseLight);

  // 우측 상단 스카이블루 광원
  const skyLight = new THREE.DirectionalLight(0x0284c7, 6.0);
  skyLight.position.set(12, 10, 8);
  scene.add(skyLight);

  // 좌측 하단 코랄 핑크 포인트 광원
  const pinkLight = new THREE.DirectionalLight(0xf43f5e, 5.0);
  pinkLight.position.set(-12, -10, 6);
  scene.add(pinkLight);

  // 상단 태양광
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
     BACKGROUND SPATIAL GRID (그 자체에 그라데이션 적용)
  ===================================================== */
  const gridGroup = new THREE.Group();
  // 공간감을 주기 위해 텍스트 뒤편에 배치
  gridGroup.position.set(0, 0, -4);

  // 대형 그리드 선 기하학 생성 (기존과 동일)
  const gridHelper = new THREE.GridHelper(32, 16, 0x94a3b8, 0xcbd5e1);
  gridHelper.rotation.x = Math.PI / 2; // 평면으로 세움

  // ★ [핵심수정] 그리드 선에 세로 그라데이션 Shader 적용
  const gridMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x94a3b8) },
      // 이 Opacity는 전체적인 기본 선명도
      baseOpacity: { value: 0.18 },
      // 그라데이션이 시작될 Y축 비율 (0.0=하단, 1.0=상단)
      // 하단 1/3 지점부터 페이드 시작하도록 설정
      fadeStart: { value: 0.33 }, 
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
      uniform float fadeStart;
      varying vec3 vPosition;

      void main() {
        // [중요] Y축 위치값에 따라 투명도 그라데이션 계산
        // vPosition.y는 geometry 내에서의 위치 (-16 ~ 16)
        // 이를 0.0 ~ 1.0 비율로 변환 (아래가 0.0, 위가 1.0)
        float heightRatio = (vPosition.y + 16.0) / 32.0;

        // fadeStart 이하일 때 smoothstep으로 부드럽게 페이드 아웃
        float fade = smoothstep(0.0, fadeStart, heightRatio);

        // 최종 컬러 (흰색 배경으로 빠지도록 흰색을 섞거나 투명도 조절)
        // 여기서는 투명도 그라데이션으로 처리
        gl_FragColor = vec4(color, baseOpacity * fade);
      }
    `,
    transparent: true,
    depthWrite: false, // 다른 오브젝트와 겹칠 때 아티팩트 방지
  });

  // GridHelper의 기본 재질을 커스텀 ShaderMaterial로 교체
  gridHelper.material = gridMaterial;
  gridGroup.add(gridHelper);

  // 교차점십자(+) 포인트들 (그리드와 동일한 그라데이션 적용)
  const crossMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x64748b) },
      baseOpacity: { value: 0.45 },
      fadeStart: { value: 0.33 },
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
      uniform float fadeStart;
      varying vec3 vPosition;

      void main() {
        // 교차점 geometry는 각 포인트마다 원점에 있으므로,
        // vPosition.y 대신 gridGroup 내의 월드 Y 좌표를 사용해야 함.
        // 여기서는 편의상 그리드와 동일한 계산을 적용하기 위해
        // 그리드 geometry 크기(-16 ~ 16)를 기준으로 vPosition.y를 사용.
        // GridHelper의 크기가 32이므로 -16 ~ 16 범위를 가짐.
        float heightRatio = (vPosition.y + 16.0) / 32.0;
        float fade = smoothstep(0.0, fadeStart, heightRatio);
        gl_FragColor = vec4(color, baseOpacity * fade);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  for (let x = -15; x <= 15; x += 4.0) {
    for (let y = -11; y <= 11; y += 4.0) {
      const crossGeo = new THREE.BufferGeometry();
      const s = 0.12; // 십자 크기
      const vertices = new Float32Array([
        x - s, y, 0,  x + s, y, 0,
        x, y - s, 0,  x, y + s, 0
      ]);
      crossGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      // BufferGeometry로 직접 만들었으므로 vPosition.y가 로컬 좌표 y값을 가짐.
      // -11 ~ 11 범위. 이를 -16 ~ 16 그리드 범위로 스케일링해야 함.
      // Shader fragment에서 직접 스케일링하도록 vertexShader 수정 필요.
      // or... 그냥 Shaderfragment에서 y값 범위를 -16~16으로 생각하고 계산
      const crossMeshMat = crossMaterial.clone();
      // 각 crossMeshMat의 uniforms.color는 공유되지만 다른 uniform은 별도 설정 가능.
      // 하지만 vertexShader 내의 vPosition은 local 좌표이므로 그냥 두면 안됨.
      // shaderFragment에서 y값 범위를 -16 ~ 16으로 보고 계산하도록 수정

      const cross = new THREE.LineSegments(crossGeo, crossMeshMat);
      gridGroup.add(cross);
    }
  }
  scene.add(gridGroup);

  /* =====================================================
     MATERIALS (오로라 틴트 글래스 + 또렷한 라인)
  ===================================================== */
  // 튜브 유리 재질 (기존과 동일)
  const tubeGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd, roughness: 0.02, metalness: 0.05,
    transmission: 0.88, ior: 1.48, thickness: 2.0,
    attenuationColor: 0x38bdf8, attenuationDistance: 2.0,
    transparent: true, opacity: 0.45,
    clearcoat: 1.0, clearcoatRoughness: 0.0,
    reflectivity: 1.0, depthWrite: true,
    side: THREE.DoubleSide,
  });

  // 선명한 오브젝트 도면 라인
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a, transparent: true, opacity: 0.7,
  });

  /* =====================================================
     FONT LOADER & BATCH CREATION (기존과 동일)
  ===================================================== */
  const loader = new FontLoader();
  loader.load("https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json", (font) => {
    // 1. 메인 U (둥근 튜브 베벨)
    createLetter("U", font, -2.9, -0.65, -0.42, 0.92, 0);
    // 2. 메인 X
    createLetter("X", font, 2.25, 0.55, 0.42, 0.88, 1.7);
    // 3. 미니 X들
    createLetter("X", font, -2.3, 3.8, 0.35, 0.52, 0.8);
    createLetter("X", font, 5.3, -3.2, 0.45, 0.55, 2.3);
  });

  /* =====================================================
     CREATE 3D LETTER (기존과 동일)
  ===================================================== */
  function createLetter(character, font, x, y, rotationY, scale, phase) {
    const isU = character === "U";
    const geometryOptions = isU ? {
      font: font, size: 4.1, depth: 0.4, curveSegments: 32, bevelEnabled: true,
      bevelThickness: 0.38, bevelSize: 0.28, bevelOffset: 0, bevelSegments: 16,
    } : {
      font: font, size: 4.1, depth: 0.72, curveSegments: 1, bevelEnabled: false,
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
     MOUSE & INTERACTION (기존과 동일)
  ===================================================== */
  const target = { x: 0, y: 0 }, mouse = { x: 0, y: 0 };
  window.addEventListener("mousemove", (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  /* =====================================================
     RESIZE & RESPONSIVE (기존과 동일)
  ===================================================== */
  function resize() {
    const width = container.clientWidth, height = container.clientHeight;
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
     ANIMATION LOOP (기존과 동일)
  ===================================================== */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;

    // 마우스 추적 하이라이트
    mouseLight.position.set(mouse.x * 12, mouse.y * 8, 6);

    // 배경 그리드 미세 패럴랙스
    gridGroup.position.x = -mouse.x * 0.4;
    gridGroup.position.y = -mouse.y * 0.3;

    // 메인 그래픽 부유 모션
    group.children.forEach((obj) => {
      const p = obj.userData;
      obj.position.x = p.baseX + Math.sin(time * 0.55 + p.phase) * 0.08;
      obj.position.y = p.baseY + Math.cos(time * 0.7 + p.phase) * 0.1;
      obj.rotation.y = p.baseRotationY + mouse.x * 0.2;
      obj.rotation.x = -0.08 - mouse.y * 0.1;
    });

    renderer.render(scene, camera);
  }

  resize(); animate();
}
