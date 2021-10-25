import { Engine } from "../../ecs";
import System from "../../ecs/System";
import PhysicsBody from "../components/PhysicsBody";
import { PHYSICS_BODY, TRANSFORM } from "../components/queryTags";
import Transform from "../components/Transform";

class Movement extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {}

  update(): void {
    this.engine.queryTwoInOrder(this.updateTransforms, PHYSICS_BODY, TRANSFORM);
  }

  destroy(): void {}

  private updateTransforms = (
    { linearVelocity, angularVelocity }: PhysicsBody,
    { position, rotation }: Transform
  ) => {
    const seconds = this.deltaTime / 1000;

    position.x = position.x + linearVelocity.x * seconds;
    position.y = position.y + linearVelocity.y * seconds;
    position.z = position.z + linearVelocity.z * seconds;

    const newRotationZ = rotation.z + angularVelocity.z * seconds;
    rotation.z = 360 < newRotationZ ? newRotationZ - 360 : newRotationZ;
  };
}

export default Movement;
