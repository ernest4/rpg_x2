import System from "../../ecs/System";
import { Player, Sprite } from "../components";
import PhysicsBody from "../components/PhysicsBody";
import Speed from "../components/Speed";
import Transform from "../components/Transform";
import { assetsPath } from "../../utils/environment";
import { PHYSICS_BODY, PLAYER, SPEED, SPRITE, TRANSFORM } from "../components/queryTags";

// TODO: jests

// NOTE: max decently playable Entity count, 5 components each with 6 core systems: 30k
class Manager extends System {
  start(): void {
    // TODO: remove, testing
    Array.from(Array(30000).keys()).forEach(i => {
      const entityId = this.newEntityId();

      if (i === 1) this.engine.addComponent(PLAYER, new Player(entityId));
      // this.engine.addComponent(PLAYER, new Player(entityId));

      this.engine.addComponent(SPEED, new Speed(entityId, 100 + i));

      this.engine.addComponent(
        TRANSFORM,
        new Transform(entityId, { x: 200 + i, y: 200 + i, z: 0 })
      );

      this.engine.addComponent(PHYSICS_BODY, new PhysicsBody(entityId));

      this.engine.addComponent(
        SPRITE,
        new Sprite(entityId, assetsPath("images/unit_T.png"), { frameWidth: 32 })
      );
    });
  }

  update(): void {}

  destroy(): void {}
}

export default Manager;
