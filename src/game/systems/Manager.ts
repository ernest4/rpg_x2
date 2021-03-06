import System from "../../ecs/System";
import { Player, Sprite } from "../components";
import PhysicsBody from "../components/PhysicsBody";
import Speed from "../components/Speed";
import Transform from "../components/Transform";
import { assetsPath } from "../../utils/environment";

// TODO: jests
class Manager extends System {
  start(): void {
    // TODO: remove, testing
    const entityId = this.newEntityId();
    this.engine.addComponents(
      new Player(entityId),
      new Speed(entityId, 100),
      new Transform(entityId, { x: 100, y: 100, z: 0 }),
      new PhysicsBody(entityId),
      // new Sprite(entityId, "statics/assets/images/unit_T.png", { frameWidth: 32 })
      // new Sprite(entityId, "assets/images/unit_T.png", { frameWidth: 32 })
      new Sprite(entityId, assetsPath("images/unit_T.png"), { frameWidth: 32 })
    );

    this.log(assetsPath("images/unit_T.png"));
    this.log(this.engine.getAllComponentsOfId(entityId));
    this.log(this.engine.getAllComponentsOfId(entityId).length);
  }

  update(): void {}

  destroy(): void {}
}

export default Manager;
