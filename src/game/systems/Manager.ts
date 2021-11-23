import System from "../../ecs/System";
import { assetsPath } from "../../utils/environment";
import { Engine } from "../../ecs";
import { NullVector3 } from "../../ecs/Component";
import Assets, { Resources } from "../Assets";
import { Components, SCHEMA } from "../components";

// TODO: jests
class Manager extends System {
  assets: Assets;

  constructor(engine: Engine, assets: Assets) {
    super(engine);
    this.assets = assets;
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
        this.assets.getIndex(Resources.image, "unit_T.png"),
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
