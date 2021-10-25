import Component from "../../ecs/Component";
import Serializable from "../../ecs/component/interfaces/Serializable";
import { EntityId } from "../../ecs/types";
import { nullVector, unitVector, Vector3Hash } from "../../ecs/utils/vector";

class Transform extends Component implements Serializable {
  static className = () => "Transform";
  static tag = () => 0;

  position: Vector3Hash;
  rotation: Vector3Hash;
  scale: Vector3Hash;

  constructor(
    entityId: EntityId,
    position: Vector3Hash = nullVector(),
    rotation: Vector3Hash = nullVector(),
    scale: Vector3Hash = unitVector()
  ) {
    super(entityId);
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    // TODO: hold the parent here ???
    // this._sparent = entityId;
    // when parent transform changes, child transform changes (thats how Unity does it)
    // get/set parent ???
    // this._children = entityId[]; ???
  }

  serialize(): { [key: string]: any; entityId: EntityId } {
    return {
      // ...this.position.xyz,
      // ...this.rotation.xyz,
      // ...this.scale.xyz,
      entityId: this.entityId,
    };
  }

  deserialize({ position, rotation, scale }: { [key: string]: any }): void {
    // this.position.xyz = position;
    // this.position.xyz = rotation;
    // this.position.xyz = scale;
  }
}

export default Transform;
