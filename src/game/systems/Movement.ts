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
    const [
      {
        position,
        position: { x, y, z },
        rotation,
      },
      {
        stationary,
        linearVelocity: { x: lvx, y: lvy, z: lvz },
        angularVelocity: { z: avxyz },
      },
    ] = querySet as [Transform, PhysicsBody];

    const seconds = this.deltaTime / 1000;

    // so far this is fast or faster?
    // transform.position.x += physicsBody.linearVelocity.x * seconds;
    // transform.position.y += physicsBody.linearVelocity.y * seconds;
    // transform.position.z += physicsBody.linearVelocity.z * seconds;

    // TODO: maybe try avoiding updates if no data change, see if improves...
    // if (stationary) return;

    // TODO: ALSO try NOT using array buffer, i.e. use plain object instead of Vector3BufferView.
    // remember how buffers sucked vs plain array in the other benchmark. could be some V8
    // optimization we're missing here too...!!!

    // this is slightly faster?? like 0.5ms ?? worth it of course, but hard to tell...
    // const { x, y, z } = position.xyz;
    // const { x: lvx, y: lvy, z: lvz } = lvxyz;

    const newX = x + lvx * seconds;
    const newY = y + lvy * seconds;
    const newZ = z + lvz * seconds;
    // position = { x: newX, y: newY, z: newZ };
    position.x = newX;
    position.y = newY;
    position.z = newZ;

    rotation.z += avxyz * seconds;
    if (360 < rotation.z) rotation.z = rotation.z - 360;
  };
}

export default Movement;
