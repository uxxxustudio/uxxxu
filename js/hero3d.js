import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

/* =========================================================
   HERO THREE.JS (Scroll-reactive U & X Parallax Effect)
========================================================= */

export function initHero3D() {
  const container = document.getElementById("hero-3d");
  if (!container) return;

  container.innerHTML = "";

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  /* =====================================================
      1. 배경 공간 그리드 (하단 페이드아웃 범위 확장)
  ==================================================== */
  function createSolidGridGeometry(width, height, stepX, stepY, curveAmount = 0.01) {
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

  const gridGroup = new THREE.Group();
  gridGroup.position.set(0, 0, -3);

  const gridWidth = 36, gridHeight = 22;
  const stepX = 1.2, stepY = 1.2, curveFactor = 0.01;
  const solidGridGeo = createSolidGridGeometry(gridWidth, gridHeight, stepX, stepY, curveFactor);

  // 페이드아웃 구간을 넓히고(0.1 ~ 0.85) 아래쪽 라인이 더 은은하게 보이도록 조정
  const gridMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vPosition;
      void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPosition;
      void main() {
        float normalizeY = (vPosition.y + 11.0) / 22.0;
        float alpha = smoothstep(0.1, 0.85, normalizeY) * 0.85;

        vec3 gridColor = vec3(0.6, 0.6, 0.6);
        gl_FragColor = vec4(gridColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  const gridLines = new THREE.LineSegments(solidGridGeo, gridMaterial);
  gridGroup.add(gridLines);
  scene.add(gridGroup);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x111111,
    transparent: false,
    opacity: 1.0,
  });

  const loader = new FontLoader();

  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      createLetterMesh("U", font, -2.9, -0.65, -0.42, 0.92, 0.0, true, 0.002);
      createLetterMesh("X", font, 2.25, 0.55, 0.42, 0.88, 1.8, false, 0.003);
      createLetterMesh("X", font, -2.3, 3.8, 0.35, 0.52, 3.6, false, 0.001);
      createLetterMesh("X", font, 5.3, -3.2, 0.45, 0.55, 5.4, false, 0.004);
      createLetterMesh("U", font, 6.2, 1.8, -0.75, 0.48, 7.2, true, 0.0035);
    }
  );

  function createLetterMesh(character, font, x, y, rotationY, scale, timeOffset, isU, scrollSpeed) {
    const geomOpts = { font: font, size: 4.1, depth: 0.38, curveSegments: isU ? 24 : 6, bevelEnabled: false };

    const geometry = new TextGeometry(character, geomOpts);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    geometry.translate(-(box.max.x + box.min.x) / 2, -(box.max.y + box.min.y) / 2, 0);

    const letterGroup = new THREE.Group();
    letterGroup.position.x = -1.5;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOffset: { value: timeOffset },
        uIsU: { value: isU ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOffset;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // 1. 모서리(Edge) 흐름 및 네온 컬러 계산 (더 짙고 강하게 수정)
          float flow = mod((vPosition.y * 0.1) + (uTime * 0.25) + uOffset, 1.0);
          float beam = smoothstep(0.18, 0.0, abs(flow - 0.5)); // 엣지 라인을 더 얇고 선명하게

          vec3 darkGray = vec3(0.2, 0.2, 0.2); // [수정] 엣지 컬러를 더 짙은 그레이로 (U자형과 비슷하게)
          vec3 neonGreen = vec3(0.12, 0.95, 0.45); // 포인트 그린
          vec3 edgeColor = mix(darkGray, neonGreen, beam * 1.2); // [수정] 네온 효과를 더 강하게
          
          // 2. 면(Fill) 컬러: 면과 엣지의 차이를 명확히 하기 위해 더 연하게 수정
          // 카메라를 향할수록 불투명해지는 반투명 흰색이지만, 베이스 값을 더 낮춤.
          float fillAlpha = pow(abs(vNormal.z), 0.3) * 0.20; // [수정] 면의 밀도를 낮춰 더 투명하게 만듦
          vec3 fillColor = vec3(0.96, 0.96, 0.96); // [수정] 면 컬러를 거의 흰색에 가깝게 설정

          // 3. 면과 엣지의 시각적 결합
          vec3 finalColor = mix(fillColor, edgeColor, beam * 1.5); // [수정] 엣지 라인이 면 위에 더 강하게 올라오도록 믹싱
          float finalAlpha = max(fillAlpha, beam * 0.95); // 엣지 부분은 확실하게 불투명 처리

          // 4. 상단 영역 페이드아웃 (유지)
          float normalizeY = (vPosition.y + 11.0) / 22.0;
          float fadeOut = smoothstep(0.05, 0.9, normalizeY);
          
          gl_FragColor = vec4(finalColor, finalAlpha * fadeOut);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const fillMesh = new THREE.Mesh(geometry, material);
    letterGroup.add(fillMesh);

    const edges = new THREE.EdgesGeometry(geometry, isU ? 25 : 15);
    const lineSegments = new THREE.LineSegments(edges, lineMat);
    letterGroup.add(lineSegments);

    letterGroup.position.set(x, y, 0);
    letterGroup.scale.setScalar(scale);
    letterGroup.rotation.y = rotationY;
    letterGroup.rotation.x = -0.08;
    
    letterGroup.userData = { 
      baseX: x, 
      baseY: y, 
      baseRotationY: rotationY, 
      material: material,
      scrollSpeed: scrollSpeed 
    };
    
    group.add(letterGroup);
  }

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

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = window.innerWidth < 768;
    camera.aspect = width / height;
    camera.position.z = isMobile ? 18.5 : 15;
    camera.updateProjectionMatrix();

    group.scale.setScalar(isMobile ? 0.68 : 1.0);
    renderer.setSize(width, height);
  }

  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    const scrollY = window.scrollY || window.pageYOffset;

    mouse.x += (target.x - mouse.x) * 0.08;
    mouse.y += (target.y - mouse.y) * 0.08;

    gridGroup.position.x = -mouse.x * 0.2;
    gridGroup.position.y = -mouse.y * 0.15 + (scrollY * 0.001);

    group.children.forEach((obj, index) => {
      const p = obj.userData;
      const scrollOffset = scrollY * p.scrollSpeed;

      obj.position.x = p.baseX + Math.sin(time * 0.4 + index) * 0.06;
      obj.position.y = (p.baseY - scrollOffset) + Math.cos(time * 0.5 + index) * 0.08;
      
      obj.rotation.y = p.baseRotationY + mouse.x * 0.2;
      obj.rotation.x = -0.08 - mouse.y * 0.1;

      if (p.material) {
        p.material.uniforms.uTime.value = time;
      }
    });

    renderer.render(scene, camera);
  }

  resize();
  animate();
}


