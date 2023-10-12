import { useCallback } from "react";
import { Simulator } from "../../models/simulator";
import s from "./style.module.css";

type CanvasProps = {
  simulator: Simulator;
};

export function Canvas({ simulator }: CanvasProps) {
  const mountSimulator = useCallback(
    (ref: HTMLCanvasElement | null) => {
      if (!ref) {
        throw Error(
          "Could not get Canvas Element needed to mount threejs engine"
        );
      }
      simulator.mount(ref);
    },
    [simulator]
  );

  return (
    <div className={s.canvasContainer}>
      <canvas ref={mountSimulator}></canvas>
    </div>
  );
}

export default Canvas;
