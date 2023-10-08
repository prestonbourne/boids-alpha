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
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
    });
    const meshMaterial = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      wireframe: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    this.mesh.add(new THREE.Mesh(geometry, meshMaterial));
    this.mesh.add(
      new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        lineMaterial
      )
    );

    this.mesh.position.set(xCoord, yCoord, zCoord);
  }
}
