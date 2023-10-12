import * as THREE from "three";

export class ObjectHighlighter {
  private hoveredObject: THREE.Object3D | null = null;
  private highlightMaterial: THREE.MeshBasicMaterial;

  constructor() {
    this.highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  }

  public setHoveredObject(object: THREE.Object3D | null) {
    const sameObject = object === this.hoveredObject;
    
    if (sameObject) return;
    if (this.hoveredObject) {
			console.log("removing highlight");
      this.removeHighlight(this.hoveredObject);
    }
    this.hoveredObject = object;
    if (this.hoveredObject) {
			this.hoveredObject
      this.addHighlight(this.hoveredObject);
    }
  }

  private addHighlight(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh) {
			object.userData.originalMaterial = object.material;
      object.material = this.highlightMaterial;
    } else if (object instanceof THREE.Group) {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
					child.userData.originalMaterial = child.material;
          child.material = this.highlightMaterial;
        }
      });
    }
  }

  private removeHighlight(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh) {
      object.material = object.userData.originalMaterial;
    } else if (object instanceof THREE.Group) {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = child.userData.originalMaterial;
        }
      });
    }
  }
}
