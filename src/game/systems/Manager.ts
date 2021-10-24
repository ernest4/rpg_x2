import System from "../../ecs/System";
import { Player, Sprite } from "../components";
import PhysicsBody from "../components/PhysicsBody";
import Speed from "../components/Speed";
import Transform from "../components/Transform";
import { assetsPath } from "../../utils/environment";

// TODO: jests

// NOTE: max decently playable Entity count, 5 components each with 6 core systems: 30k
class Manager extends System {
  start(): void {
    // TODO: remove, testing
    Array.from(Array(30000).keys()).forEach((i) => {
      const entityId = this.newEntityId();
      this.engine.addComponents(
        new Player(entityId),
        new Speed(entityId, 100 + i),
        new Transform(entityId, { x: 200 + i, y: 200 + i, z: 0 }),
        new PhysicsBody(entityId),
        new Sprite(entityId, assetsPath("images/unit_T.png"), { frameWidth: 32 })
      );
    });
  }

  update(): void {}

  destroy(): void {}
}

export default Manager;
