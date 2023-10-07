import * as THREE from "three";
import { Boid } from ".";
import { Obstacle } from "../math-utils/obstacle";

export default class BoidManager {
  private obstacles: Obstacle[];
  public boids: Boid[];
  /**
   *
   * @param {*} numberOfBoids
   * @param {*} obstacles other obstacles in the world to consider when avoiding collisions
   * @param {*} target a target for all boids to move towards
   */

  constructor(
    scene: THREE.Scene,
    numberOfBoids = 20,
    obstacles: Obstacle[],
    target?: THREE.Object3D
  ) {
    // create the boids
    this.boids = [];
    this.initBoids(scene, numberOfBoids, target);

    // for each boid, add the other boids to its collidableMeshList, and also add
    // the meshes from the common collidableMeshList

    this.obstacles = obstacles;
  }

  initBoids(scene: THREE.Scene, numberOfBoids: number, target?: THREE.Object3D) {
    let randomX, randomY, randomZ, color, followTarget, quaternion;

    for (let i = 0; i < numberOfBoids; i++) {
      randomX = Math.random() * 250 - 125;
      randomY = Math.random() * 250 - 125;
      randomZ = Math.random() * 250 - 125;
      color = null; // will use default color in getBoid
      followTarget = true;
      quaternion = null;

      // reference boid
      if (i === 0) {
        randomX = 0;
        randomY = 0;
        randomZ = 0;
        color = 0xe56289;
        followTarget = false;
        quaternion = null;
      }

      const position = new THREE.Vector3(randomX, randomY, randomZ);

      const boid = new Boid(
        scene,
        target,
        position,
        quaternion,
        color,
        followTarget
      );
      this.boids.push(boid);
    }
  }

  update(delta: number) {
    this.boids.forEach((boid) => {
      boid.update(delta, this.boids, this.obstacles);
    });
  }
}
