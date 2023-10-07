import * as THREE from "three";
import { sphereCastDirections } from "../math-utils/sphereCastDirections";
import { Obstacle } from "../math-utils/obstacle";

const minSpeed = 1;
const maxSpeed = 5;

const numSamplesForSmoothing = 20;

const wanderWeight = 0.2;
// Steer towards the average position of nearby boids
const cohesionWeight = 1;
// Steers away from nearby boids
const separationWeight = 1;
// Adopt the average velocity of bearby boids
const alignmentWeight = 1;

const visionRange = 150;

const origin = new THREE.Vector3();
const boundaryRadius = 370;

export class Boid {
  private wanderCounter: number;
  private counter: number;
  private scene: any;
  public mesh: any;
  private geometry: THREE.ConeGeometry;
  private velocity: THREE.Vector3;
  private target: any;
  private acceleration: THREE.Vector3;
  private followTarget: boolean;
  private debug: boolean;
  private velocitySamples: THREE.Vector3[];
  private arrows: THREE.ArrowHelper[];
  private wanderTarget: THREE.Vector3;

  constructor(
    scene: any,
    target: any,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion | null,
    color: THREE.ColorRepresentation | null,
    followTarget = false
  ) {
    
    this.scene = scene;
    const { mesh, geometry } = this.getBoid(position, quaternion, color);

    this.mesh = mesh;
    this.geometry = geometry;
    this.target = target;

    // re-usable acceleration vector
    this.acceleration = new THREE.Vector3();

    // velocity is speed in a given direction, and in the update method we'll
    // compute an acceleration that will change the velocity
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );

    // whether this boid will follow the target
    this.followTarget = followTarget;

    // remember the last however many velocities so we can smooth the heading of the boid
    this.velocitySamples = [];

    this.wanderTarget = new THREE.Vector3(
      mesh.position.x,
      mesh.position.y,
      300
    );

