import { Obstacle } from "./obstacle";

/**
 * Adds a simple box obstacle to the scene.
 * @param {*} obstacles the array to push the obstacle to
 * @param {*} scene the scene to add the obstacle to
 */

export function addObstacle(
  obstacles: Obstacle[],
  scene: any,
  width: number,
  height: number,
  depth: number,
  color: number,
  xCoord: number,
  yCoord: number,
  zCoord: number
) {
  console.log('here')
  const obs1 = new Obstacle({
    width,
    height,
    depth,
    color,
    xCoord,
    yCoord,
    zCoord,
  });
  scene.add(obs1.mesh);
  obstacles.push(obs1);
}
