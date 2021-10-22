import Component from "../../shared/ecs/Component";
import Serializable from "../../shared/ecs/component/interfaces/Serializable";
import { EntityId } from "../../shared/ecs/types";
import Vector3BufferView, { Vector3Hash } from "../../shared/ecs/utils/Vector3BufferView";

const FLOAT_32_BYTES = 4;
class Transform extends Component implements Serializable {
  private _values: Float32Array;
  position: Vector3BufferView;
  rotation: Vector3BufferView;
  scale: Vector3BufferView;

  constructor(
    entityId: EntityId,
    position?: Vector3Hash,
    rotation?: Vector3Hash,
    scale?: Vector3Hash
  ) {
    super(entityId);
    this._values = new Float32Array(9);
    this.position = new Vector3BufferView(this._values, 0, position);
    this.rotation = new Vector3BufferView(this._values, 3 * FLOAT_32_BYTES, rotation);
    this.scale = new Vector3BufferView(this._values, 6 * FLOAT_32_BYTES, scale);
    // TODO: hold the parent here ???
    // this._sparent = entityId;
    // when parent transform changes, child transform changes (thats how Unity does it)
    // get/set parent ???
    // this._children = entityId[]; ???
  }

  serialize(): { [key: string]: any; entityId: EntityId } {
    return { ...this.position.xyz, entityId: this.entityId };
  }

  deserialize({ x, y, z }: { [key: string]: any }): void {
    this.position.xyz = { x, y, z };
  }
}

export default Transform;
