import { Simulator } from "./simulator"


export interface SimulationObject {
    update(simulator:Simulator): void
}