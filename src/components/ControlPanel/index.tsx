import s from "./style.module.css";
import { MouseEventHandler } from "react";
import { Simulator } from "../../models/simulator";
import { useState } from "react";

type ControlPanelProps = {
  simulator: Simulator;
};

export function ControlPanel({ simulator }: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleAddObject: MouseEventHandler<HTMLButtonElement> = () => {
    simulator.addObject();
  };

  const closedClass = isOpen ? "" : " " + s.closed;

  return (
    <aside className={s.ControlPanelContainer}>
      <div className={s.ControlPanel + closedClass}>
        <button onClick={() => setIsOpen(!isOpen)}>{isOpen ? 'X' : 'Open'}</button>
        <h3>Control Panel</h3>
        <button onClick={handleAddObject}>Add Object</button>
      </div>
    </aside>
  );
}
