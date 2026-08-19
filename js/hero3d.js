import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

/* =========================================================
   HERO THREE.JS
   Studio Style U / X
========================================================= */

export function initHero3D() {

    const container = document.getElementById("hero-3d");

    if (!container) return;

    container.innerHTML = "";


    /* =====================================================
       SCENE & CAMERA
    ===================================================== */

    const scene = new THREE.Scene();

    const camera =
        new THREE.PerspectiveCamera(
            35,
            1,
            0.1,
            100
        );

    camera.position.set(0, 0, 15);


    /* =====================================================
       RENDERER
    ===================================================== */

    const renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setClearColor(0x000000, 0);

    container.appendChild(
        renderer.domElement
    );


    /* =====================================================
       GRAPHIC GROUP
    ===================================================== */

    const group = new THREE.Group();

    scene.add(group);


    /* =====================================================
       BACKGROUND GRID
    ===================================================== */

    function createSolidGridGeometry(
        width,
        height,
        stepX,
        stepY,
        curveAmount = 0.01
    ) {

        const points = [];

        const resolution = 30;


        /* Vertical */

        for (
            let x = -width / 2;
            x <= width / 2;
            x += stepX
        ) {

            for (
                let i = 0;
                i < resolution;
                i++
            ) {

                const t1 = i / resolution;
                const t2 = (i + 1) / resolution;

                const y1 =
                    -height / 2 +
                    t1 * height;

                const y2 =
                    -height / 2 +
                    t2 * height;

                const z1 =
                    (x * x * 0.8 + y1 * y1) *
                    curveAmount -
                    3.0;

                const z2 =
                    (x * x * 0.8 + y2 * y2) *
                    curveAmount -
                    3.0;

                points.push(
                    x, y1, z1,
                    x, y2, z2
                );
            }
        }


        /* Horizontal */

        for (
            let y = -height / 2;
            y <= height / 2;
            y += stepY
        ) {

            for (
                let i = 0;
                i < resolution;
                i++
            ) {

                const t1 = i / resolution;
                const t2 = (i + 1) / resolution;

                const x1 =
                    -width / 2 +
                    t1 * width;

                const x2 =
                    -width / 2 +
                    t2 * width;

                const z1 =
                    (x1 * x1 * 0.8 + y * y) *
                    curveAmount -
                    3.0;

                const z2 =
                    (x2 * x2 * 0.8 + y * y) *
                    curveAmount -
                    3.0;

                points.push(
                    x1, y, z1,
                    x2, y, z2
                );
            }
        }


        const geometry =
            new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                points,
                3
            )
        );

        return geometry;
    }


    const gridGroup =
        new THREE.Group();

    gridGroup.position.set(
        0,
        0,
        -3
    );


    const gridWidth = 36;
    const gridHeight = 22;

    const stepX = 1.2;
    const stepY = 1.2;

    const curveFactor = 0.01;


    const gridGeometry =
        createSolidGridGeometry(
            gridWidth,
            gridHeight,
            stepX,
            stepY,
            curveFactor
        );


    const gridMaterial =
        new THREE.LineBasicMaterial({

            color: 0xB8B8B8,

            transparent: true,

            opacity: 0.5

        });


    const gridLines =
        new THREE.LineSegments(
            gridGeometry,
            gridMaterial
        );


    gridGroup.add(
        gridLines
    );

    scene.add(
        gridGroup
    );


    /* =====================================================
       LETTER MATERIAL
    ===================================================== */

    const lineMaterial =
        new THREE.LineBasicMaterial({

            color: 0x111111,

            transparent: false,

            opacity: 1.0

        });


    /* =====================================================
       FONT
    ===================================================== */

    const loader =
        new FontLoader();


    loader.load(

        "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",

        (font) => {

            /*
                Studio와 동일한 배치
            */

            createLetterMesh(
                "U",
                font,
                -2.9,
                -0.65,
                -0.42,
                0.92,
                0.0,
                true,
                0.002
            );


            createLetterMesh(
                "X",
                font,
                2.25,
                0.55,
                0.42,
                0.88,
                1.8,
                false,
                0.003
            );


            createLetterMesh(
                "X",
                font,
                -2.3,
                3.8,
                0.35,
                0.52,
                3.6,
                false,
                0.001
            );


            createLetterMesh(
                "X",
                font,
                5.3,
                -3.2,
                0.45,
                0.55,
                5.4,
                false,
                0.004
            );


            createLetterMesh(
                "U",
                font,
                6.2,
                1.8,
                -0.75,
                0.48,
                7.2,
                true,
                0.0035
            );

        }
    );


    /* =====================================================
       CREATE LETTER
    ===================================================== */

    function createLetterMesh(
        character,
        font,
        x,
        y,
        rotationY,
        scale,
        timeOffset,
        isU,
        scrollSpeed
    ) {

        const geometryOptions = {

            font: font,

            size: 4.1,

            depth: 0.38,

            curveSegments:
                isU ? 24 : 6,

            bevelEnabled: false

        };


        const geometry =
            new TextGeometry(
                character,
                geometryOptions
            );


        geometry.computeBoundingBox();


        const box =
            geometry.boundingBox;


        geometry.translate(

            -(box.max.x + box.min.x) / 2,

            -(box.max.y + box.min.y) / 2,

            0

        );


        const letterGroup =
            new THREE.Group();


        /* =================================================
           STUDIO STYLE SHADER
        ================================================= */

        const material =
            new THREE.ShaderMaterial({

                uniforms: {

                    uTime: {
                        value: 0
                    },

                    uOffset: {
                        value: timeOffset
                    },

                    uIsU: {
                        value: isU ? 1.0 : 0.0
                    }

                },


                vertexShader: `

                    varying vec3 vPosition;
                    varying vec3 vNormal;

                    void main() {

                        vPosition = position;

                        vNormal = normal;

                        gl_Position =
                            projectionMatrix *
                            modelViewMatrix *
                            vec4(
                                position,
                                1.0
                            );

                    }

                `,


                fragmentShader: `

                    uniform float uTime;
                    uniform float uOffset;
                    uniform float uIsU;

                    varying vec3 vPosition;
                    varying vec3 vNormal;


                    void main() {

                        /*
                            앞면을 비워서
                            외곽선 중심으로 보이게 함
                        */

                        if (
                            abs(vNormal.z) > 0.1
                        ) discard;


                        float beam = 0.0;


                        if (uIsU > 0.5) {

                            float sideDir =
                                (vPosition.x < 0.0)
                                ? 1.0
                                : -1.0;


                            float flow =
                                mod(
                                    (vPosition.y * 0.2) +
                                    (
                                        uTime *
                                        0.3 *
                                        sideDir
                                    ) +
                                    (uOffset * 0.2),
                                    1.0
                                );


                            beam =
                                smoothstep(
                                    0.12,
                                    0.0,
                                    abs(
                                        flow - 0.5
                                    )
                                );

                        } else {

                            float angle =
                                atan(
                                    vPosition.y,
                                    vPosition.x
                                );


                            float sweep =
                                mod(
                                    (angle / 6.28318) -
                                    (uTime * 0.15) +
                                    (uOffset * 0.1),
                                    1.0
                                );


                            beam =
                                smoothstep(
                                    0.12,
                                    0.0,
                                    abs(
                                        sweep - 0.5
                                    )
                                );

                        }


                        vec3 baseColor =
                            vec3(
                                0.04,
                                0.04,
                                0.04
                            );


                        vec3 neonGreen =
                            vec3(
                                0.12,
                                0.95,
                                0.45
                            );


                        vec3 finalColor =
                            mix(
                                baseColor,
                                neonGreen,
                                beam
                            );


                        float alpha =
                            0.08 +
                            beam * 0.92;


                        gl_FragColor =
                            vec4(
                                finalColor,
                                alpha
                            );

                    }

                `,

                transparent: true,

                side: THREE.DoubleSide,

                depthWrite: false

            });


        const fillMesh =
            new THREE.Mesh(
                geometry,
                material
            );


        letterGroup.add(
            fillMesh
        );


        /* =================================================
           CRISP BLACK OUTLINE
        ================================================= */

        const edges =
            new THREE.EdgesGeometry(
                geometry,
                isU ? 25 : 15
            );


        const lineSegments =
            new THREE.LineSegments(
                edges,
                lineMaterial
            );


        letterGroup.add(
            lineSegments
        );


        /* =================================================
           POSITION
        ================================================= */

        letterGroup.position.set(
            x,
            y,
            0
        );


        letterGroup.scale.setScalar(
            scale
        );


        letterGroup.rotation.y =
            rotationY;


        letterGroup.rotation.x =
            -0.08;


        letterGroup.userData = {

            baseX: x,

            baseY: y,

            baseRotationY:
                rotationY,

            material:
                material,

            scrollSpeed:
                scrollSpeed

        };


        group.add(
            letterGroup
        );

    }


    /* =====================================================
       MOUSE
    ===================================================== */

    const target = {
        x: 0,
        y: 0
    };


    const mouse = {
        x: 0,
        y: 0
    };


    window.addEventListener(

        "mousemove",

        (e) => {

            target.x =
                (e.clientX /
                    window.innerWidth) *
                2 -
                1;


            target.y =
                -(e.clientY /
                    window.innerHeight) *
                2 +
                1;

        },

        {
            passive: true
        }

    );


    /* =====================================================
       RESIZE
    ===================================================== */

    function resize() {

        const width =
            container.clientWidth;

        const height =
            container.clientHeight;


        if (!width || !height)
            return;


        const isMobile =
            window.innerWidth < 768;


        camera.aspect =
            width / height;


        camera.position.z =
            isMobile
                ? 18.5
                : 15;


        camera.updateProjectionMatrix();


        group.scale.setScalar(

            isMobile
                ? 0.68
                : 1.0

        );


        renderer.setSize(
            width,
            height,
            false
        );

    }


    window.addEventListener(
        "resize",
        resize
    );


    /* =====================================================
       ANIMATION
    ===================================================== */

    const clock =
        new THREE.Clock();


    function animate() {

        requestAnimationFrame(
            animate
        );


        const time =
            clock.getElapsedTime();


        const scrollY =
            window.scrollY ||
            window.pageYOffset;


        mouse.x +=
            (
                target.x -
                mouse.x
            ) * 0.08;


        mouse.y +=
            (
                target.y -
                mouse.y
            ) * 0.08;


        /* Grid movement */

        gridGroup.position.x =
            -mouse.x * 0.2;


        gridGroup.position.y =
            -mouse.y * 0.15 +
            (
                scrollY * 0.001
            );


        /* U / X movement */

        group.children.forEach(
            (obj, index) => {

                const p =
                    obj.userData;


                const scrollOffset =
                    scrollY *
                    p.scrollSpeed;


                obj.position.x =
                    p.baseX +
                    Math.sin(
                        time * 0.4 +
                        index
                    ) * 0.06;


                obj.position.y =
                    (
                        p.baseY -
                        scrollOffset
                    ) +
                    Math.cos(
                        time * 0.5 +
                        index
                    ) * 0.08;


                obj.rotation.y =
                    p.baseRotationY +
                    mouse.x * 0.2;


                obj.rotation.x =
                    -0.08 -
                    mouse.y * 0.1;


                if (
                    p.material &&
                    p.material.uniforms &&
                    p.material.uniforms.uTime
                ) {

                    p.material.uniforms.uTime.value =
                        time;

                }

            }
        );


        renderer.render(
            scene,
            camera
        );

    }


    resize();

    animate();

}
