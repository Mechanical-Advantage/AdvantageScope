import * as THREE from "three";
import { APRIL_TAG_16H5_SIZE, APRIL_TAG_36H11_SIZE } from "../../../geometry";
import { zfill } from "../../../util";
import { ThreeDimensionRendererCommand_AprilTagObj } from "../../ThreeDimensionRenderer";
import { rotation3dToQuaternion } from "../../ThreeDimensionRendererImpl";
import ObjectManager from "../ObjectManager";

export default class AprilTagManager extends ObjectManager<ThreeDimensionRendererCommand_AprilTagObj> {
  private tags: { idStr: string; active: boolean; object: THREE.Mesh }[] = [];

  private textureLoader = new THREE.TextureLoader();
  private geometry36h11 = new THREE.BoxGeometry(0.02, APRIL_TAG_36H11_SIZE, APRIL_TAG_36H11_SIZE).rotateX(Math.PI / 2);
  private geometry16h5 = new THREE.BoxGeometry(0.02, APRIL_TAG_16H5_SIZE, APRIL_TAG_16H5_SIZE).rotateX(Math.PI / 2);
  private whiteMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: this.materialSpecular,
    shininess: this.materialShininess
  });
  private idTextures: THREE.Texture[] = [];

  dispose(): void {
    this.tags.forEach((tag) => {
      this.root.remove(tag.object);
    });
    this.geometry36h11.dispose();
    this.geometry16h5.dispose();
    this.whiteMaterial.dispose();
    this.idTextures.forEach((texture) => texture.dispose());
  }

  setObjectData(object: ThreeDimensionRendererCommand_AprilTagObj): void {
    this.tags.forEach((entry) => (entry.active = false));

    object.poses.forEach((annotatedPose) => {
      let idStr =
        object.family +
        (annotatedPose.annotation.aprilTagId === undefined ? "" : annotatedPose.annotation.aprilTagId.toString());

      // Find tag object
      let entry = this.tags.find((x) => !x.active && x.idStr === idStr);
      if (entry === undefined) {
        // Make new object
        entry = {
          idStr: idStr,
          active: true,
          object: new THREE.Mesh(object.family === "36h11" ? this.geometry36h11 : this.geometry16h5, [
            this.whiteMaterial, // Front face, temporary until texture is loaded
            this.whiteMaterial,
            this.whiteMaterial,
            this.whiteMaterial,
            this.whiteMaterial,
            this.whiteMaterial
          ])
        };
        entry.object.castShadow = true;
        this.root.add(entry.object);
        this.textureLoader.load(
          "../www/textures/apriltag-" +
            object.family +
            "/" +
            (annotatedPose.annotation.aprilTagId === undefined
              ? "smile"
              : zfill(annotatedPose.annotation.aprilTagId.toString(), 3)) +
            ".png",
          (texture) => {
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            this.idTextures.push(texture);
            this.requestRender();
            if (entry !== undefined && Array.isArray(entry.object.material)) {
              entry.object.material[0] = new THREE.MeshPhongMaterial({
                map: texture,
                specular: this.materialSpecular,
                shininess: this.materialShininess
              });
            }
          }
        );
        this.tags.push(entry);
      } else {
        entry.active = true;
      }

      // Update object pose
      entry.object.rotation.setFromQuaternion(rotation3dToQuaternion(annotatedPose.pose.rotation));
      entry.object.position.set(...annotatedPose.pose.translation);
    });

    this.tags.forEach((entry) => {
      entry.object.visible = entry.active;
    });
  }
}
