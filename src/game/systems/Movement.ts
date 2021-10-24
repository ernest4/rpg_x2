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
    const [{ position, rotation }, { linearVelocity, angularVelocity }] = querySet as [
      Transform,
      PhysicsBody
    ];

    const seconds = this.deltaTime / 1000;

    // so far this is fast or faster?
    // transform.position.x += physicsBody.linearVelocity.x * seconds;
    // transform.position.y += physicsBody.linearVelocity.y * seconds;
    // transform.position.z += physicsBody.linearVelocity.z * seconds;

    const { x, y, z } = position.xyz;
    const newX = x + linearVelocity.x * seconds;
    const newY = y + linearVelocity.y * seconds;
    const newZ = z + linearVelocity.z * seconds;
    position.xyz = { x: newX, y: newY, z: newZ };

    rotation.z += angularVelocity.z * seconds;
    if (360 < rotation.z) rotation.z = rotation.z - 360;
  };
}

export default Movement;
