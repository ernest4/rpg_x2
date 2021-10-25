import { Engine } from "../../ecs";
import System from "../../ecs/System";
import PhysicsBody from "../../components/PhysicsBody";
import Transform from "../../components/Transform";

class Movement extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {}

  update(): void {
    this.engine.queryN(this.updateTransforms, Transform, PhysicsBody);
  }

  destroy(): void {}

  private updateTransforms = ([transform, physicsBody]: [Transform, PhysicsBody]) => {
    const seconds = this.deltaTime / 1000;

    transform.position.x += physicsBody.linearVelocity.x * seconds;
    transform.position.y += physicsBody.linearVelocity.y * seconds;
    transform.position.z += physicsBody.linearVelocity.z * seconds;

    transform.rotation.z += physicsBody.angularVelocity.z * seconds;
    if (360 < transform.rotation.z) transform.rotation.z = transform.rotation.z - 360;
  };
}

export default Movement;
