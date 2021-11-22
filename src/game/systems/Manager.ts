import System from "../../ecs/System";
import { assetsPath } from "../../utils/environment";
import { Engine } from "../../ecs";
import { Components, SCHEMA } from "../scenes/Main";
import { NullVector3 } from "../../ecs/Component";
import Assets, { Resources } from "../Assets";

// TODO: jests
class Manager extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    // TODO: remove, testing
    Array.from(Array(30000).keys()).forEach(i => {
      const entityId = this.newEntityId();

      if (i === 1) this.addComponent(Components.Player, entityId, SCHEMA[Components.Player], []);
      this.addComponent(Components.Speed, entityId, SCHEMA[Components.Speed], [100 + i]);
      this.addComponent(Components.Position, entityId, SCHEMA[Components.Position], [
        200 + i,
        200 + i,
        0,
      ]);
      this.addComponent(Components.Velocity, entityId, SCHEMA[Components.Velocity], NullVector3);
      this.addComponent(Components.Rotation, entityId, SCHEMA[Components.Rotation], [0]);
      this.addComponent(Components.AngularVelocity, entityId, SCHEMA[Components.AngularVelocity], [
        0,
      ]);
      this.addComponent(Components.Scale, entityId, SCHEMA[Components.Scale], [1, 1, 1]);
      this.addComponent(Components.Sprite, entityId, SCHEMA[Components.Sprite], [
        Assets.getIndex(Resources.image, "unit_T.png"),
        32,
        -1,
      ]);
      // this.addComponent(Components.Sprite, entityId, SCHEMA[Components.Sprite], [
      //   assetsPath("images/unit_T.png"),
      //   32,
      // ]);
    });
  }

  update(): void {}

  destroy(): void {}
}

export default Manager;
