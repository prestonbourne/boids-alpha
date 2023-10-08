/**
 * 1 unit = 1 cm
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { BoidManager } from "./models/boid/manager";
import { addObstacle } from "./models/obstacle/addObstacle";
import { Obstacle } from "./models/obstacle/obstacle";

const SANDBOX_WIDTH = 200;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let clock: THREE.Clock;
let light: THREE.PointLight;
let boidManager: BoidManager;
let lure: THREE.PointLight;
let controls: OrbitControls;

const obstacles: Obstacle[] = [];

function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.z = 500;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // CONTROLS
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 100;
  controls.maxDistance = 1000;

  // const gui = new GUI();
  // gui.add(
  //   {
  //     addObstacle: addObstacle.bind(null, obstacles, scene, 100, 100, 100, 100),
  //   },
  //   "addObstacle"
  // );

  // WORLD OBSTACLES
  let hasObstacles = true;
  if (hasObstacles) {
    addObstacle(obstacles, scene, 50, 100, 50, 0xffffff, 100, 100, -200);
    addObstacle(obstacles, scene, 50, 50, 50, 0xffffff, 200, 200, 200);
    addObstacle(obstacles, scene, 100, 50, 50, 0xffffff, -200, 150, 200);
    addObstacle(obstacles, scene, 50, 50, 50, 0xffffff, -150, 150, -200);
    addObstacle(obstacles, scene, 50, 100, 100, 0xa399ee, -20, 300, -20);
    addObstacle(obstacles, scene, 50, 50, 50, 0x555555, 150, -200, 200);
    addObstacle(obstacles, scene, 50, 100, 100, 0x555555, 80, -100, -180);
    addObstacle(obstacles, scene, 100, 50, 100, 0x555555, -220, -150, 180);
    addObstacle(obstacles, scene, 100, 50, 50, 0x555555, -150, -150, -150);
    addObstacle(obstacles, scene, 100, 50, 100, 0x555555, 20, -300, -20);
  }

  // LIGHTS

  //ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  light = new THREE.PointLight(0xffffff, 0.5, 1000);
  light.position.set(0, 100, 0);
  scene.add(light);

  // TARGET

  // lure = null;
  lure = new THREE.PointLight(0xffffff, 10, 1000);
  lure.position.set(0, 50, 0);
  scene.add(lure);
  const lightHelper = new THREE.PointLightHelper(lure);
  scene.add(lightHelper);

  // BOIDS

  boidManager = new BoidManager({
    obstacles,
    boidTerritoryRadius: SANDBOX_WIDTH / 2,
   
  });

  const boids = boidManager.createBoids({
    count: 10,
    color: 0xf65ff,
    followTarget: false,
  });

  boids.forEach((b) => scene.add(b.mesh));

  // const gui = new GUI();
  // const boidsUIFolder = gui.addFolder("Boids");

  /**
   * draggable cube that boids can follow
   */

  // const geometry = new THREE.BoxGeometry(30, 30, 30);
  // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  const dragControls = new DragControls(
    obstacles.map((o) => o.mesh),
    camera,
    renderer.domElement
  );
  dragControls.activate();
  dragControls.addEventListener("dragstart", function (event) {
    controls.enabled = false;
  });
  dragControls.addEventListener("dragend", function (event) {
    controls.enabled = true;
  });

  // CLOCK
  clock = new THREE.Clock();

  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);

  // COMPOSER + PASSES
  // composer = new EffectComposer(renderer)

  // var renderPass = new RenderPass(scene, camera)
  // composer.addPass(renderPass)
  // renderPass.renderToScreen = true;

  // var pass1 = new GlitchPass(64)
  // // pass1.goWild = true
  // composer.addPass(pass1)
  // pass1.renderToScreen = true
}

//UI

// loop vars
let counter = 0;
let paused = false;
let slowPanEnabled = false;

function update(delta: number) {
  counter += 0.001;

  boidManager.update(delta);

  if (slowPanEnabled) {
    camera.lookAt(light.position);
    camera.position.x = Math.sin(counter) * 500;
    camera.position.z = Math.cos(counter) * 500;
  }

  if (lure) {
    lure.position.x = Math.sin(counter * 5) * 400;
    lure.position.y = Math.cos(counter * 10) * 400;
    lure.position.z = Math.cos(counter * 15) * 400;
  }
}

function render() {
  const delta = clock.getDelta();
  if (!paused) {
    update(delta);
  }

  renderer.render(scene, camera);
  //composer.render()
}

var animate = function () {
  requestAnimationFrame(animate);

  // only required if controls.enableDamping = true, or if controls.autoRotate = true
  //controls.update();

  render();
};

window.addEventListener("resize", function () {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event: KeyboardEvent) {
  const keyCode = event.which;
  if (keyCode == 32) {
    paused = !paused;

    // disable slow-pan so when animation is resumed, the viewer has the controls.
    if (slowPanEnabled) {
      slowPanEnabled = false;
    }
  }
}

init();

animate();
