import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";


/* =========================================================
   HERO THREE.JS
   U / X
========================================================= */

export function initHero3D() {

    const container =
        document.getElementById("hero-3d");

    if (!container) return;

    container.innerHTML = "";


    /* =====================================================
       SCENE
    ===================================================== */

    const scene =
        new THREE.Scene();


    /* =====================================================
       CAMERA
    ===================================================== */

    const camera =
        new THREE.PerspectiveCamera(
            30,
            1,
            0.1,
            100
        );

    camera.position.set(
        0,
        0,
        16
    );


    /* =====================================================
       RENDERER
    ===================================================== */

    const renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            alpha: true

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


    container.appendChild(
        renderer.domElement
    );


    /* =====================================================
       GRAPHIC GROUP
    ===================================================== */

    const group =
        new THREE.Group();

    scene.add(group);


    /* =====================================================
       MATERIAL
    ===================================================== */

    const faceMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xffffff,

            transparent: true,

            opacity: .075,

            side: THREE.DoubleSide,

            depthWrite: false

        });


    const edgeMaterial =
        new THREE.LineBasicMaterial({

            color: 0x111111,

            transparent: true,

            opacity: .52

        });


    /* =====================================================
       FONT
    ===================================================== */

    const loader =
        new FontLoader();


    loader.load(

        "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",

        (font) => {

            createLetter(
                "U",
                font,
                -2.55,
                -0.70,
                -0.30,
                .88,
                0
            );


            createLetter(
                "X",
                font,
                2.10,
                0.65,
                -0.26,
                .82,
                1.8
            );

        },

        undefined,

        (error) => {

            console.error(
                "Hero font load failed:",
                error
            );

        }

    );


    /* =====================================================
       CREATE 3D LETTER
    ===================================================== */

    function createLetter(
        character,
        font,
        x,
        y,
        rotationY,
        scale,
        phase
    ) {

        const geometry =
            new TextGeometry(
                character,
                {

                    font: font,

                    size: 4.2,

                    depth: .62,

                    curveSegments: 12,

                    bevelEnabled: false

                }
            );


        geometry.computeBoundingBox();


        /* =================================================
           CENTER
        ================================================= */

        const box =
            geometry.boundingBox;


        geometry.translate(

            -(
                box.max.x +
                box.min.x
            ) / 2,

            -(
                box.max.y +
                box.min.y
            ) / 2,

            0

        );


        /* =================================================
           FACE
        ================================================= */

        const face =
            new THREE.Mesh(
                geometry,
                faceMaterial
            );


        /* =================================================
           OUTLINE
        ================================================= */

        const edges =
            new THREE.EdgesGeometry(
                geometry,
                35
            );


        const outline =
            new THREE.LineSegments(
                edges,
                edgeMaterial
            );


        /* =================================================
           LETTER GROUP
        ================================================= */

        const letter =
            new THREE.Group();


        letter.add(
            face
        );


        letter.add(
            outline
        );


        letter.position.set(
            x,
            y,
            0
        );


        letter.rotation.y =
            rotationY;


        letter.rotation.x =
            -0.055;


        letter.scale.setScalar(
            scale
        );


        letter.userData.baseX =
            x;


        letter.userData.baseY =
            y;


        letter.userData.baseRotationY =
            rotationY;


        letter.userData.phase =
            phase;


        group.add(
            letter
        );

    }


    /* =====================================================
       MOUSE
    ===================================================== */

    const mouse = {

        x: 0,

        y: 0

    };


    const targetMouse = {

        x: 0,

        y: 0

    };


    window.addEventListener(

        "mousemove",

        (event) => {

            targetMouse.x =
                (
                    event.clientX /
                    window.innerWidth
                ) * 2 - 1;


            targetMouse.y =
                (
                    event.clientY /
                    window.innerHeight
                ) * 2 - 1;

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


        mouse.x +=
            (
                targetMouse.x -
                mouse.x
            ) * 0.035;


        mouse.y +=
            (
                targetMouse.y -
                mouse.y
            ) * 0.035;


        group.children.forEach(
            (letter) => {

                const phase =
                    letter.userData.phase;


                letter.position.x =
                    letter.userData.baseX +
                    Math.sin(
                        time * 0.65 +
                        phase
                    ) * 0.13;


                letter.position.y =
                    letter.userData.baseY +
                    Math.cos(
                        time * 0.75 +
                        phase
                    ) * 0.13;


                letter.rotation.y =
                    letter.userData.baseRotationY +
                    mouse.x * 0.12;


                letter.rotation.x =
                    -0.055 +
                    mouse.y * 0.045;

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

export function initSectionObject(
    targetId
) {

    const container =
        document.getElementById(
            targetId
        );


    if (!container) return;


    container.innerHTML = "";


    /* =====================================================
       SCENE
    ===================================================== */

    const scene =
        new THREE.Scene();


    /* =====================================================
       CAMERA
    ===================================================== */

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
        11
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


    scene.add(
        group
    );


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
       Hero U/X와 어울리는 밝은 회백색
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
       EDGE
    ===================================================== */

    const edgeMaterial =
        new THREE.LineBasicMaterial({

            color: 0xb8bfbd,

            transparent: true,

            opacity: 0.7

        });


    /* =====================================================
       GREEN SIDE SCAN
    ===================================================== */

    const greenSideMaterial =
        new THREE.ShaderMaterial({

            uniforms: {

                uProgress: {
                    value: 0
                },

                uWidth: {
                    value: 0.10
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
                       앞/뒤 넓은 면 제외
                       실제 두께 측면만 표시
                    */

                    float sideMask =
                        1.0 -
                        smoothstep(
                            0.35,
                            0.72,
                            abs(
                                vNormal.z
                            )
                        );


                    /*
                       선 길이 방향
                    */

                    float scanPosition =
                        vPosition.x;


                    float distanceToBeam =
                        abs(

                            scanPosition -

                            (
                                uProgress -
                                0.5
                            ) * 12.0

                        );


                    float beam =
                        1.0 -
                        smoothstep(

                            0.0,

                            uWidth,

                            distanceToBeam

                        );


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
                            beam * 0.95 +
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
       CREATE BAR
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


        /* =================================================
           3D BODY
        ================================================= */

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


        /* =================================================
           OUTLINE
        ================================================= */

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


        /* =================================================
           GREEN SIDE SCAN
        ================================================= */

        const greenMesh =
            new THREE.Mesh(

                geometry,

                greenSideMaterial.clone()

            );


        greenMesh.scale.set(
            1.003,
            1.003,
            1.003
        );


        mesh.add(
            greenMesh
        );


        /* =================================================
           SOFT GREEN GLOW
        ================================================= */

        const glowMaterial =
            new THREE.MeshBasicMaterial({

                color: 0x20f47a,

                transparent: true,

                opacity: 0.035,

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


        /* =================================================
           DATA
        ================================================= */

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

            greenMaterial:
                greenMesh.material

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
       가장 긴 / 얇은 대각선
    ===================================================== */

    createBar({

        length: 7.2,

        thickness: 0.065,

        depth: 0.085,

        x: 1.8,

        y: 2.4,

        z: -0.2,

        rotationZ: 28,

        rotationY: -9,

        phase: 0,

        speed: 0.22

    });


    /* =====================================================
       LINE 02
       세로에 가까운 선
    ===================================================== */

    createBar({

        length: 6.2,

        thickness: 0.052,

        depth: 0.072,

        x: -2.8,

        y: 0.1,

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

        length: 5.5,

        thickness: 0.045,

        depth: 0.065,

        x: 0.5,

        y: -0.6,

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

        length: 6.4,

        thickness: 0.072,

        depth: 0.088,

        x: 2.4,

        y: -2.5,

        z: -0.25,

        rotationZ: 14,

        rotationY: 10,

        phase: 5.0,

        speed: 0.20

    });


    /* =====================================================
       MOUSE
    ===================================================== */

    const mouse = {

        x: 0,

        y: 0

    };


    const targetMouse = {

        x: 0,

        y: 0

    };


    window.addEventListener(

        "mousemove",

        (event) => {

            targetMouse.x =
                (
                    event.clientX /
                    window.innerWidth
                ) * 2 - 1;


            targetMouse.y =
                -(
                    event.clientY /
                    window.innerHeight
                ) * 2 + 1;

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


        /*
           PC는 가까이
           모바일은 조금 멀리
        */

        camera.position.z =
            isMobile
                ? 17
                : 11;


        camera.updateProjectionMatrix();


        /*
           전체 크기
        */

        group.scale.setScalar(

            isMobile
                ? 0.82
                : 1.35

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


        /* =================================================
           SMOOTH MOUSE
        ================================================= */

        mouse.x +=
            (
                targetMouse.x -
                mouse.x
            ) * 0.06;


        mouse.y +=
            (
                targetMouse.y -
                mouse.y
            ) * 0.06;


        /* =================================================
           WHOLE GROUP MOTION
           Hero와 같은 아주 미세한 움직임
        ================================================= */

        group.position.x =
            mouse.x * 0.10;


        group.position.y =
            mouse.y * 0.06;


        group.rotation.y =
            mouse.x * 0.035;


        group.rotation.x =
            -mouse.y * 0.025;


        /* =================================================
           EACH LINE FLOAT
        ================================================= */

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


                /* =================================================
                   GREEN LIGHT SCAN
                ================================================= */

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
