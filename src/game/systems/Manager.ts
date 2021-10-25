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
    Array.from(Array(30000).keys()).forEach(i => {
      const entityId = this.newEntityId();

      const speed = new Speed(entityId, 100 + i);
      const transform = new Transform(entityId, { x: 200 + i, y: 200 + i, z: 0 });
      const physicsBody = new PhysicsBody(entityId);
      const sprite = new Sprite(entityId, assetsPath("images/unit_T.png"), { frameWidth: 32 });

      if (i === 1) {
        const player = new Player(entityId);
        this.engine.addComponent(player);
        this.engine.addComponent2(4, player);
      }
      this.engine.addComponents(speed, transform, physicsBody, sprite);

      this.engine.addComponent2(3, speed);
      this.engine.addComponent2(0, transform);
      this.engine.addComponent2(2, physicsBody);
      this.engine.addComponent2(1, sprite);
    });
  }

  update(): void {}

  destroy(): void {}
}

export default Manager;
