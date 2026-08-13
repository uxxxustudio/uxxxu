import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";


/* =========================================================
   HERO THREE.JS
========================================================= */

export function initHero3D() {

    const container =
        document.getElementById("hero-3d");

    if (!container) return;


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
            34,
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
            antialias:true,
            alpha:true
        });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
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
       WIREFRAME MATERIAL
    ===================================================== */

    const material =
        new THREE.LineBasicMaterial({
            color:0x111111,
            transparent:true,
            opacity:.58
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
                -2.9,
                -0.65,
                -0.42,
                .92,
                0
            );

            createLetter(
                "X",
                font,
                2.25,
                0.55,
                0.42,
                .88,
                1.7
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
       CREATE 3D WIRE LETTER
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
                    font:font,

                    size:4.1,

                    depth:.72,

                    curveSegments:10,

                    bevelEnabled:true,

                    bevelThickness:.09,

                    bevelSize:.055,

                    bevelSegments:3
                }
            );


        geometry.computeBoundingBox();


        /* center */

        const box =
            geometry.boundingBox;

        const centerX =
            (box.max.x + box.min.x) / 2;

        const centerY =
            (box.max.y + box.min.y) / 2;

        geometry.translate(
            -centerX,
            -centerY,
            0
        );


        /* =================================================
           TRUE 3D WIREFRAME
        ================================================= */

        const wireGeometry =
            new THREE.WireframeGeometry(
                geometry
            );


        const wire =
            new THREE.LineSegments(
                wireGeometry,
                material
            );


        wire.position.set(
            x,
            y,
            0
        );

        wire.scale.setScalar(
            scale
        );

        wire.rotation.y =
            rotationY;

        wire.rotation.x =
            -0.08;


        wire.userData = {

            baseX:x,

            baseY:y,

            baseRotationY:
                rotationY,

            phase:phase

        };


        group.add(
            wire
        );

    }


    /* =====================================================
       MOUSE
    ===================================================== */

    const target = {
        x:0,
        y:0
    };

    const mouse = {
        x:0,
        y:0
    };


    window.addEventListener(
        "mousemove",
        (event) => {

            target.x =
                (event.clientX /
                window.innerWidth) * 2 - 1;

            target.y =
                (event.clientY /
                window.innerHeight) * 2 - 1;

        },
        { passive:true }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    function resize() {

        const width =
            container.clientWidth;

        const height =
            container.clientHeight;

        if (!width || !height) return;

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

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
            (target.x - mouse.x) * .035;

        mouse.y +=
            (target.y - mouse.y) * .035;


        group.children.forEach(
            (object) => {

                const phase =
                    object.userData.phase;

                object.position.x =
                    object.userData.baseX +
                    Math.sin(
                        time * .55 + phase
                    ) * .10;

                object.position.y =
                    object.userData.baseY +
                    Math.cos(
                        time * .70 + phase
                    ) * .12;

                object.rotation.y =
                    object.userData.baseRotationY +
                    mouse.x * .18;

                object.rotation.x =
                    -.08 +
                    mouse.y * .06;

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
