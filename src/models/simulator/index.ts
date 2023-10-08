import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { addObstacle } from "../obstacle/addObstacle";
import { Obstacle } from "../obstacle";
import { BoidManager } from "../boid/manager";
import { UserControls } from "../userControls";
import * as THREE from "three";
import { SimulationObject } from "../types";

export class Simulator {
  private static instance: Simulator;

  public readonly scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  private dragControls: DragControls;
  public userCamera: THREE.PerspectiveCamera;
  public readonly clock: THREE.Clock;
  private isPaused: boolean;

  controls: UserControls
  private objects: Obstacle[];
  private simObjects: SimulationObject[]

  private constructor(scene: THREE.Scene) {
    this.clock = new THREE.Clock();
    this.isPaused = false
    this.objects = [];
    this.simObjects = []
    this.scene = scene;
  }

  public static getInstance(scene: THREE.Scene): Simulator {
    if (!Simulator.instance) {
      Simulator.instance = new Simulator(scene);
    }

    return Simulator.instance;
  }

  public addObject() {
    const newObs = addObstacle(
      this.objects,
      this.scene,
      100,
      100,
      100,
      0x555555,
      0,
      0,
      0
    );

    this.dragControls?.getObjects().push(newObs.mesh);
  }

  private initControls(){
    this.controls = UserControls.getInstance(this)
    //this.scene.add(this.controls.transformControls)
  }

  private initRenderer(canvasRef: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef,
    });

    window.addEventListener("resize", () => {
      console.log(canvasRef.width)
      const width = canvasRef.width
      const height = canvasRef.height;
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height);
      this.userCamera.aspect = width / height;
      this.userCamera.updateProjectionMatrix();
    });
  }


  public mount(canvasRef: HTMLCanvasElement): void {
    console.log("Mounting Simulator...");
    this.initRenderer(canvasRef);

    const SANDBOX_WIDTH = 200;

    this.userCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    this.userCamera.position.z = 500;

    this.initControls()

    

    const boidManager = new BoidManager({
      obstacles: this.objects,
      boidTerritoryRadius: SANDBOX_WIDTH / 2,
    });
    


    // const newObs = addObstacle(
    //   this.objects,
    //   this.scene,
    //   100,
    //   100,
    //   100,
    //   0x555555,
    //   0,
    //   0,
    //   0
    // );
    
   // this.controls.transformControls.attach(newObs.mesh);
   
   

    //ambient light
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const boids = boidManager.createBoids({
      count: 1,
      color: 0xf65ff,
      followTarget: false,
    });

    boids.forEach((b) => this.scene.add(b.mesh));

    this.simObjects.push(boidManager)
    this.simObjects.push(this.controls)

    this.runUpdateLoop()
  }

  private runUpdateLoop() {
    requestAnimationFrame(this.runUpdateLoop.bind(this));

    if (this.isPaused === false) {
      this.simObjects.forEach((bm) => bm.update(this));

    }
    
    this.renderer.render(this.scene, this.userCamera);
  }
}
// transformControls.addEventListener("change", this.runUpdateLoop);
