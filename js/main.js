/* =========================================================
   Component Loader
========================================================= */

async function loadComponent(id, file) {

    const target = document.getElementById(id);

    if (!target) return;

    const res = await fetch(file);

    if (!res.ok) {
        console.error(file + " load failed");
        return;
    }

    target.innerHTML = await res.text();

}


/* =========================================================
   Component Path
========================================================= */

const componentPath = new URL(
    "../components/",
    document.currentScript.src
);


/* =========================================================
   Initialize
========================================================= */

window.addEventListener("DOMContentLoaded", async () => {

    await loadComponent(
        "header",
        new URL("header.html", componentPath)
    );

    await loadComponent(
        "hero",
        new URL("hero.html", componentPath)
    );

    await loadComponent(
        "service",
        new URL("service.html", componentPath)
    );

    await loadComponent(
        "portfolio",
        new URL("portfolio.html", componentPath)
    );

    await loadComponent(
        "about",
        new URL("about.html", componentPath)
    );

    await loadComponent(
        "contact",
        new URL("contact.html", componentPath)
    );

    await loadComponent(
        "footer",
        new URL("footer.html", componentPath)
    );

});


/* =========================================================
   Header Scroll
========================================================= */

window.addEventListener("scroll", () => {

    const header = document.querySelector("#header > header");
    const nav = document.querySelector("header nav");

    if (!header) return;

    if (window.scrollY > 30) {
        header.classList.add("active");
    } else {
        header.classList.remove("active");
    }

    if (nav) {
        nav.classList.remove("open");
    }

});


/* =========================================================
   Mobile Menu
========================================================= */

window.addEventListener("click", (e) => {

    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    if (!button || !nav) return;

    if (e.target.closest(".menu-toggle")) {
        nav.classList.toggle("open");
    }



   /* =========================================================
   THREE.JS HERO 3D
========================================================= */

async function initHero3D() {

    const container = document.getElementById("hero-3d");

    if (!container) return;

    try {

        const THREE = await import(
            "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
        );

        const { FontLoader } = await import(
            "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js"
        );

        const { TextGeometry } = await import(
            "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js"
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

        camera.position.set(
            0,
            0,
            17
        );


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

        renderer.setClearColor(
            0x000000,
            0
        );

        container.appendChild(
            renderer.domElement
        );


        /* =====================================================
           HERO GROUP
        ===================================================== */

        const graphicGroup = new THREE.Group();

        scene.add(graphicGroup);


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
                    -0.3,
                    0.8,
                    0.9
                );

                createLetter(
                    "X",
                    font,
                    2.2,
                    1.25,
                    -0.75,
                    0.8
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
            scale
        ){

            const geometry = new TextGeometry(
                character,
                {
                    font: font,

                    size: 4.2,

                    depth: 0.65,

                    curveSegments: 8,

                    bevelEnabled: true,

                    bevelThickness: 0.08,

                    bevelSize: 0.05,

                    bevelSegments: 2
                }
            );


            geometry.computeBoundingBox();


            /* ---------------------------------------------
               CENTER GEOMETRY
            --------------------------------------------- */

            const box = geometry.boundingBox;

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
               WIREFRAME
            ================================================= */

            const wireGeometry =
                new THREE.WireframeGeometry(
                    geometry
                );


            const material =
                new THREE.LineBasicMaterial({

                    color: 0x111111,

                    transparent: true,

                    opacity: 0.62
                });


            const wire =
                new THREE.LineSegments(
                    wireGeometry,
                    material
                );


            /* =================================================
               POSITION
            ================================================= */

            wire.position.set(
                x,
                y,
                0
            );


            wire.rotation.y =
                rotationY;


            wire.rotation.x =
                -0.08;


            wire.scale.setScalar(
                scale
            );


            /* =================================================
               STORE ORIGINAL POSITION
            ================================================= */

            wire.userData.baseX = x;
            wire.userData.baseY = y;

            wire.userData.baseRotationY =
                rotationY;


            wire.userData.offset =
                character === "U"
                    ? 0
                    : Math.PI;


            graphicGroup.add(
                wire
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
            function(event){

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

        function resize(){

            const width =
                container.clientWidth;

            const height =
                container.clientHeight;


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
           ANIMATION
        ===================================================== */

        const clock =
            new THREE.Clock();


        function animate(){

            requestAnimationFrame(
                animate
            );


            const time =
                clock.getElapsedTime();


            /* ---------------------------------------------
               SMOOTH MOUSE
            --------------------------------------------- */

            mouse.x +=
                (targetMouse.x - mouse.x)
                * 0.035;

            mouse.y +=
                (targetMouse.y - mouse.y)
                * 0.035;


            /* ---------------------------------------------
               EACH LETTER
            --------------------------------------------- */

            graphicGroup.children.forEach(
                function(object, index){

                    const offset =
                        object.userData.offset;


                    const floatX =
                        Math.sin(
                            time * 0.65 +
                            offset
                        ) * 0.12;


                    const floatY =
                        Math.cos(
                            time * 0.8 +
                            offset
                        ) * 0.12;


                    object.position.x =
                        object.userData.baseX +
                        floatX;


                    object.position.y =
                        object.userData.baseY +
                        floatY;


                    /* -------------------------------------
                       3D TILT
                    ------------------------------------- */

                    object.rotation.y =
                        object.userData.baseRotationY +
                        mouse.x * 0.16;


                    object.rotation.x =
                        -0.08 +
                        mouse.y * 0.08;

                }
            );


            /* ---------------------------------------------
               VERY SLOW GROUP MOTION
            --------------------------------------------- */

            graphicGroup.rotation.z =
                Math.sin(time * 0.25) *
                0.008;


            renderer.render(
                scene,
                camera
            );
        }


        animate();


    } catch(error) {

        console.error(
            "Hero Three.js 초기화 실패:",
            error
        );

    }

}


/* =========================================================
   START
========================================================= */

initHero3D();

});
