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
import { nullVector, Vector3Hash } from "../../ecs/utils/vector";

class PhysicsBody extends Component {
  static className = () => "PhysicsBody";

  stationary: boolean = true;
  linearVelocity: Vector3Hash;
  angularVelocity: Vector3Hash;

  constructor(
    entityId: EntityId,
    linearVelocity: Vector3Hash = nullVector(),
    angularVelocity: Vector3Hash = nullVector()
  ) {
    super(entityId);
    this.linearVelocity = linearVelocity;
    this.angularVelocity = angularVelocity;
  }
}

export default PhysicsBody;
