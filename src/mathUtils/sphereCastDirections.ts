import * as THREE from "three";

const sphereCastDirections: THREE.Vector3[] = [];

// from https://www.youtube.com/watch?v=bqtqltqcQhw

const numViewDirections = 300;
const goldenRatio = (1 + Math.sqrt(5)) / 2;
const angleIncrement = Math.PI * 2 * goldenRatio;

for (let i = 0; i < numViewDirections; i++) {
  const t = i / numViewDirections;
  const inclination = Math.acos(1 - 2 * t);
  const azimuth = angleIncrement * i;

  const x = Math.sin(inclination) * Math.cos(azimuth);
  const y = Math.sin(inclination) * Math.sin(azimuth);
  const z = Math.cos(inclination);
  sphereCastDirections.push(new THREE.Vector3(x, y, z));
}

export { sphereCastDirections };
