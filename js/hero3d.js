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
