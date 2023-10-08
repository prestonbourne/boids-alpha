import { ControlPanel } from "./components/ControlPanel";
import { Canvas } from "./components/Canvas";
import { Simulator } from "./models/simulator";
import * as THREE from "three";

function App() {
  const simulator = Simulator.getInstance(
    new THREE.Scene()
  );

  return (
    <>
      <ControlPanel simulator={simulator} />
      <Canvas simulator={simulator} />
    </>
  );
}

export default App;
