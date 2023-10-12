import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Simulator } from "../simulator";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { ObjectHighlighter } from "./objectHighlighter";
import { SimulationObject } from "../types";
import * as THREE from "three";

export class UserControls implements SimulationObject {
  private static instance: UserControls;

  public readonly transformControls: TransformControls;
  public readonly orbitControls: OrbitControls;
  public readonly dragControls: DragControls;
  private readonly cursorLocation: THREE.Vector2 = new THREE.Vector2();
  private readonly highlighter: ObjectHighlighter = new ObjectHighlighter();
  private selectedObjects: THREE.Object3D[] = [];
  private hoveredObject: THREE.Object3D | null = null;

  private constructor({ userCamera, renderer }: Simulator) {
    this.orbitControls = new OrbitControls(userCamera, renderer.domElement);
    this.orbitControls.minDistance = 100;
    this.orbitControls.maxDistance = 1000;

    this.transformControls = new TransformControls(
      userCamera,
      renderer.domElement
    );

    this.transformControls.addEventListener("dragging-changed", (e) => {
      this.orbitControls.enabled = !e.value;
    });

    window.addEventListener("mousemove", this.handleMouseMove.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("click", this.handleObjectSelection.bind(this));
    window.addEventListener("dblclick", this.removeSelectedObjects.bind(this));

    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  private removeSelectedObjects() {
    this.selectedObjects = [];
    this.transformControls.detach();
  }

  private handleMouseMove(event: MouseEvent) {
    const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
    const normalizedY = -(event.clientY / window.innerHeight) * 2 + 1;

    this.cursorLocation.x = normalizedX;
    this.cursorLocation.y = normalizedY;
  }

  private handleObjectHovering(
    camera: THREE.Camera,
    children: THREE.Object3D[]
  ) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.cursorLocation, camera);
    const intersections = raycaster.intersectObjects(children, true);
    if (intersections.length === 0) {
      this.hoveredObject = null;
      this.highlighter.setHoveredObject(this.hoveredObject);
      return;
    }

    if (intersections[0].object.userData.type === "obstacle") {
      const selectedObject = intersections[0].object;
      this.hoveredObject = selectedObject;
    } else {
      this.hoveredObject = null;
    }

    this.highlighter.setHoveredObject(this.hoveredObject);
  }

  private handleObjectSelection() {
    if (!this.hoveredObject) return;

    this.transformControls.attach(this.hoveredObject);
    this.selectedObjects.push(this.hoveredObject);
  }

  public static getInstance(simulator: Simulator): UserControls {
    if (!this.instance) {
      this.instance = new UserControls(simulator);
    }
    return this.instance;
  }

  private onKeyDown(event: KeyboardEvent) {
    const mode = this.getMode(event);

    if (mode === "invalid") return;
    this.transformControls.setMode(mode);
  }

  private getMode(event: KeyboardEvent) {
    const pressedW = event.key === "w" || event.key === "W";
    const pressedE = event.key === "e" || event.key === "E";
    const pressedR = event.key === "r" || event.key === "R";

    if (pressedW) return "translate";
    if (pressedE) return "rotate";
    if (pressedR) return "scale";
    return "invalid";
  }

  private onKeyUp(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 16: // Shift
        // ...
        break;
      default:
        break;
    }
  }

  public update(simulator: Simulator) {
    this.handleObjectHovering(simulator.userCamera, simulator.scene.children);
  }
}
