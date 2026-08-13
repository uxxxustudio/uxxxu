/* =========================================================
   HERO 3D
   U / X — clean 3D outline
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

        camera.position.set(0, 0, 15);


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
           MAIN GROUP
        ===================================================== */

        const group = new THREE.Group();

        scene.add(group);


        /* =====================================================
           MATERIAL
        ===================================================== */

        const lineMaterial =
            new THREE.LineBasicMaterial({
                color: 0x171717,
                transparent: true,
                opacity: 0.62
            });


        const faceMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.055,
                side: THREE.DoubleSide,
                depthWrite: false
            });


        /* =====================================================
           FONT
        ===================================================== */

        const loader =
            new FontLoader();


        loader.load(

            "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/fonts/helvetiker_bold.typeface.json",

            function(font) {

                createLetter(
                    "U",
                    font,
                    -2.8,
                    -0.35,
                    -0.34,
                    0.82
                );


                createLetter(
                    "X",
                    font,
                    2.05,
                    0.65,
                    0.30,
                    0.78
                );

            },

            undefined,

            function(error) {

                console.error(
                    "Hero font loading failed:",
                    error
                );

            }

        );


        /* =====================================================
           CREATE LETTER
        ===================================================== */

        function createLetter(
            character,
            font,
            x,
            y,
            rotationY,
            scale
        ) {

            const size = 4.5;

            const shapes =
                font.generateShapes(
                    character,
                    size
                );


            if (!shapes || !shapes.length) {
                return;
            }


            /* =================================================
               BOUNDING BOX
            ================================================= */

            let minX = Infinity;
            let maxX = -Infinity;
            let minY = Infinity;
            let maxY = -Infinity;


            shapes.forEach(
                function(shape) {

                    const points =
                        shape.getPoints(80);

                    points.forEach(
                        function(point) {

                            minX =
                                Math.min(
                                    minX,
                                    point.x
                                );

                            maxX =
                                Math.max(
                                    maxX,
                                    point.x
                                );

                            minY =
                                Math.min(
                                    minY,
                                    point.y
                                );

                            maxY =
                                Math.max(
                                    maxY,
                                    point.y
                                );

                        }
                    );

                }
            );


            const centerX =
                (minX + maxX) / 2;

            const centerY =
                (minY + maxY) / 2;


            /* =================================================
               LETTER GROUP
            ================================================= */

            const letter =
                new THREE.Group();


            letter.position.set(
                x,
                y,
                0
            );


            letter.rotation.y =
                rotationY;

            letter.rotation.x =
                -0.035;


            letter.scale.setScalar(
                scale
            );


            /* =================================================
               DEPTH
               
               얇은 3D 깊이
            ================================================= */

            const depth = 0.58;


            /* =================================================
               FACE
               
               실제 면은 아주 약하게만 보이게
               선을 방해하지 않도록 처리
            ================================================= */

            const extrudeSettings = {

                depth: depth,

                bevelEnabled: false,

                curveSegments: 24

            };


            const faceGeometry =
                new THREE.ExtrudeGeometry(
                    shapes,
                    extrudeSettings
                );


            faceGeometry.translate(
                -centerX,
                -centerY,
                -depth / 2
            );


            const face =
                new THREE.Mesh(
                    faceGeometry,
                    faceMaterial
                );


            letter.add(face);


            /* =================================================
               OUTLINE
               
               앞면 + 뒷면의 실제 Shape 외곽선만 사용
               
               ❌ Wireframe
               ❌ 삼각형
               ❌ 내부 대각선
            ================================================= */

            shapes.forEach(
                function(shape) {

                    drawContour(
                        shape,
                        depth,
                        centerX,
                        centerY,
                        letter
                    );


                    /* -----------------------------------------
                       HOLE
                       
                       U의 안쪽 곡선도 외곽선으로 처리
                    ----------------------------------------- */

                    if (
                        shape.holes &&
                        shape.holes.length
                    ) {

                        shape.holes.forEach(
                            function(hole) {

                                drawContour(
                                    hole,
                                    depth,
                                    centerX,
                                    centerY,
                                    letter
                                );

                            }
                        );

                    }

                }
            );


            group.add(letter);


            letter.userData.baseX =
                x;

            letter.userData.baseY =
                y;

            letter.userData.baseRotationY =
                rotationY;

            letter.userData.phase =
                character === "U"
                    ? 0
                    : Math.PI * 0.65;

        }


        /* =====================================================
           DRAW CONTOUR
        ===================================================== */

        function drawContour(
            contour,
            depth,
            centerX,
            centerY,
            parent
        ) {

            let points =
                contour.getPoints(72);


            /* -----------------------------------------------
               마지막 중복점 제거
            ----------------------------------------------- */

            if (
                points.length > 1 &&
                points[0].distanceTo(
                    points[points.length - 1]
                ) < 0.001
            ) {

                points.pop();

            }


            if (points.length < 3) {
                return;
            }


            const frontPoints = [];

            const backPoints = [];


            /* =================================================
               FRONT / BACK
            ================================================= */

            points.forEach(
                function(point) {

                    frontPoints.push(
                        new THREE.Vector3(
                            point.x - centerX,
                            point.y - centerY,
                            depth / 2
                        )
                    );


                    backPoints.push(
                        new THREE.Vector3(
                            point.x - centerX,
                            point.y - centerY,
                            -depth / 2
                        )
                    );

                }
            );


            /* =================================================
               FRONT OUTLINE
            ================================================= */

            const frontGeometry =
                new THREE.BufferGeometry()
                    .setFromPoints(
                        frontPoints
                    );


            const frontLine =
                new THREE.LineLoop(
                    frontGeometry,
                    lineMaterial
                );


            parent.add(
                frontLine
            );


            /* =================================================
               BACK OUTLINE
            ================================================= */

            const backGeometry =
                new THREE.BufferGeometry()
                    .setFromPoints(
                        backPoints
                    );


            const backLine =
                new THREE.LineLoop(
                    backGeometry,
                    lineMaterial
                );


            parent.add(
                backLine
            );


            /* =================================================
               SIDE DEPTH
               
               전체 면을 선으로 채우지 않고
               깊이를 보여주는 연결선만 선택
            ================================================= */

            const sidePoints = [];


            /*
             * U/X의 외곽에서 일정 간격으로
             * 중요한 지점만 연결.
             *
             * 이렇게 해야 곡선 전체가
             * 빗살처럼 보이지 않는다.
             */

            const step =
                Math.max(
                    1,
                    Math.floor(
                        points.length / 12
                    )
                );


            for (
                let i = 0;
                i < points.length;
                i += step
            ) {

                sidePoints.push(
                    frontPoints[i],
                    backPoints[i]
                );

            }


            const sideGeometry =
                new THREE.BufferGeometry()
                    .setFromPoints(
                        sidePoints
                    );


            const sideLines =
                new THREE.LineSegments(
                    sideGeometry,
                    lineMaterial
                );


            parent.add(
                sideLines
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


            if (
                width <= 0 ||
                height <= 0
            ) {
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
           FLOAT
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
                function(letter) {

                    const phase =
                        letter.userData.phase;


                    letter.position.x =
                        letter.userData.baseX +
                        Math.sin(
                            time * 0.55 +
                            phase
                        ) * 0.13;


                    letter.position.y =
                        letter.userData.baseY +
                        Math.cos(
                            time * 0.68 +
                            phase
                        ) * 0.13;


                    /*
                     * 기본 측면 각도는 유지하고
                     * 마우스에 따라 아주 조금만 움직임
                     */

                    letter.rotation.y =
                        letter.userData.baseRotationY +
                        mouse.x * 0.075;


                    letter.rotation.x =
                        -0.035 +
                        mouse.y * 0.035;

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

    }


    catch (error) {

        console.error(
            "Hero 3D initialization failed:",
            error
        );

    }

}
