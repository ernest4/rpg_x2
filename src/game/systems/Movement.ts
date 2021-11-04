import { Engine } from "../../ecs";
import System from "../../ecs/System";
import PhysicsBody from "../components/PhysicsBody";
import Position from "../components/Position";
import Velocity from "../components/Velocity";

class Movement extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {}

  update(): void {
    // this.benchmarkSubject("queryTwoInOrderUnchecked", () => {
    //   this.engine.queryTwoInOrderUnchecked(this.updateTransforms, PHYSICS_BODY, TRANSFORM);
    // });
    // this.benchmarkSubject("raw query", () => {
    // });
    const seconds = this.deltaTime / 1000;

    // const [positions, velocities] = this.query(Position, LinearVelocity);
    // const [{ x, y, z }, { dx, dy, dz }, count] = this.queryGroup(Position, Velocity);
    // const [{ x: dx, y: dy, z: dz }, count] = Velocity.joins(Position);
    // for (let i = 0; i < count; i++) {
    //   const { x, y, z } = Position.get();
    // x[i] += dx[i] * seconds;
    // y[i] += dy[i] * seconds;
    // z[i] += dz[i] * seconds;
    // }

    // const [{ x, y, z }, count] = Velocity.all();
    // for (let i = 0; i < count; i++) {
    //   console.log(x[i]);
    //   console.log(y[i]);
    //   console.log(z[i]);
    // }

    const [{ x: dx, y: dy, z: dz }, { x, y, z }, count] = Velocity.group(Position).all();
    for (let i = 0; i < count; i++) {
      x[i] += dx[i] * seconds;
      y[i] += dy[i] * seconds;
      z[i] += dz[i] * seconds;
    }

    // archetype query?
    // const archetypes = this.query(Velocity, Position);
    // for (const [{ x: dx, y: dy, z: dz }, { x, y, z }, count] of archetypes) {
    //   for (let i = 0; i < count; i++) {
    //     x[i] += dx[i] * seconds;
    //     y[i] += dy[i] * seconds;
    //     z[i] += dz[i] * seconds;
    //   }
    // }
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
