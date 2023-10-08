import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Simulator } from "../simulator";

export class UserControls {
  private static instance: UserControls;

  public readonly transformControls: TransformControls;
  public readonly orbitControls: OrbitControls;

  private constructor({ userCamera, renderer }: Simulator) {
    this.orbitControls = new OrbitControls(userCamera, renderer.domElement);
    this.orbitControls.minDistance = 100;
    this.orbitControls.maxDistance = 1000;

    this.transformControls = new TransformControls(
      userCamera,
      renderer.domElement
    );

    this.transformControls.addEventListener("dragging-changed", (e) => {
      console.log(e);
      this.orbitControls.enabled = !e.value;
    });

    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
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
    this.transformControls.setMode(mode)
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
}
