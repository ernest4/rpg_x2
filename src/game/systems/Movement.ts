import { Engine } from "../../ecs";
import Archetype from "../../ecs/Archetype";
// import { Vector3 } from "../../ecs/Component";
import System from "../../ecs/System";
import { Components } from "../scenes/Main";
// import PhysicsBody from "../components/PhysicsBody";
// import Position from "../components/Position";
// import Velocity from "../components/Velocity";
// import { Components } from "../scenes/Main";

class Movement extends System {
  archetypes: Archetype[];

  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    this.archetypes = this.view(
      Components.Velocity,
      Components.Position,
      Components.Rotation,
      Components.AngularVelocity
    );
  }

  update(): void {
    const {
      archetypes,
      archetypes: { length },
    } = this;

    // this.benchmarkSubject("archetype query", () => {
      const seconds = this.deltaTime / 1000;

      
      for (let j = 0; j < length; j++) {
        const {
          components: {
            [Components.Position]: [x, y, z],
            [Components.Velocity]: [dx, dy, dz],
            [Components.Rotation]: [rz],
            [Components.AngularVelocity]: [az],
          },
          elementCount,
        } = archetypes[j];
        
        for (let i = 0; i < elementCount; i++) {
          x[i] += dx[i] * seconds;
          y[i] += dy[i] * seconds;
          z[i] += dz[i] * seconds;

          const newRz = rz[i] + az[i] * seconds;
          z[i] += 360 < newRz ? newRz - 360 : newRz;
        }
      }
    // });
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
