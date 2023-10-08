import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { addObstacle } from "../obstacle/addObstacle";
import { Obstacle } from "../obstacle";
import { BoidManager } from "../boid/manager";
import * as THREE from "three";

export class Simulator {
  private static instance: Simulator;

  private readonly scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  private constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public static getInstance(
    scene: THREE.Scene,
  ): Simulator {
    if (!Simulator.instance) {
      Simulator.instance = new Simulator(scene);
    }

    return Simulator.instance;
  }

  public mount(canvasRef: HTMLCanvasElement): void {
    console.log('Mounting Simulator...')
    const SANDBOX_WIDTH = 200;

    let camera: THREE.PerspectiveCamera;
    let clock: THREE.Clock;
    let light: THREE.PointLight;
    let boidManager: BoidManager;
    let lure: THREE.PointLight;
    let controls: OrbitControls;

    const obstacles: Obstacle[] = [];

    const init = () => {
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
      );
      camera.position.z = 500;

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvasRef
      })

      this.renderer.setSize(window.innerWidth, window.innerHeight);

      // CONTROLS
      controls = new OrbitControls(camera, this.renderer.domElement);
      controls.minDistance = 100;
      controls.maxDistance = 1000;

      // WORLD OBSTACLES

      addObstacle(obstacles, this.scene, 50, 100, 50, 0xffffff, 100, 100, -200);
      addObstacle(obstacles, this.scene, 50, 50, 50, 0xffffff, 200, 200, 200);
      addObstacle(obstacles, this.scene, 100, 50, 50, 0xffffff, -200, 150, 200);
      addObstacle(obstacles, this.scene, 50, 50, 50, 0xffffff, -150, 150, -200);
      addObstacle(obstacles, this.scene, 50, 100, 100, 0xa399ee, -20, 300, -20);
      addObstacle(obstacles, this.scene, 50, 50, 50, 0x555555, 150, -200, 200);
      addObstacle(
        obstacles,
        this.scene,
        50,
        100,
        100,
        0x555555,
        80,
        -100,
        -180
      );
      addObstacle(
        obstacles,
        this.scene,
        100,
        50,
        100,
        0x555555,
        -220,
        -150,
        180
      );
      addObstacle(
        obstacles,
        this.scene,
        100,
        50,
        50,
        0x555555,
        -150,
        -150,
        -150
      );
      addObstacle(obstacles, this.scene, 100, 50, 100, 0x555555, 20, -300, -20);

      // LIGHTS

      //ambient light
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));

      light = new THREE.PointLight(0xffffff, 0.5, 1000);
      light.position.set(0, 100, 0);
      this.scene.add(light);

      // TARGET

      // lure = null;
      lure = new THREE.PointLight(0xffffff, 10, 1000);
      lure.position.set(0, 50, 0);
      this.scene.add(lure);
      const lightHelper = new THREE.PointLightHelper(lure);
      this.scene.add(lightHelper);

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

      boids.forEach((b) => this.scene.add(b.mesh));

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
        this.renderer.domElement
      );
      dragControls.activate();
      dragControls.addEventListener("dragstart", function () {
        controls.enabled = false;
      });
      dragControls.addEventListener("dragend", function () {
        controls.enabled = true;
      });

      // CLOCK
      clock = new THREE.Clock();

      const axesHelper = new THREE.AxesHelper(50);
      this.scene.add(axesHelper);

      // COMPOSER + PASSES
      // composer = new EffectComposer(renderer)

      // var renderPass = new RenderPass(scene, camera)
      // composer.addPass(renderPass)
      // renderPass.renderToScreen = true;

      // var pass1 = new GlitchPass(64)
      // // pass1.goWild = true
      // composer.addPass(pass1)
      // pass1.renderToScreen = true
    };

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

    const render = () => {
      const delta = clock.getDelta();
      if (!paused) {
        update(delta);
      }

      this.renderer.render(this.scene, camera);
      //composer.render()
    };

    function animate() {
      requestAnimationFrame(animate);
      // only required if controls.enableDamping = true, or if controls.autoRotate = true
      //controls.update();

      render();
    }

    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height);
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
  }
}