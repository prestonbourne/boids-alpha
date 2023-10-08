import { useCallback } from "react";
import { Simulator } from "../../models/simulator";

type CanvasProps = {
  simulator: Simulator;
};

export function Canvas({ simulator }: CanvasProps) {
  const mountSimulator = useCallback(
    (ref: HTMLCanvasElement | null) => {
      if (!ref) {
        throw Error(
          "Could not get Canvas Element needed to mount theejs engine"
        );
      }
      simulator.mount(ref);
    },
    [simulator]
  );

  return <canvas ref={mountSimulator}></canvas>;
}

export default Canvas;
