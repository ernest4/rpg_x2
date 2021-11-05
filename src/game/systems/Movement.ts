import { Engine } from "../../ecs";
import { Vector3 } from "../../ecs/Component";
import System from "../../ecs/System";
import PhysicsBody from "../components/PhysicsBody";
import Position from "../components/Position";
import Velocity from "../components/Velocity";

const enum Components {
  Position,
  Velocity,
}

const Schema = {
  [Components.Position]: Vector3,
  [Components.Velocity]: Vector3,
} as const;

class Movement extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {}

  update(): void {
    // this.benchmarkSubject("archetype query", () => {
    // });
    const seconds = this.deltaTime / 1000;

    const archetypes = this.query(Velocity, Position);
    for (let j = 0, l = archetypes.length; j < l; j++) {
      const [{ x: dx, y: dy, z: dz }, { x, y, z }, count] = archetypes[j];
      for (let i = 0; i < count; i++) {
        x[i] += dx[i] * seconds;
        y[i] += dy[i] * seconds;
        z[i] += dz[i] * seconds;
      }
    }
  }

  destroy(): void {}

  // private updateTransforms = (
  //   { linearVelocity, angularVelocity }: PhysicsBody,
  //   { position, rotation }: Transform
  // ) => {
  //   const seconds = this.deltaTime / 1000;

  //   position.x = position.x + linearVelocity.x * seconds;
  //   position.y = position.y + linearVelocity.y * seconds;
  //   position.z = position.z + linearVelocity.z * seconds;

  //   const newRotationZ = rotation.z + angularVelocity.z * seconds;
  //   rotation.z = 360 < newRotationZ ? newRotationZ - 360 : newRotationZ;
  // };
}

export default Movement;
