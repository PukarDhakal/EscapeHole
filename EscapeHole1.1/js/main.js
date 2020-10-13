/// <reference path="../babylon.d.ts" />
/// <reference path="babylon.max.js" />
/// <reference path = "cannon.js"/>

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
    var isKpressed = false;
    var isLpressed = false;

    var createScene = function () {


        var scene = new BABYLON.Scene(engine);

        scene.enablePhysics();
        var ground = CreateGround(scene);
        var unicamera = createUniCamera(scene);
        var tank = createTank();
        var followCamera = createFollowCamera(scene, tank);
        scene.activeCamera = followCamera;
        createLights(scene);


        createHulkDude(scene);

        //var blender = new BABYLON.SceneLoader.ImportMesh("myTank", C: \Users\pukar\Documents\Game Assets Blender)

        //appending the 2d text on 3D world

        //// HTMl Div to compare
        //var newDiv = document.createElement("div");
        //var newContent = document.createTextNode("Kill 10 enemies to get speed booster!");
        //newDiv.appendChild(newContent);

        //newDiv.style.position = 'absolute';
        //newDiv.style.right = '15%';
        //newDiv.style.top = '60%';
        //newDiv.style.background = 'white';
        //newDiv.style.fontSize = '20px';
        //document.body.appendChild(newDiv);  

        return scene;



    }

    function createLights(scene) {
        var light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-.1, -1, 0), scene);
        var light1 = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-1, -1, 0), scene);
    }

    class Dude {

        constructor(dudeMesh, speed, id, scene, scaling) {
            this.dudeMesh = dudeMesh
            this.id = id;
            this.health = 3; // 3 shots to kill dude
            this.scene = scene;
            dudeMesh.Dude = this;
            if (speed)
                this.speed = speed;
            else
                this.speed = 1;

            if (scaling) {
                this.scaling = scaling;
                this.dudeMesh.scaling = new BABYLON.Vector3(this.scaling, this.scaling, this.scaling)
            }

            else
                this.scaling = 1;

            if (Dude.boundingBoxParameters == undefined) {

                Dude.boundingBoxParameters = this.CalculateBoundingBoxParameters();

            }


            if (Dude.particleSystem == undefined) {

                Dude.particleSystem = this.createDudeParticleSystem();


            }


            this.bounder = this.createBoundingBox();
            this.bounder.dudeMesh = this.dudeMesh; // circular referencing the bounder and dudemesh
        }
        move() {
            if (!this.bounder) return;


            this.dudeMesh.position = new BABYLON.Vector3(this.bounder.position.x, this.bounder.position.y - this.scaling * Dude.boundingBoxParameters.lengthY / 2, this.bounder.position.z)

            var tank = scene.getMeshByName("HeroTank");
            var direction = tank.position.subtract(this.dudeMesh.position);
            var distance = direction.length(); // this is the distance lenght between the direction of dude and tank

            var dir = direction.normalize();
            var alpha = Math.atan2(-1 * dir.x, -1 * dir.z);// this is a tangent alpha for rotating the dude towards the face of the tank



            this.dudeMesh.rotation.y = alpha;

            //to prevent the tank colliding with the dude only allowed movement if distance is > 30.
            if (distance > 39) {

                this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed)); // moves the dude on the normalized vector direction
            }


        }
        createBoundingBox() {
            var lengthX = Dude.boundingBoxParameters.lengthX;
            var lengthY = Dude.boundingBoxParameters.lengthY;
            var lengthZ = Dude.boundingBoxParameters.lengthZ;

            var bounder = new BABYLON.Mesh.CreateBox("bounder" + (this.id).toString(), 1, this.scene);

            bounder.scaling.x = lengthX * this.scaling; //adjusting the bounding box scaling according to the scaling of the model
            bounder.scaling.y = lengthY * this.scaling; //adjusting the bounding box scaling according to the scaling of the model
            bounder.scaling.z = lengthZ * this.scaling; //adjusting the bounding box scaling according to the scaling of the model

            bounder.isVisible = false;
            var bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial", this.scene);
            bounderMaterial.alpha = .5;
            bounder.material = bounderMaterial;
            bounder.checkCollisions = true; // applying collison effect with other bounder box

            //   console.log(this.dudeMesh.position.y);

            bounder.position = new BABYLON.Vector3(this.dudeMesh.position.x, this.dudeMesh.position.y + this.scaling * lengthY / 2, this.dudeMesh.position.z);

            return bounder;
        }

        CalculateBoundingBoxParameters() {
            // assiging maximum and minumum values
            var minX = 9999999; var minY = 999999; var minZ = 999999;
            var maxX = -999999; var maxY = -999999; var maxZ = -999999;


            var children = this.dudeMesh.getChildren(); // getting all the children(array) meshes from our original mesh

            //looping through all the vertices of the children meshes
            for (var i = 0; i < children.length; i++) {

                //getting position array for each children
                var positions = new BABYLON.VertexData.ExtractFromGeometry(children[i]).positions;
                if (!positions) continue;

                // getting the minimum and maximum value for the X component
                var index = 0;

                for (var j = index; j < positions.length; j += 3) {
                    if (positions[j] < minX)
                        minX = positions[j];
                    if (positions[j] > maxX)
                        maxX = positions[j];
                }
                index = 1;  // getting the minimum and maximum value for the Y component

                for (var j = index; j < positions.length; j += 3) {
                    if (positions[j] < minY)
                        minY = positions[j];
                    if (positions[j] > maxY)
                        maxY = positions[j];
                }
                index = 2;  // getting the minimum and maximum value for the Z component

                for (var j = index; j < positions.length; j += 3) {
                    if (positions[j] < minZ)
                        minZ = positions[j];
                    if (positions[j] > maxZ)
                        maxZ = positions[j];
                }

                var _lengthX = maxX - minX;
                var _lengthY = maxY - minY;
                var _lengthZ = maxZ - minZ;




            }
            return { lengthX: _lengthX, lengthY: _lengthY, lengthZ: _lengthZ }
        }


        createDudeParticleSystem() {

            // Create a particle system
            var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

            //Texture of each particle
            particleSystem.particleTexture = new BABYLON.Texture("images/flare.png", scene);

            // Where the particles come from
            particleSystem.emitter = new BABYLON.Vector3(0,0,0); // the starting object, the emitter
    
            // Colors of all particles
            particleSystem.color1 = new BABYLON.Color4(1.0, 0, 0, 1.0);
            particleSystem.color2 = new BABYLON.Color4(1, 0.0, 0.0, 1.0);
            particleSystem.colorDead = new BABYLON.Color4(0, 0, 0 ,0.0);


            // Emission rate
            particleSystem.emitRate = 100;

          
            // Set the gravity of all particles
            particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

            // Direction of each particle after it has been emitted
            particleSystem.direction1 = new BABYLON.Vector3(0, -1, 0);
            particleSystem.direction2 = new BABYLON.Vector3(0, -1, 0);

           
            // Start the particle system
            return particleSystem;


        }
        decreaseHealth(hitPoint) {
            Dude.particleSystem.emitter = hitPoint;
            this.health--;

            Dude.particleSystem.start();
            setTimeout(function () {
                Dude.particleSystem.stop();
            }, 300);

            if (this.health <= 0) {
                this.gotKilled();
            }
        }
        gotKilled() {
            this.dudeMesh.dispose();
            this.bounder.dispose();

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
            ground.physicsImposter = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 }, scene); //mass 0 for 




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

    function createTank(scene, tank) {

        var tank = new BABYLON.MeshBuilder.CreateBox("HeroTank", { height: 1, depth: 6, width: 6 }, scene);
        /* BABYLON.SceneLoader.ImportMesh("buggy", "scenes/Buggy", "Buggy.gltf", scene);*/
        var tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
        tankMaterial.emissiveColor = new BABYLON.Color3.Green;
        tankMaterial.diffuseColor = new BABYLON.Color3.Red;
        tank.position.y += 0.5;
        tank.material = tankMaterial;
        tank.speed = 0.5;
        //tank.isPickable = false;
        tank.frontVector = new BABYLON.Vector3(0, 0, 1); // this is the initial front vector for tank 
        //front vector need to change everytime we change the rotation of tank

        tank.move = function () {

            var yMovement = 0;

            if (tank.position.y > 2) {

                yMovement = -2; // this prevents the tank to move upward when it hits the wall/ boundry
            }
            if (isWpressed) {

                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
                //moves with collisions with changed front vector passed
            }
            if (isSpressed) {
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-0.8 * tank.speed, -0.8 * tank.speed, -0.8 * tank.speed));
            }
            if (isApressed) {

                tank.rotation.y -= 0.05;
                tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))

            }
            if (isDpressed) {
                tank.rotation.y += 0.05;
                tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y))

            }
        }


        tank.canFireCannonBalls = true;
        tank.canFireLaserBeams = true;

        tank.fireCannonBalls = function (scene) {
            var tank = this;
           

            if (!isKpressed) return;
            if (!tank.canFireCannonBalls) return;
            tank.canFireCannonBalls = false;

            setTimeout(function () {
                tank.canFireCannonBalls = true;

            }, 300); // this will prevent multiple cannon balls be thrown at one time.

            var cannonBall = new BABYLON.Mesh.CreateSphere("cannonBall", 32, 2, scene);
            cannonBall.material = new BABYLON.StandardMaterial("fireBall", scene);
            cannonBall.material.diffuseTexture = new BABYLON.Texture("images/flame.png", scene);

            var pos = tank.position;

            cannonBall.position = new BABYLON.Vector3(pos.x, pos.y + 1, pos.z);
            cannonBall.position.addInPlace(tank.frontVector.multiplyByFloats(5, 5, 5));

            cannonBall.PhysicsImpostor = new BABYLON.PhysicsImpostor(cannonBall, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 }, scene);
            var fVector = tank.frontVector;
            var force = new BABYLON.Vector3(fVector.x * 100, (fVector.y + .1) * 100, fVector.z * 100);  // applying the force in the desired direction
            cannonBall.PhysicsImpostor.applyImpulse(force, cannonBall.getAbsolutePosition());  // getting absolute position of cannon ball applying impulse

      

                cannonBall.actionManager = new BABYLON.ActionManager(scene);

                scene.dudes.forEach(function (dude) {
                    cannonBall.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                        {
                            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                            parameter: dude.Dude.bounder
                        },
                        function () {
                            console.log("HIT!");
                         

                        }
                    ));

                });
            


            setTimeout(function () {
                cannonBall.dispose();
            }, 4000) // disposing the ball after 4 second
        }

        //fire laser beams

        tank.fireLaserBeams = function(scene)
        {
            var tank = this;


            if (!isLpressed) return;
            if (!tank.canFireLaserBeams) return;
            tank.canFireLaserBeams = false;

            setTimeout(function () {
                tank.canFireLaserBeams = true;

            }, 300); // this will prevent multiple laser beams be thrown at one time.

            var origin = tank.position;
            var direction = new BABYLON.Vector3(tank.frontVector.x, tank.frontVector.y + .1, tank.frontVector.z);
            var ray = new BABYLON.Ray(origin, direction, 1000);

            var rayHelper = new BABYLON.RayHelper(ray);
            rayHelper.show(scene, new BABYLON.Color3.Red);



            setTimeout(function () {
                rayHelper.hide(ray);
            }, 200); // this will prevent multiple rays be thrown at one time.


            //checking intersection between rays and other object/mesh

            var pickInfos = scene.pickWithRay(ray, function (mesh) {

                if (mesh.name == "HeroTank") return false; // for checking not to check information about tank mesh 
                return true;
            });



            for (var i = 0; i < pickInfos.length; i++) {
                var pickInfo = pickInfos[i];

                if (pickInfo.pickedMesh) {
                    if (pickInfo.pickedMesh.name.startsWith("bounder")) { /* this condition will dispose the dude model
                                                                     *  if the ray hit the model with name starting with bounder. */

                        pickInfo.pickedMesh.dudeMesh.Dude.decreaseHealth(pickInfo.pickedPoint);
                    }
                    else if (pickInfo.pickedMesh.name.startsWith("clone")) { /* this condition will dispose the dude model
                                                                     *  if the ray hit the child mesh with name starting with clone. */


                        pickInfo.pickedMesh.parent.Dude.decreaseHealth(pickInfo.pickedPoint);


                    }

                }

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

            for (var i = 1; i < HulkDude.getChildren().length; i++) {
                console.log(HulkDude.getChildren()[i].name);
                HulkDude.getChildren()[i].name = "clone_".concat(HulkDude.getChildren()[i].name);
                console.log(HulkDude.getChildren()[i].name);
            }

            HulkDude.speed = 4;
            scene.beginAnimation(skeletons[0], 0, 120, true, 1.0);  //this line tells babylon to start animation

            var hulk = new Dude(HulkDude, 2, -1, scene, 0.09);
            scene.dudes = [];
            scene.dudes[0] = HulkDude;
            for (var q = 1; q <= 10; q++) {
                scene.dudes[q] = DoClone(HulkDude, skeletons, q);
                scene.beginAnimation(scene.dudes[q].skeleton, 0, 120, true, 1.0);
                var temp = new Dude(scene.dudes[q], 2, q, scene, 0.09);
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
                else if (skeletons.length == original.getChildren().length) {
                    for (var i = 0; i < myClone.getChildren().length; i++) {
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
        tank.fireCannonBalls(scene);
        tank.fireLaserBeams(scene);
        moveHulkDude();
        moveOtherDude();




        scene.render();
    });

    function moveHulkDude() {
        var HulkDude = scene.getMeshByName("HulkDude");
        if (HulkDude) // to prevent null reference error we are allowing the model to move if not null
            HulkDude.Dude.move();

    }

    // this will move other dudes  (move other clones)
    function moveOtherDude() {
        if (scene.dudes) {
            for (var q = 0; q < scene.dudes.length; q++) {
                scene.dudes[q].Dude.move();
            }
        }

    }




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
            else {
                console.log("Already locked");

            }



        }
        // this event listener will stop the overheads for multiple pointer lock event
        document.addEventListener("pointerlockchange", pointerLockListener());

        function pointerLockListener() {
            var element = document.pointerLockElement || null;

            if (element) {
                scene.alreadyLocked = true;
            }
            else {
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
            if (event.key == 'k' || event.key == 'K') {

                isKpressed = true;
            }
            if (event.key == 'l' || event.key == 'L') {

                isLpressed = true;
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
            if (event.key == 'k' || event.key == 'K') {

                isKpressed = false;
            }
            if (event.key == 'l' || event.key == 'L') {

                isLpressed = false;
            }
        });

    }
});
