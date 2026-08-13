/* =========================================================
   HERO 3D
   U / X — clean outer-edge 3D wire form
========================================================= */

export async function initHero3D() {

    const container = document.getElementById("hero-3d");

    if (!container) {
        console.warn("hero-3d container not found");
        return;
    }

    try {

        const THREE = await import(
            "https://esm.sh/three@0.180.0"
        );

        const { FontLoader } = await import(
            "https://esm.sh/three@0.180.0/examples/jsm/loaders/FontLoader.js"
        );

        const { TextGeometry } = await import(
            "https://esm.sh/three@0.180.0/examples/jsm/geometries/TextGeometry.js"
        );


        /* =====================================================
           SCENE
        ===================================================== */

        const scene = new THREE.Scene();


        /* =====================================================
           CAMERA
        ===================================================== */

        const camera = new THREE.PerspectiveCamera(
            32,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );

        camera.position.set(0, 0, 16);


        /* =====================================================
           RENDERER
        ===================================================== */

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

        renderer.setClearColor(0x000000, 0);

        container.appendChild(
            renderer.domElement
        );


        /* =====================================================
           GROUP
        ===================================================== */

        const group = new THREE.Group();

        scene.add(group);


        /* =====================================================
           FONT
        ===================================================== */

        const fontLoader = new FontLoader();

        fontLoader.load(

            "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",

            function(font) {

                createLetter(
                    "U",
                    font,
                    -3.0,
                    -0.25,
                    -0.30,
                    0.92
                );

                createLetter(
                    "X",
                    font,
                    2.15,
                    0.75,
                    0.30,
                    0.86
                );

            },

            undefined,

            function(error) {

                console.error(
                    "Hero font load failed:",
                    error
                );

            }
        );


        /* =====================================================
           LETTER
        ===================================================== */

        function createLetter(
            character,
            font,
            x,
            y,
            rotationY,
            scale
        ) {

            const geometry = new TextGeometry(
                character,
                {
                    font: font,

                    size: 4.2,

                    depth: 0.62,

                    curveSegments: 18,

                    bevelEnabled: true,

                    bevelThickness: 0.055,

                    bevelSize: 0.035,

                    bevelSegments: 3
                }
            );


            /* -------------------------------------------------
               CENTER
            ------------------------------------------------- */

            geometry.computeBoundingBox();

            const box =
                geometry.boundingBox;

            geometry.translate(
                -(box.max.x + box.min.x) / 2,
                -(box.max.y + box.min.y) / 2,
                0
            );


            /* =================================================
               WHITE TRANSPARENT FACE
            ================================================= */

            const faceMaterial =
                new THREE.MeshBasicMaterial({

                    color: 0xffffff,

                    transparent: true,

                    opacity: 0.075,

                    side: THREE.DoubleSide,

                    depthWrite: false

                });


            const face =
                new THREE.Mesh(
                    geometry,
                    faceMaterial
                );


            /* =================================================
               OUTER EDGE ONLY
               
               WireframeGeometry ❌
               EdgesGeometry     ⭕
            ================================================= */

            const edgeGeometry =
                new THREE.EdgesGeometry(
                    geometry,
                    35
                );


            const edgeMaterial =
                new THREE.LineBasicMaterial({

                    color: 0x111111,

                    transparent: true,

                    opacity: 0.72

                });


            const edges =
                new THREE.LineSegments(
                    edgeGeometry,
                    edgeMaterial
                );


            /* =================================================
               LETTER GROUP
            ================================================= */

            const letter =
                new THREE.Group();

            letter.add(face);
            letter.add(edges);


            /* =================================================
               POSITION
            ================================================= */

            letter.position.set(
                x,
                y,
                0
            );


            /* =================================================
               SIDE VIEW
               
               정면이 아니라 살짝 측면으로
               실제 depth가 보이도록 회전
            ================================================= */

            letter.rotation.y =
                rotationY;

            letter.rotation.x =
                -0.055;


            letter.scale.setScalar(
                scale
            );


            /* =================================================
               FLOAT DATA
            ================================================= */

            letter.userData.baseX = x;

            letter.userData.baseY = y;

            letter.userData.baseRotationY =
                rotationY;

            letter.userData.phase =
                character === "U"
                    ? 0
                    : Math.PI * 0.65;


            group.add(letter);

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
            function(event) {

                targetMouse.x =
                    (event.clientX /
                    window.innerWidth) * 2 - 1;

                targetMouse.y =
                    (event.clientY /
                    window.innerHeight) * 2 - 1;

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

            if (!width || !height) {
                return;
            }


            camera.aspect =
                width / height;

            camera.updateProjectionMatrix();


            renderer.setSize(
                width,
                height
            );

        }


        window.addEventListener(
            "resize",
            resize
        );


        /* =====================================================
           FLOAT ANIMATION
        ===================================================== */

        const clock =
            new THREE.Clock();


        function animate() {

            requestAnimationFrame(
                animate
            );


            const time =
                clock.getElapsedTime();


            /* -------------------------------------------------
               SMOOTH MOUSE
            ------------------------------------------------- */

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


            /* -------------------------------------------------
               FLOAT
            ------------------------------------------------- */

            group.children.forEach(
                function(letter) {

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


                    /* -------------------------------------------------
                       SIDE VIEW + MOUSE
                    ------------------------------------------------- */

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


        /* =====================================================
           START
        ===================================================== */

        resize();

        animate();


    } catch (error) {

        console.error(
            "Hero Three.js initialization failed:",
            error
        );

    }

}
