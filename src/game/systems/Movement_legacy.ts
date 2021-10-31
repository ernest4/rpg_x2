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
    // this.benchmarkSubject("queryTwoInOrderUnchecked", () => {
    //   this.engine.queryTwoInOrderUnchecked(this.updateTransforms, PHYSICS_BODY, TRANSFORM);
    // });
    // this.benchmarkSubject("raw query", () => {
    // });
    // this.engine.queryTwoInOrderUnchecked(this.updateTransforms, PHYSICS_BODY, TRANSFORM);
    const pbComponentList = this.engine._componentLists[PHYSICS_BODY];
    const tComponentList = this.engine._componentLists[TRANSFORM];
    if (!pbComponentList) return;
    const elementCount = pbComponentList._elementCount;
    const denseList = pbComponentList._denseList;
    // let pbLinearVelocity;
    for (let i = 0; i < elementCount; i++) {
      // pbLinearVelocity = (<PhysicsBody>denseList[i]).linearVelocity;
      // pbLinearVelocity.x = i;
      // pbLinearVelocity.y = i;
      // pbLinearVelocity.z = i;
      this.updateTransforms(<PhysicsBody>denseList[i], <Transform>tComponentList.getUnchecked(i));
    }
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