/* =========================================================
   EXPERIENCE SECTION OBJECT (initSectionObject)
========================================================= */

export function initSectionObject(containerId, assetInput = "U") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const width = container.clientWidth || 300;
  const height = container.clientHeight || 300;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x111111,
    transparent: false,
    opacity: 1.0,
  });

  const loader = new FontLoader();
  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      const geomOpts = { font: font, size: 7.2, depth: 1.2, curveSegments: 24, bevelEnabled: false };
      const geometry = new TextGeometry(assetInput, geomOpts);
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      geometry.translate(-(box.max.x + box.min.x) / 2, -(box.max.y + box.min.y) / 2, 0);

      const characterGroup = new THREE.Group();

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOffset: { value: 1.0 },
          uIsU: { value: 1.0 },
        },
        vertexShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uOffset;
          uniform float uIsU;
          varying vec3 vPosition;
          varying vec3 vNormal;

          void main() {
            if (abs(vNormal.z) > 0.1) { discard; }
            float sideDir = (vPosition.x < 0.0) ? 1.0 : -1.0;
            float flow = mod((vPosition.y * 0.2) + (uTime * 0.3 * sideDir) + (uOffset * 0.2), 1.0);
            float beam = smoothstep(0.12, 0.0, abs(flow - 0.5));

            vec3 baseColor = vec3(0.04, 0.04, 0.04);
            vec3 neonGreen = vec3(0.12, 0.95, 0.45);
            vec3 finalColor = mix(baseColor, neonGreen, beam);
            float alpha = 0.08 + beam * 0.92;
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const fillMesh = new THREE.Mesh(geometry, material);
      characterGroup.add(fillMesh);

      const edges = new THREE.EdgesGeometry(geometry, 25);
      const lineSegments = new THREE.LineSegments(edges, lineMat);
      characterGroup.add(lineSegments);

      const wrapperGroup = new THREE.Group();
      wrapperGroup.add(characterGroup);
      scene.add(wrapperGroup);

      const clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        const scrollY = window.scrollY || window.pageYOffset;

        const basePosY = -1.0; 
        const scrollOffset = scrollY * 0.0015;

        wrapperGroup.position.x = 0;
        wrapperGroup.position.y = basePosY + scrollOffset + Math.sin(time * 0.4) * 0.12;
        wrapperGroup.rotation.y += 0.005;

        wrapperGroup.traverse((child) => {
          if (child.material && child.material.uniforms && child.material.uniforms.uTime) {
            child.material.uniforms.uTime.value = time;
          }
        });

        renderer.render(scene, camera);
      }
      animate();
    }
  );
}


