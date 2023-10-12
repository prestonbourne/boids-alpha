// todo: Find a better home for this file
import * as THREE from "three";
import { ObstacleParams } from "./types";

export class Obstacle {
  public mesh: THREE.Group;
  constructor({
    width,
    height,
    depth,
    color,
    xCoord,
    yCoord,
    zCoord,
  }: ObstacleParams) {
    const geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);

    this.mesh = new THREE.Group();

    const meshMaterial = new THREE.MeshLambertMaterial({
      color,
      blending: THREE.NormalBlending,
    });
    const mesh = new THREE.Mesh(geometry, meshMaterial);
    mesh.userData = { type: "obstacle" };
    this.mesh.add(mesh);

    this.mesh.position.set(xCoord, yCoord, zCoord);
  }
}