    this.debug = false;
    this.counter = 0;
    this.wanderCounter = 0;
    this.arrows = [];
    
  }

  getBoid(
    position = new THREE.Vector3(0, 0, 0),
    quaternion: THREE.Quaternion | null,
    color: THREE.ColorRepresentation | null
  ) {
    if (color === null) {
      color = 0x156289;
    }

    const geometry = new THREE.ConeGeometry(5, 10, 8);
    // rotate the geometry, because the face used by lookAt is not the cone's "tip"
    geometry.rotateX(THREE.MathUtils.degToRad(90));

    const mesh = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });
    const meshMaterial = new THREE.MeshPhongMaterial({
      color,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      flatShading: true,
    });
    mesh.add(
      new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        lineMaterial
      )
    );
    mesh.add(new THREE.Mesh(geometry, meshMaterial));

    mesh.position.copy(position);
    if (quaternion) {
      mesh.quaternion.copy(quaternion);
    }

    return { mesh, geometry };
  }

  /**
   * The boid will update its "steer vector" based on:
   * - Collision Avoidance: avoid collisions with nearby flockmates (and other obstacles)
   * - Velocity Matching: attempt to match velocity with nearby flockmates
   * - Flock Centering: attempt to stay close to nearby flockmates
   *
   * Alternative definitions for the above terms are:
   * - separation: steer to avoid crowding local flockmates
   * - alignment: steer towards the average heading of local flockmates
   * - cohesion: steer to move towards the average position (center of mass) of local flockmates
   */
  update(delta: number, neighbours: Boid[], obstacles: Obstacle[]) {
    this.counter++;
    this.wanderCounter++;

    // fly towards the target
    if (this.target && this.followTarget) {
      // var pos = this.target.position.clone()
      // pos.sub(this.mesh.position);
      // var accelerationTowardsTarget = this.steerTowards(pos).multiplyScalar(maxForceSeek);

      const accelerationTowardsTarget = this.seek(delta, this.target.position);

      // "flee" would use sub
      this.acceleration.add(accelerationTowardsTarget);
    } else {
      if (this.mesh.position.distanceTo(origin) >= boundaryRadius) {
        this.acceleration.add(this.wander(delta).multiplyScalar(20));
      } else {
        this.acceleration.add(this.wander(delta).multiplyScalar(wanderWeight));
      }
    }

    // steering behaviour: alignment
    this.acceleration.add(
      this.alignment(delta, neighbours).multiplyScalar(alignmentWeight)
    );

    // steering behaviour: cohesion
    this.acceleration.add(
      this.cohesion(delta, neighbours).multiplyScalar(cohesionWeight)
    );

    // steering behaviour: separation
    this.acceleration.add(
      this.separation(delta, neighbours).multiplyScalar(separationWeight)
    );

    // avoid collisions with world obstacles
    const originPoint = this.mesh.position.clone();
    const localVertex = new THREE.Vector3().fromBufferAttribute(
      this.geometry.getAttribute("position"),
      0
    );
    const globalVertex = localVertex.applyMatrix4(this.mesh.matrix);
    const directionVector = globalVertex.sub(this.mesh.position);

    let raycaster = new THREE.Raycaster(
      originPoint,
      directionVector.clone().normalize(),
      0,
      visionRange
    );

    if (this.debug) {
      const arrow = new THREE.ArrowHelper(
        raycaster.ray.direction,
        raycaster.ray.origin,
        50,
        0xff0000
      );
      if (this.counter % 50 === 0) {
        arrow.name = Math.random().toString(36).substring(2, 15);
        this.arrows.push(arrow);
        this.scene.add(arrow);
        if (this.arrows.length > 3) {
          const toBeRemoved = this.arrows.shift();
          if (!toBeRemoved) return;
          this.scene.remove(this.scene.getObjectByName(toBeRemoved.name));
        }
      }
    }

    // obstacle meshes are Group, and the first child is the mesh we want to ray-trace
    const collisionResults = raycaster.intersectObjects(
      obstacles.map((o) => o.mesh.children[0])
    );
    if (collisionResults.length > 0) {
      // flee from the object
      // var seek = this.seek(delta, collisionResults[0].point)
      // this.acceleration.add(seek.negate().multiplyScalar(100))

      // gently dodge object
      for (let i = 0; i < sphereCastDirections.length; i++) {
        const direction = sphereCastDirections[i];
        raycaster = new THREE.Raycaster(originPoint, direction, 0, visionRange);
        const spectrumCollision = raycaster.intersectObject(
          collisionResults[0].object
        );
        if (spectrumCollision.length === 0) {
          this.acceleration.add(direction.clone().multiplyScalar(100));
          break;
        }
      }
    }

    this.applyAcceleration();

    this.lookWhereGoing();
  }

  applyAcceleration() {
    this.velocity.add(this.acceleration);
    this.acceleration.set(0, 0, 0); // reset
    this.velocity.clampLength(minSpeed, maxSpeed);
    this.mesh.position.add(this.velocity);
  }

  /**
   * Once the boid reaches a stationary target, and the target doesn't change, it will flip/flop on the spot.
   * That's because the old velocity is retained.
   * @param {*} delta
   * @param {*} target
   */
  seek(delta: number, target: THREE.Vector3) {
    const steerVector = target.clone().sub(this.mesh.position);
    steerVector.normalize();
    steerVector.multiplyScalar(maxSpeed);
    steerVector.sub(this.velocity);

    const maxForce = delta * 5;
    steerVector.clampLength(0, maxForce);
    return steerVector;
  }

  /**
   * From the paper:
   * Collision Avoidance: avoid collisions with nearby flockmates (aka separation)
   *
   * Simply look at each neighbour, and if it's within a defined small distance (say 100 units),
   * then move it as far away again as it already is. This is done by subtracting from a vector
   * "steerVector" (initialised to zero) the displacement of each neighbour which is nearby.
   */
  separation(delta: number, neighbours: Boid[], range = 30) {
    const steerVector = new THREE.Vector3();

    var neighbourInRangeCount = 0;

    neighbours.forEach((neighbour) => {
      // skip same object
      if (neighbour.mesh.id === this.mesh.id) return;

      const distance = neighbour.mesh.position.distanceTo(this.mesh.position);
      if (distance <= range) {
        var diff = this.mesh.position.clone().sub(neighbour.mesh.position);
        diff.divideScalar(distance); // weight by distance
        steerVector.add(diff);
        neighbourInRangeCount++;
      }
    });

    if (neighbourInRangeCount !== 0) {
      steerVector.divideScalar(neighbourInRangeCount);
      steerVector.normalize();
      steerVector.multiplyScalar(maxSpeed);
      var maxForce = delta * 5;
      steerVector.clampLength(0, maxForce);
    }

    return steerVector;
  }

  /**
   * Produces a steering force that keeps a boid's heading aligned with its neighbours.
   * (average velocity)
   * @param {*} neighbours
   */
  alignment(delta: number, neighbours: Boid[], range = 50) {
    let steerVector = new THREE.Vector3();
    const averageDirection = new THREE.Vector3();

    var neighboursInRangeCount = 0;

    neighbours.forEach((neighbour) => {
      // skip same object
      if (neighbour.mesh.id === this.mesh.id) return;

      const distance = neighbour.mesh.position.distanceTo(this.mesh.position);
      if (distance <= range) {
        neighboursInRangeCount++;
        averageDirection.add(neighbour.velocity.clone());
      }
    });

    if (neighboursInRangeCount > 0) {
      averageDirection.divideScalar(neighboursInRangeCount);
      averageDirection.normalize();
      averageDirection.multiplyScalar(maxSpeed);

      steerVector = averageDirection.sub(this.velocity);
      var maxForce = delta * 5;
      steerVector.clampLength(0, maxForce);
    }

    return steerVector;
  }

  /**
   * Produces a steering force that moves a boid toward the average position of its neighbours.
   *
   * @param {*} neighbours
   */
  cohesion(delta: number, neighbours: Boid[], range = 50) {
    const centreOfMass = new THREE.Vector3();

    let neighboursInRangeCount = 0;

    neighbours.forEach((neighbour) => {
      // skip same object
      if (neighbour.mesh.id === this.mesh.id) return;

      const distance = neighbour.mesh.position.distanceTo(this.mesh.position);
      if (distance <= range) {
        neighboursInRangeCount++;
        centreOfMass.add(neighbour.mesh.position);
      }
    });

    if (neighboursInRangeCount > 0) {
      centreOfMass.divideScalar(neighboursInRangeCount);

      // "seek" the centre of mass
      return this.seek(delta, centreOfMass);
    } else {
      return new THREE.Vector3();
    }
  }

  rndCoord(range = boundaryRadius/2) {
    return (Math.random() - 0.5) * range * 2;
  }
  wander(delta: number) {
    const distance = this.mesh.position.distanceTo(this.wanderTarget);

    const closeToTarget = distance < 5;
    const hasWanderedForTooLong = this.wanderCounter >= 500;

    if (closeToTarget || hasWanderedForTooLong) {
      // when we reach the target, set a new random target
      this.wanderTarget = new THREE.Vector3(
        this.rndCoord(),
        this.rndCoord(),
        this.rndCoord()
      );
      this.wanderCounter = 0;
    }

    return this.seek(delta, this.wanderTarget);
  }

  lookWhereGoing(smoothing = true) {
    var direction = this.velocity.clone();
    if (smoothing) {
      if (this.velocitySamples.length == numSamplesForSmoothing) {
        this.velocitySamples.shift();
      }

      this.velocitySamples.push(this.velocity.clone());
      direction.set(0, 0, 0);
      this.velocitySamples.forEach((sample) => {
        direction.add(sample);
      });
      direction.divideScalar(this.velocitySamples.length);
    }

    direction.add(this.mesh.position);
    this.mesh.lookAt(direction);
  }
}