/* =========================================================
   PORTFOLIO SECTION 3D OBJECT (initPortfolio3D)
========================================================= */
export function initPortfolio3D(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
  camera.position.set(0, 0, 22);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x111111,
    transparent: false,
    opacity: 1.0,
  });

  const loader = new FontLoader();
  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",
    (font) => {
      const geomOpts = { font: font, size: 7.2, depth: 1.2, curveSegments: 24, bevelEnabled: false };
      const geometry = new TextGeometry("W", geomOpts);
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      geometry.translate(-(box.max.x + box.min.x) / 2, -(box.max.y + box.min.y) / 2, 0);

      const characterGroup = new THREE.Group();

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOffset: { value: 1.5 },
          uIsU: { value: 1.0 },
        },
        vertexShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uOffset;
          uniform float uIsU;
          varying vec3 vPosition;
          varying vec3 vNormal;

          void main() {
            if (abs(vNormal.z) > 0.1) { discard; }
            float sideDir = (vPosition.x < 0.0) ? 1.0 : -1.0;
            float flow = mod((vPosition.y * 0.2) + (uTime * 0.3 * sideDir) + (uOffset * 0.2), 1.0);
            float beam = smoothstep(0.12, 0.0, abs(flow - 0.5));

            vec3 baseColor = vec3(0.04, 0.04, 0.04);
            vec3 neonGreen = vec3(0.12, 0.95, 0.45);
            vec3 finalColor = mix(baseColor, neonGreen, beam);
            float alpha = 0.08 + beam * 0.92;
            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const fillMesh = new THREE.Mesh(geometry, material);
      characterGroup.add(fillMesh);

      const edges = new THREE.EdgesGeometry(geometry, 25);
      const lineSegments = new THREE.LineSegments(edges, lineMat);
      characterGroup.add(lineSegments);

      const wrapperGroup = new THREE.Group();
      wrapperGroup.add(characterGroup);
      wrapperGroup.rotation.y = 0.35; 
      wrapperGroup.rotation.x = -0.08; 

      scene.add(wrapperGroup);

      let mouseX = 0;
      let mouseY = 0;
      window.addEventListener("mousemove", (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      });

      const clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollOffset = scrollY * 0.0010;

        const baseRotationY = 0.35; 
        const baseRotationX = -0.08;

        const targetRotationY = baseRotationY + (mouseX * 0.3); 
        const targetRotationX = baseRotationX + (mouseY * 0.3);

        wrapperGroup.rotation.y += (targetRotationY - wrapperGroup.rotation.y) * 0.05;
        wrapperGroup.rotation.x += (targetRotationX - wrapperGroup.rotation.x) * 0.05;

        wrapperGroup.position.y = scrollOffset + Math.sin(time * 1.2) * 0.15;

        wrapperGroup.traverse((child) => {
          if (child.material && child.material.uniforms && child.material.uniforms.uTime) {
            child.material.uniforms.uTime.value = time;
          }
        });

        renderer.render(scene, camera);
      }
      animate();
    }
  );
}



