import * as THREE from "three";
import { Boid } from ".";
import { Obstacle } from "../obstacle";
import { CreateBoidsParams, BoidManagerParams } from "./types";
import { SimulationObject } from "../types";
import { Simulator } from "../simulator";

export class BoidManager implements SimulationObject {
  private obstacles: Obstacle[];
  private boids: Boid[];
  private currentTarget?: THREE.Object3D;
  public readonly boidTerritoryRadius: number;

  constructor({ obstacles, boidTerritoryRadius, target }: BoidManagerParams) {
    this.boids = [];
    this.obstacles = obstacles;
    this.boidTerritoryRadius = boidTerritoryRadius;
    this.currentTarget = target;
  }

  createBoids({ count, color, followTarget }: CreateBoidsParams) {
    const boidsResult: Boid[] = [];

    for (let i = 0; i < count; i++) {
      const randomX = Math.random() * this.boidTerritoryRadius;
      const randomY = Math.random() * this.boidTerritoryRadius;
      const randomZ = Math.random() * this.boidTerritoryRadius;

      const position = new THREE.Vector3(randomX, randomY, randomZ);

      const currBoid = new Boid({
        target: this.currentTarget,
        position,
        followTarget,
        color,
      });

      this.boids.push(currBoid);
      boidsResult.push(currBoid);
    }

    return boidsResult;
  }
  update(simulator: Simulator) {
    const delta = simulator.clock.getDelta();

    this.boids.forEach((boid) => {
      boid.update(delta, this.boids, this.obstacles);
    });
  }

  get numberOfBoids() {
    return this.boids.length;
  }
}
