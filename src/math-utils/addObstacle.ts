import THREE from "three";
import {Obstacle} from './obstacle'

/**
 * Adds a simple box obstacle to the scene.
 *
 * @param {*} obstacles the array to push the obstacle to
 * @param {*} scene the scene to add the obstacle to
 * @param {*} w width of obstacle
 * @param {*} h height of obstacle
 * @param {*} d depth of obstacle
 * @param {*} c color of obstacle
 * @param {*} x coordinate of obstacle
 * @param {*} y coordinate of obstacle
 * @param {*} z coordinate of obstacle
 */

export function addObstacle(
  obstacles: Obstacle[],
  scene: any,
  w: number,
  h: number,
  d: number,
  c: number,
  x: number,
  y: number,
  z: number
) {
  const obs1 = new Obstacle(w, h, d, c);
  obs1.mesh.position.set(x, y, z);
  scene.add(obs1.mesh);
  obstacles.push(obs1);
}