/* =========================================================
   SERVICE SECTION 3D FULL-PAGE BACKGROUND LINES (모바일 가로 full 영역 수정)
========================================================= */
export function initServiceLines3D(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 800;
  const isMobile = window.innerWidth < 768;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, isMobile ? 42 : 35); 

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x555555,
    transparent: true,
    opacity: 0.35,
  });

  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  // 첫 번째 선만 오른쪽 아래로 이동 (모바일에서도 가로 full 영역에 맞춰 X 좌표 조정)
  const lineConfigs = isMobile ? [
    { pos: [ 6.5, -1.0, -2.0], rot: [0.2, 0.4, -0.3], scale: [0.5, 16.0, 0.5], speed: 0.5, offset: 0.0 },
    { pos: [ 4.5,  1.0, -1.0], rot: [-1.3, 0.6, 0.8], scale: [0.4,  7.0, 0.4], speed: 0.7, offset: 1.5 },
    { pos: [-3.0, -3.0,  1.0], rot: [0.1, -0.9, 0.6], scale: [0.6,  9.0, 0.6], speed: 0.6, offset: 2.8 },
    { pos: [ 3.5, -6.0, -1.0], rot: [1.4, -0.3, 0.4], scale: [0.5,  6.0, 0.5], speed: 0.8, offset: 4.2 },
    { pos: [ 0.0,  8.0, -4.0], rot: [-0.6, 0.3, -1.1], scale: [0.5, 12.0, 0.5], speed: 0.5, offset: 3.1 }
  ] : [
    { pos: [ 8.5, -2.0, -3.0], rot: [0.2, 0.4, -0.3], scale: [0.5, 22.0, 0.5], speed: 0.5, offset: 0.0 },
    { pos: [ 8.0,  2.0, -1.0], rot: [-1.3, 0.6, 0.8], scale: [0.4,  8.5, 0.4], speed: 0.7, offset: 1.5 },
    { pos: [-6.0, -3.0,  2.0], rot: [0.1, -0.9, 0.6], scale: [0.6, 11.0, 0.6], speed: 0.6, offset: 2.8 },
    { pos: [10.0, -4.0, -2.0], rot: [1.4, -0.3, 0.4], scale: [0.5,  7.0, 0.5], speed: 0.8, offset: 4.2 },
    { pos: [-1.0,  8.0, -6.0], rot: [-0.6, 0.3, -1.1], scale: [0.5, 16.0, 0.5], speed: 0.5, offset: 3.1 }
  ];

  function createLineMesh(config) {
    const geometry = new THREE.BoxGeometry(config.scale[0], config.scale[1], config.scale[2]);
    
    // 수정된 ShaderMaterial: 면(fill)과 모서리(edge)를 모두 처리
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOffset: { value: config.offset },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normal;
          // 표준 vertex 셰이더
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOffset;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // 1. 모서리(Edge) 라인 계산 (기존과 동일한 네온 효과)
          // 현재 픽셀이 면의 가장자리(윤곽선)에 가까울수록 beam 값이 커짐
          float flow = mod((vPosition.y * 0.1) + (uTime * 0.25) + uOffset, 1.0);
          float beam = smoothstep(0.2, 0.0, abs(flow - 0.5));

          vec3 baseColor = vec3(0.5, 0.5, 0.5); // 짐 그레이 (모서리 색)
          vec3 neonGreen = vec3(0.12, 0.95, 0.45); // 포인트 그린
          vec3 edgeColor = mix(baseColor, neonGreen, beam);
          
          // 2. 면(Fill) 컬러 계산 (핵심 수정 부분)
          // 큐브의 면이 카메라를 향할수록 normal.z 값이 1에 가까워짐. 
          // 이 값을 이용해 면의 투명도를 조절. z값이 클수록 면이 더 불투명해짐.
          float fillAlpha = pow(abs(vNormal.z), 0.5); // 면의 불투명도 (0.0 ~ 1.0)
          
          // 3. 최종 결합 (핵심 수정 부분)
          // 기본적으로 반투명한 흰색(0.9, 0.9, 0.9, fillAlpha)을 베이스로 깔고,
          // 그 위에 강렬한 네온 엣지 컬러(beam)를 더함(add).
          // 이렇게 하면 면 뒤로 엣지 라인이 비치면서도 면 자체가 존재감을 가짐.
          vec3 finalColor = vec3(0.9, 0.9, 0.9) + (edgeColor * beam * 3.0); // 흰색 면 + 네온 엣지
          
          // 최종 알파값: 엣지가 지나가는 부분은 불투명도 1.0으로 강조, 면 영역은 fillAlpha 적용
          float finalAlpha = max(fillAlpha, beam);

          // 4. 하단 그라데이션 페이드아웃 적용 (이미지 상단 메뉴바 영역에서 선이 자연스럽게 사라지도록)
          // 이 부분은 기존 코드의 
          // if (abs(vNormal.z) > 0.1) { ... } else { ... }
          // 로직을 대체합니다. 전체적으로 Y축에 따라 알파값을 곱해줌.
          float normalizeY = (vPosition.y + (isMobile ? 8.0 : 11.0)) / (isMobile ? 16.0 : 22.0); // 대략적인 Y 범위 정규화
          float fadeOut = smoothstep(0.1, 1.0, normalizeY); // 아래쪽으로 갈수록 점점 투명해짐
          
          // 최종 렌더링
          gl_FragColor = vec4(finalColor, finalAlpha * fadeOut);
          
          // 약간의 뎁스 버퍼 조정 (투명 오브젝트끼리 겹칠 때 깜빡임 방지)
          // 필요시 주석 해제
          // gl_FragDepthEXT = gl_FragCoord.z; 
        }
      `,
      transparent: true,
      // side: THREE.DoubleSide, // 면과 모서리가 모두 보이게 하려면 필요
      depthWrite: false,
      // 필요시 확장자 활성화: #extension GL_EXT_frag_depth : enable
    });

    const group = new THREE.Group();
    
    // 1. 기존 BoxGeometry로 면(Fill) 메시 생성
    const fillMesh = new THREE.Mesh(geometry, material);
    group.add(fillMesh);

    // 2. 기존 EdgesGeometry로 모서리(Line) 생성
    const edges = new THREE.EdgesGeometry(geometry);
    const lineSegments = new THREE.LineSegments(edges, lineMat); // 기존 lineMat 사용
    group.add(lineSegments);

    // [주의] lineMat은 기존에 정의된 전역 변수를 사용하거나, 
    // 여기서 새로 정의해야 합니다 (예: new THREE.LineBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.35 }))

    group.position.set(config.pos[0], config.pos[1], config.pos[2]);
    group.rotation.set(config.rot[0], config.rot[1], config.rot[2]);

    group.userData = {
      material: material, // 셰이더는 fillMesh와 lineSegments가 공유할 수 있음
      speed: config.speed,
      initialPos: [...config.pos],
      initialRot: [...config.rot]
    };

    return group;
  }

    const lineGroups = lineConfigs.map(config => {
    const lg = createLineMesh(config);
    masterGroup.add(lg);
    return lg;
  });

  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollOffset = scrollY * 0.0005;

    masterGroup.rotation.y = mouseX * 0.1;
    masterGroup.rotation.x = mouseY * 0.1;
    masterGroup.position.y = scrollOffset;

    lineGroups.forEach((lg, i) => {
      const p = lg.userData;
      
      lg.position.x = p.initialPos[0] + Math.sin(time * p.speed * 0.4 + i * 1.5) * (isMobile ? 1.0 : 2.5);
      lg.position.y = p.initialPos[1] + Math.cos(time * p.speed * 0.3 + i * 2.0) * 2.0;
      lg.position.z = p.initialPos[2] + Math.sin(time * p.speed * 0.25 + i * 1.0) * 1.5;

      lg.rotation.x = p.initialRot[0] + Math.sin(time * p.speed * 0.3 + i) * 0.15;
      lg.rotation.y = p.initialRot[1] + Math.cos(time * p.speed * 0.25 + i) * 0.15;
      
      if (p.material && p.material.uniforms) {
        p.material.uniforms.uTime.value = time * p.speed;
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const newWidth = container.clientWidth || window.innerWidth;
    const newHeight = container.clientHeight || 800;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}
