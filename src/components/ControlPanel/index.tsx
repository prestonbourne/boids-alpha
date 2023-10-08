import s from "./style.module.css";
import { MouseEventHandler } from "react";
import { Simulator } from "../../models/simulator";

type ControlPanelProps = {
  simulator: Simulator;
};

export function ControlPanel({ simulator }: ControlPanelProps) {

  const handleAddObject: MouseEventHandler<HTMLButtonElement> = () => {
    simulator.addObject();
  };

  return (
    <aside className={s.ControlPanel}>
      <div>
        <h5>Control</h5>
        <button onClick={handleAddObject}>Add Object</button>
      </div>
    </aside>
  );
}
