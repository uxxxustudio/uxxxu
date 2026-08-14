import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS (Smooth Bevel Edge & Clean Light Glass)
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 6.0);
  mainLight.position.set(-4, 8, 12);
  scene.add(mainLight);

  const mouseLight = new THREE.PointLight(0xffffff, 6.0, 25);
  scene.add(mouseLight);

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
     U SMOOTH EDGE CUSTOM SHADER (★ 모서리 끊김 해결)
  ===================================================== */
  const cleanWhiteEdgeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0xffffff) },
      bottomColor: { value: new THREE.Color(0xe2e8f0) }, // 밝은 쿨그레이
      edgeColor: { value: new THREE.Color(0xffffff) },
      fresnelPower: { value: 2.5 },                      
      opacity: { value: 0.55 },                          // 투명도 유지
      lightDirection: { value: new THREE.Vector3(-0.5, 0.8, 1.0).normalize() }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        // ★ [핵심] 모서리 법선을 부드럽게 보정 (NormalMatrix 전규화)
        vNormal = normalize(normalMatrix * normal);
        
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 edgeColor;
      uniform float fresnelPower;
      uniform float opacity;
      uniform vec3 lightDirection;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        // ★ [핵심] 파편화된 Normal을 픽셀 단위로 다시 정규화하여 끊김 방지
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // 상하 그라데이션
        float heightRatio = clamp((vWorldPosition.y + 2.0) / 4.0, 0.0, 1.0);
        vec3 baseGradient = mix(bottomColor, topColor, heightRatio);

        // 은은한 라이팅 (모서리 대비 감소)
        float NdotL = max(dot(normal, lightDirection), 0.0);
        float lightIntensity = smoothstep(0.0, 1.0, 0.8 + 0.2 * NdotL);
        vec3 shadedColor = baseGradient * lightIntensity;

        // 퓨어 화이트 외곽 프레넬 라이트 (모서리에서 자연스럽게 뭉개짐)
        float fresnel = 1.0 - max(dot(normal, viewDir), 0.0);
        // ★ 파워를 조절하여 경계선에서 프레넬이 칼같이 끊기지 않게 함
        fresnel = pow(fresnel, fresnelPower);

        vec3 finalColor = mix(shadedColor, edgeColor, fresnel * 0.75);

        gl_FragColor = vec4(finalColor, opacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide
  });

  // X 글자용 와이어프레임 라인 재질
  const xLineMaterial = new THREE.LineBasicMaterial({
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

    const letterGroup = new THREE.Group();

    if (isU) {
      // 모서리 보정 셰이더 메시
      letterGroup.add(new THREE.Mesh(geometry, cleanWhiteEdgeMaterial));
    } else {
      letterGroup.add(
        new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), xLineMaterial)
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
