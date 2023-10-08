import { Obstacle } from "../obstacle"

export type BoidParams = {
    target?: THREE.Object3D
    position: THREE.Vector3
    color: THREE.ColorRepresentation
    followTarget: boolean
}

export type BoidManagerParams = {
    obstacles: Obstacle[],
    boidTerritoryRadius: number,
    target?: THREE.Object3D
}

export type CreateBoidsParams = {
    count: number
    color: THREE.ColorRepresentation
    followTarget: boolean
}