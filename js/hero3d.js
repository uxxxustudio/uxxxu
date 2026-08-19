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


        gridGroup.position.x =
            -mouse.x * 0.2;


        gridGroup.position.y =
            -mouse.y * 0.15 +
            (
                scrollY * 0.001
            );


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


/* =========================================================
   SERVICE 3D
   Thin Floating Volume Lines
========================================================= */

export function initSectionObject(targetId) {

    const container =
        document.getElementById(targetId);

    if (!container) return;

    container.innerHTML = "";


    /* =====================================================
       SCENE
    ===================================================== */

    const scene =
        new THREE.Scene();


    const camera =
        new THREE.PerspectiveCamera(
            32,
            1,
            0.1,
            100
        );


    camera.position.set(
        0,
        0,
        15
    );


    /* =====================================================
       RENDERER
    ===================================================== */

    const renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            alpha: true,

            powerPreference:
                "high-performance"

        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    renderer.setClearColor(
        0x000000,
        0
    );


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    container.appendChild(
        renderer.domElement
    );


    /* =====================================================
       GROUP
    ===================================================== */

    const group =
        new THREE.Group();

    scene.add(group);


    /* =====================================================
       LIGHT
    ===================================================== */

    scene.add(
        new THREE.AmbientLight(
            0xffffff,
            2.0
        )
    );


    const keyLight =
        new THREE.DirectionalLight(
            0xffffff,
            2.0
        );


    keyLight.position.set(
        -4,
        5,
        8
    );


    scene.add(
        keyLight
    );


    const rimLight =
        new THREE.DirectionalLight(
            0xe9fff4,
            1.0
        );


    rimLight.position.set(
        5,
        -2,
        6
    );


    scene.add(
        rimLight
    );


    /* =====================================================
       BASE MATERIAL
       메인 U/X와 어울리는 밝은 회백색
    ===================================================== */

    const lineMaterial =
        new THREE.MeshPhysicalMaterial({

            color: 0xe7eae9,

            roughness: 0.24,

            metalness: 0.04,

            transparent: true,

            opacity: 0.78,

            clearcoat: 0.65,

            clearcoatRoughness: 0.2

        });


    /* =====================================================
       EDGE MATERIAL
    ===================================================== */

    const edgeMaterial =
        new THREE.LineBasicMaterial({

            color: 0xb8bfbd,

            transparent: true,

            opacity: 0.7

        });


    /* =====================================================
       GREEN SIDE LIGHT SHADER
       
       앞/뒤 넓은 면은 제외하고
       3D 두께의 측면만 그린빛이 지나감
    ===================================================== */

    const greenSideMaterial =
        new THREE.ShaderMaterial({

            uniforms: {

                uProgress: {
                    value: 0
                },

                uWidth: {
                    value: 0.085
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

                uniform float uProgress;
                uniform float uWidth;

                varying vec3 vPosition;
                varying vec3 vNormal;


                void main() {

                    /*
                     * BoxGeometry의 앞/뒤 면
                     * normal.z = +/-1
                     *
                     * 이것을 제외하면
                     * 실제 3D 두께의 옆면만 남음
                     */

                    float sideMask =
                        1.0 -
                        smoothstep(
                            0.35,
                            0.72,
                            abs(vNormal.z)
                        );


                    /*
                     * 선의 길이 방향 스캔
                     */

                    float scanPosition =
                        vPosition.x;


                    float distanceToBeam =
                        abs(
                            scanPosition -
                            (
                                uProgress -
                                0.5
                            ) * 10.0
                        );


                    float beam =
                        1.0 -
                        smoothstep(
                            0.0,
                            uWidth,
                            distanceToBeam
                        );


                    /*
                     * 아주 약한 glow
                     */

                    float glow =
                        1.0 -
                        smoothstep(
                            0.0,
                            uWidth * 3.0,
                            distanceToBeam
                        );


                    float alpha =
                        sideMask *
                        (
                            beam * 0.92 +
                            glow * 0.08
                        );


                    vec3 green =
                        vec3(
                            0.10,
                            0.95,
                            0.42
                        );


                    gl_FragColor =
                        vec4(
                            green,
                            alpha
                        );

                }

            `,

            transparent: true,

            depthWrite: false,

            blending:
                THREE.AdditiveBlending

        });


    const bars = [];


    /* =====================================================
       CREATE 3D LINE
    ===================================================== */

    function createBar({

        length,
        thickness,
        depth,

        x,
        y,
        z,

        rotationZ,
        rotationY,

        phase,

        speed

    }) {


        const barGroup =
            new THREE.Group();


        barGroup.position.set(
            x,
            y,
            z
        );


        barGroup.rotation.z =
            THREE.MathUtils.degToRad(
                rotationZ
            );


        barGroup.rotation.y =
            THREE.MathUtils.degToRad(
                rotationY
            );


        /* ---------------------------------------------
           3D BODY
        --------------------------------------------- */

        const geometry =
            new THREE.BoxGeometry(
                length,
                thickness,
                depth
            );


        const mesh =
            new THREE.Mesh(
                geometry,
                lineMaterial
            );


        barGroup.add(
            mesh
        );


        /* ---------------------------------------------
           OUTLINE
        --------------------------------------------- */

        const edges =
            new THREE.EdgesGeometry(
                geometry
            );


        const outline =
            new THREE.LineSegments(
                edges,
                edgeMaterial
            );


        mesh.add(
            outline
        );


        /* ---------------------------------------------
           GREEN SIDE LIGHT
           
           같은 BoxGeometry를 사용하기 때문에
           선의 실제 두께 면을 따라감
        --------------------------------------------- */

        const greenMesh =
            new THREE.Mesh(
                geometry,
                greenSideMaterial.clone()
            );


        greenMesh.scale.set(
            1.002,
            1.002,
            1.002
        );


        mesh.add(
            greenMesh
        );


        /* ---------------------------------------------
           SOFT LIGHT
        --------------------------------------------- */

        const glowMaterial =
            new THREE.MeshBasicMaterial({

                color: 0x20f47a,

                transparent: true,

                opacity: 0.045,

                blending:
                    THREE.AdditiveBlending,

                depthWrite: false

            });


        const glow =
            new THREE.Mesh(
                geometry,
                glowMaterial
            );


        glow.scale.set(
            1.012,
            1.012,
            1.012
        );


        mesh.add(
            glow
        );


        /* ---------------------------------------------
           DATA
        --------------------------------------------- */

        barGroup.userData = {

            baseX: x,

            baseY: y,

            baseZ: z,

            baseRotationZ:
                THREE.MathUtils.degToRad(
                    rotationZ
                ),

            baseRotationY:
                THREE.MathUtils.degToRad(
                    rotationY
                ),

            phase,

            speed,

            length,

            greenMaterial:
                greenMesh.material,

            greenMesh

        };


        group.add(
            barGroup
        );


        bars.push(
            barGroup
        );

    }


    /* =====================================================
       LINE 01
       가장 긴 선
    ===================================================== */

    createBar({

        length: 5.8,

        thickness: 0.065,

        depth: 0.085,

        x: 1.2,

        y: 2.0,

        z: -0.2,

        rotationZ: 27,

        rotationY: -9,

        phase: 0,

        speed: 0.22

    });


    /* =====================================================
       LINE 02
       세로에 가까운 선
    ===================================================== */

    createBar({

        length: 4.9,

        thickness: 0.052,

        depth: 0.072,

        x: -2.35,

        y: 0.05,

        z: 0.15,

        rotationZ: 78,

        rotationY: 8,

        phase: 1.8,

        speed: 0.19

    });


    /* =====================================================
       LINE 03
       짧고 얇은 선
    ===================================================== */

    createBar({

        length: 4.25,

        thickness: 0.045,

        depth: 0.065,

        x: 0.35,

        y: -0.45,

        z: 0.55,

        rotationZ: -16,

        rotationY: -6,

        phase: 3.5,

        speed: 0.25

    });


    /* =====================================================
       LINE 04
       아래쪽 선
    ===================================================== */

    createBar({

        length: 5.1,

        thickness: 0.072,

        depth: 0.088,

        x: 1.75,

        y: -2.15,

        z: -0.25,

        rotationZ: 14,

        rotationY: 10,

        phase: 5.0,

        speed: 0.20

    });


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
                (
                    e.clientX /
                    window.innerWidth
                ) *
                2 -
                1;


            target.y =
                -(
                    e.clientY /
                    window.innerHeight
                ) *
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


        if (
            !width ||
            !height
        ) return;


        const isMobile =
            window.innerWidth < 768;


        camera.aspect =
            width / height;


        camera.position.z =
            isMobile
                ? 17
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


        /* ---------------------------------------------
           Mouse smoothing
        --------------------------------------------- */

        mouse.x +=
            (
                target.x -
                mouse.x
            ) * 0.06;


        mouse.y +=
            (
                target.y -
                mouse.y
            ) * 0.06;


        /* ---------------------------------------------
           전체 패럴랙스
        --------------------------------------------- */

        group.position.x =
            mouse.x * 0.10;


        group.position.y =
            mouse.y * 0.06;


        group.rotation.y =
            mouse.x * 0.035;


        group.rotation.x =
            -mouse.y * 0.025;


        /* ---------------------------------------------
           각 선 독립적인 부유
        --------------------------------------------- */

        bars.forEach(
            (bar) => {

                const data =
                    bar.userData;


                bar.position.x =
                    data.baseX +
                    Math.sin(
                        time * 0.25 +
                        data.phase
                    ) * 0.055;


                bar.position.y =
                    data.baseY +
                    Math.cos(
                        time * 0.30 +
                        data.phase
                    ) * 0.075;


                bar.position.z =
                    data.baseZ +
                    Math.sin(
                        time * 0.18 +
                        data.phase
                    ) * 0.045;


                bar.rotation.z =
                    data.baseRotationZ +
                    Math.sin(
                        time * 0.16 +
                        data.phase
                    ) * 0.012;


                bar.rotation.y =
                    data.baseRotationY +
                    Math.cos(
                        time * 0.14 +
                        data.phase
                    ) * 0.018;


                /* -------------------------------------
                   GREEN LIGHT SCAN
                   
                   각 선을 따라
                   천천히 한 번씩 지나감
                ------------------------------------- */

                const progress =
                    (
                        time *
                        data.speed *
                        0.13
                        +
                        data.phase * 0.07
                    ) % 1;


                data.greenMaterial
                    .uniforms
                    .uProgress
                    .value =
                    progress;

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
