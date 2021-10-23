import System from "../../shared/ecs/System";
import { Player } from "../components";
import LoadSpriteEvent from "../components/LoadSpriteEvent";
import PhysicsBody from "../components/PhysicsBody";
import Speed from "../components/Speed";
import Transform from "../components/Transform";

// TODO: jests
class Manager extends System {
  start(): void {
    // TODO: remove, testing
    const entityId = this.newEntityId();
    this.engine.addComponents(
      new Player(entityId),
      new Speed(entityId, 100),
      new Transform(entityId, { x: 100, y: 100, z: 0 }, null, { x: 1, y: 1, z: 1 }),
      new PhysicsBody(entityId),
      new LoadSpriteEvent(
        this.newEntityId(),
        "assets/images/unit_T.png",
        { frameWidth: 32 },
        entityId
      )
    );
  }

  update(): void {}

  destroy(): void {}
}

export default Manager;
