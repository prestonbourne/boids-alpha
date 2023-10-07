import * as THREE from "three";
import { Boid } from ".";
import { Obstacle } from "../obstacle/obstacle";
import { CreateBoidsParams, BoidManagerParams } from "./types";

export class BoidManager {
  private obstacles: Obstacle[];
  private boids: Boid[];
  private currentTarget?: THREE.Object3D;
  public readonly boidTerritoryRadius: number;

  constructor({
    obstacles,
    boidTerritoryRadius,
    target,
  }: BoidManagerParams) {
    this.boids = [];
    this.obstacles = obstacles;
    this.boidTerritoryRadius = boidTerritoryRadius;
    this.currentTarget = target;
  }

  createBoids({ count: boidCount, color, followTarget }: CreateBoidsParams) {
    const boidsResult: Boid[] = [];

    for (let i = 0; i < boidCount; i++) {
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
  update(delta: number) {
    this.boids.forEach((boid) => {
      boid.update(delta, this.boids, this.obstacles);
    });
  }

  get numberOfBoids() {
    return this.boids.length;
  }
}