// PhysicsBody {
// mass: number
// linearDamping: number
// angularDamping: number
// linearVelocity: [x,y,z]
// angularVelocity: [x,y,z]
// gravityFactor: number
// }

import { EntityId } from "../../ecs/types";
import Component from "../../ecs/Component";
import Vector3BufferView, { Vector3Hash } from "../../ecs/utils/Vector3BufferView";

const FLOAT_32_BYTES = 4;

// TODO: optimize with ArrayBuffers
class PhysicsBody extends Component {
  private _values: Float32Array;
  linearVelocity: Vector3BufferView;
  angularVelocity: Vector3BufferView;

  // TODO: ...
  constructor(entityId: EntityId, linearVelocity?: Vector3Hash, angularVelocity?: Vector3Hash) {
    super(entityId);
    this._values = new Float32Array(6);
    this.linearVelocity = new Vector3BufferView(this._values, 0, linearVelocity);
    this.angularVelocity = new Vector3BufferView(this._values, 3 * FLOAT_32_BYTES, angularVelocity);
  }
}

export default PhysicsBody;
