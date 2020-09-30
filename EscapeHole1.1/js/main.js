/// <reference path="../babylon.d.ts" />
/// <reference path="babylon.max.js" />

window.addEventListener('DOMContentLoaded', function () {

   
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // createScene function that creates and return the scene

    var isWpressed = false;
    var isSpressed = false;
    var isApressed = false;
    var isDpressed = false;
    

        var createScene = function () {

            var scene = new BABYLON.Scene(engine);
            var ground = CreateGround(scene);
            var unicamera = createUniCamera(scene);
            var tank = createTank();
            var followCamera = createFollowCamera(scene, tank);
            scene.activeCamera = followCamera;
         
            var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene)
            createHulkDude(scene);
         
           //var blender = new BABYLON.SceneLoader.ImportMesh("myTank", C: \Users\pukar\Documents\Game Assets Blender)

            return scene;



        }

    class Dude {

        constructor(dudeMesh, speed) {
            this.dudeMesh = dudeMesh
            dudeMesh.Dude = this;
            if (speed)
                this.speed = speed;
            else
                this.speed = 1;


        }
        move() {

            var tank = scene.getMeshByName("HeroTank");
            var direction = tank.position.subtract(this.dudeMesh.position);
            var distance = direction.length(); // this is the distance lenght between the direction of dude and tank

            var dir = direction.normalize();
            var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);// this is a tangent alpha for rotating the dude towards the face of the tank



            this.dudeMesh.rotation.y = alpha;

            //to prevent the tank colliding with the dude only allowed movement if distance is > 30.
            if (distance > 39) {

                this.dudeMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed)); // moves the dude on the normalized vector direction
            }


        }



    }

    var scene = createScene();
    modifysettings();
    // the change 
    


        function CreateGround(scene) {

            var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/hmap1.png", 2000, 2000, 20, 0, 500, scene, false, OnGroundCreated);
           
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
        camera.cameraAcceleration = 0.1; // how fast to move
        camera.maxCameraSpeed = 5; //speed limit
        camera.checkCollisions = true;


        return camera;
    }

    function resetKeyPresses() {
        isWpressed = false;
        isSpressed = false;
        isApressed = false;
        isDpressed = false;


    }

    function createTank(scene,tank)
    {

        var tank = new BABYLON.MeshBuilder.CreateBox("HeroTank", { height:1, depth: 6, width: 6}, scene);
        var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
        tankMaterial.emissiveColor = new BABYLON.Color3.Green;
        tankMaterial.diffuseColor = new BABYLON.Color3.Red;
        tank.position.y += 2;
        tank.material = tankMaterial;
        tank.speed = 1;
        tank.frontVector = new BABYLON.Vector3(0, 0, 1); // this is the initial front vector for tank 
        //front vector need to change everytime we change the rotation of tank
       
        tank.move = function () {

            var yMovement = 0;
           
            if (tank.position.y > 2)
            {
                
                yMovement = -2; // this prevents the tank to move upward when it hits the wall/ boundry
            }
            if (isWpressed) {
                
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
                //moves with collisions with changed front vector passed
            }
            if (isSpressed) {
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-1 * tank.speed, -1 * tank.speed, -1 * tank.speed)); 
            }
            if (isApressed) {
                
                tank.rotation.y -= .1;
                tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))
                
            }
            if (isDpressed) {
                tank.rotation.y += .1;
                tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))

            }
        }

        

        return tank; 
    }

    function createHulkDude(scene) {

        BABYLON.SceneLoader.ImportMesh("him", "Models/Dude/", "Dude.babylon", scene, onDudeImported);
        function onDudeImported(newMeshes, particleSystems, skeletons) {

            newMeshes[0].position = new BABYLON.Vector3(0, 0, 5);  // The original dude
            newMeshes[0].name = "HulkDude";

            var HulkDude = newMeshes[0];
            HulkDude.scaling = new BABYLON.Vector3(0.09, 0.09, 0.09);
            HulkDude.speed = 4; 
            scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);  //this line tells babylon to start animation

            var hulk = new Dude(HulkDude, 2);
            scene.dudes = [];
            for (var q = 0; q < 10; q++)
            {
                scene.dudes[q] = DoClone(HulkDude, skeletons, q);
                scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
                var temp = new Dude(scene.dudes[q], 2);
            }
           
        }
    }




    //Cloning for Models
    function DoClone(original, skeletons, id) {

        var myClone;
        var xrand = Math.floor(Math.random() * 501) - 250;
        var zrand = Math.floor(Math.random() * 501) - 250;

        // generating random number for random location of model

        myClone = original.clone("clone_" + id); // giving clone a name
        myClone.position = new BABYLON.Vector3(xrand, 0, zrand);

        if (!skeletons) {

            return myClone;
        }
        //if mesh has skeleton then get the origianl mesh and get children then cloning the 
                              // variable myClone with skeleton of original clone 
        else {

            if (!original.getChildren()) { // if a orginal mesh don't have children 

                myClone.skeleton = skeletons[0].clone("clone_" + id + "_skeleton");
                return myClone;
            }
            else { // if a orignal mesh has children
                if (skeletons.length == 1) // this means one skeleton controlling/animating all the children

                {
                    var clonedSkeleton = skeletons[0].clone("clone_" + id + "_skeleton");
                    myClone.skeleton = clonedSkeleton; 
                    var numChildren = myClone.getChildren().length;
                    for (var i = 0; i < numChildren; i++) {

                        myClone.getChildren()[i].skeleton = clonedSkeleton;
                    }
                    return myClone;

                }
                else if (skeletons.length == original.getChildren().length)
                { 
                    for (var i = 0; i < myClone.getChildren().length; i++)
                    {
                        myClone.getChildren()[i].skeleton = skeletons[i].clone("clone_" + id + "_skeleton_" + i);
                    }
                    return myClone;
                }
            }
        }

        return myClone;
    }
 
    // run the render loop
    engine.runRenderLoop(function () {

        var tank = scene.getMeshByName("HeroTank");
        tank.move();
        var HulkDude = scene.getMeshByName("HulkDude"); 
        if (HulkDude) // to prevent null reference error we are allowing the model to move if not null
            HulkDude.Dude.move();
        if (scene.dudes) {
            for (var q = 0; q < scene.dudes.length; q++) {
                scene.dudes[q].Dude.move();
            }
        }

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

        document.addEventListener("keydown", function (event) {
            if (event.key == 'w' || event.key == 'W') {
                isWpressed = true;
            }
            if (event.key == 's' || event.key == 'S') {

                isSpressed = true;
            }
            if (event.key == 'a' || event.key == 'A') {

                isApressed = true;
            }
            if (event.key == 'd' || event.key == 'D') {

                isDpressed = true;
            }
        });
        document.addEventListener("keyup", function (event) {
            if (event.key == 'w' || event.key == 'W') {

                isWpressed = false;
            }
            if (event.key == 's' || event.key == 'S') {

                isSpressed = false;
            }
            if (event.key == 'a' || event.key == 'A') {

                isApressed = false;
            }
            if (event.key == 'd' || event.key == 'D') {

                isDpressed = false;
            }
        });

    } 
});
  