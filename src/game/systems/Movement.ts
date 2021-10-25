import { Engine } from "../../ecs";
import System from "../../ecs/System";
import { QuerySet } from "../../ecs/types";
import PhysicsBody from "../components/PhysicsBody";
import Transform from "../components/Transform";

class Movement extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {}

  update(): void {
    this.engine.query(this.updateTransforms, Transform, PhysicsBody);
  }

  destroy(): void {}

  private updateTransforms = (querySet: QuerySet) => {
    const [{ position, rotation }, { stationary, linearVelocity, angularVelocity }] = querySet as [
      Transform,
      PhysicsBody
    ];

    const seconds = this.deltaTime / 1000;

    position.x = position.x + linearVelocity.x * seconds;
    position.y = position.y + linearVelocity.y * seconds;
    position.z = position.z + linearVelocity.z * seconds;

    const newRotationZ = rotation.z + angularVelocity.z * seconds;
    rotation.z = 360 < newRotationZ ? newRotationZ - 360 : newRotationZ;
  };
}

export default Movement;
