/// <reference path="../babylon.d.ts" />
/// <reference path="babylon.max.js" />




window.addEventListener('DOMContentLoaded', function () {
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // createScene function that creates and return the scene

    

        var createScene = function () {

            var scene = new BABYLON.Scene(engine);
            var ground = CreateGround();
            var unicamera = createUniCamera(scene);
            var tank = createTank();
            var followCamera = createFollowCamera(scene, tank);
            scene.activeCamera = followCamera;

            var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene)

            //var blender = new BABYLON.SceneLoader.ImportMesh("myTank", C: \Users\pukar\Documents\Game Assets Blender)

            return scene;


    }

    var scene = createScene();
    modifysettings();


        function CreateGround() {

            var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/heightMap1 - Copy (2).jpg", 3000, 3000, 20, 0, 80, scene, false, OnGroundCreated);
            function OnGroundCreated() {

                var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
                groundMaterial.diffuseTexture = new BABYLON.Texture("images/road.jpg", scene);
                ground.material = groundMaterial;
                ground.checkCollisions = true;

            }
            return ground;
        }

    function createUniCamera(scene) {

        var camera = new BABYLON.UniversalCamera("uniCam", new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas);
        camera.position.y = 50;

        camera.checkCollisions = true;
        camera.applyGravity = true;
        camera.keysUp.push('w'.charCodeAt(0)); // the attribute expect ASCII code of the letter, so i used javascript code to get ASCII Code
        camera.keysUp.push('W'.charCodeAt(0));
        camera.keysDown.push('s'.charCodeAt(0));
        camera.keysDown.push('S'.charCodeAt(0));
        camera.keysLeft.push('a'.charCodeAt(0));
        camera.keysLeft.push('A'.charCodeAt(0));
        camera.keysRight.push('d'.charCodeAt(0));
        camera.keysRight.push('D'.charCodeAt(0));


        return camera;

    }
    function createFollowCamera(scene, target) {

        var camera = new BABYLON.FollowCamera("myFollowCam", target.position, scene, target);
        camera.radius = 20; //how far from the object to follow
        camera.heightOffset = 4;  // how hight above the object to place the camera
        camera.rotationOffset = 180; // the viewing angle
        camera.cameraAcceleration = 0.5; // how fast to move
        camera.maxCameraSpeed = 50; //speed limit
        //camera.attachControl(canvas);
        //camera.position.y = 50;

        //camera.checkCollisions = true;
        //camera.applyGravity = true;
        //camera.keysUp.push('w'.charCodeAt(0)); // the attribute expect ASCII code of the letter, so i used javascript code to get ASCII Code
        //camera.keysUp.push('W'.charCodeAt(0));
        //camera.keysDown.push('s'.charCodeAt(0));
        //camera.keysDown.push('S'.charCodeAt(0));
        //camera.keysLeft.push('a'.charCodeAt(0));
        //camera.keysLeft.push('A'.charCodeAt(0));
        //camera.keysRight.push('d'.charCodeAt(0));
        //camera.keysRight.push('D'.charCodeAt(0));


        return camera;
    }



    function createTank(scene,tank)
    {

        var tank = new BABYLON.MeshBuilder.CreateBox("HeroTank", { height: 5, depth: 6, width: 6}, scene);
        var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
        tankMaterial.emissiveColor = new BABYLON.Color3.Green;

        tank.material = tankMaterial;

        tank.position.y += 0.6;

        return tank;
    }
    var tank = scene.getMeshByName("HeroTank");

    // run the render loop
    engine.runRenderLoop(function () {
        //tank.position.z += 5;
        tank.moveWithCollisions(new BABYLON.Vector3(0, 0, 5));
        scene.render();
    });


  

    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
        engine.resize();
    });

    function modifysettings() {

        scene.onPointerDown = function () {
            if (!scene.alreadyLocked) {
                console.log("Requesting");
                canvas.requestPointerLock();
            }
            else
            {
                console.log("Already locked");
                
            }
       


        }
        // this event listener will stop the overheads for multiple pointer lock event
        document.addEventListener("pointerlockchange", pointerLockListener());

        function pointerLockListener() {
            var element = document.pointerLockElement || null;

            if (element)
            {
                scene.alreadyLocked = true;
            }
            else
            {
                scene.alreadyLocked = false;

            }
        }
    } 
});
  