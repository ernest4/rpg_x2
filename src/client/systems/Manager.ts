import System from "../../shared/ecs/System";
import { Player } from "../components";
import LoadSpriteEvent from "../components/LoadSpriteEvent";
import Speed from "../components/Speed";

// TODO: jests
class Manager extends System {
  start(): void {
    // TODO: remove, testing
    const entityId = this.newEntityId();
    this.engine.addComponents(
      new Player(entityId),
      new Speed(entityId, 1000),
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
