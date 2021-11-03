import System from "../../ecs/System";
import { Player, Sprite } from "../components";
import PhysicsBody from "../components/PhysicsBody";
import Speed from "../components/Speed";
import Transform from "../components/Transform";
import { assetsPath } from "../../utils/environment";
import Component, { ComponentsSchema, FieldTypes, NullVector3, Vector3 } from "../../ecs/Component";
import { Engine } from "../../ecs";
import { componentsSchema } from "../scenes/Main";
import Position from "../components/Position";
import Velocity from "../components/Velocity";

// TODO: jests

class Manager extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    // TODO: remove, testing
    Array.from(Array(30000).keys()).forEach(i => {
      const entityId = this.newEntityId();

      if (i === 1) Player.add(entityId, { entityId }); // TODO: simplify components like this so passing entityId in schema not needed?
      Speed.add(entityId, { speed: 100 + i });
      Position.add(entityId, { x: 200 + i, y: 200 + i, z: 0 });
      Velocity.add(entityId, NullVector3);
      Sprite.add(entityId, { url: assetsPath("images/unit_T.png"), frameWidth: 32 });

      // if (i === 1) this.engine.addComponent(PLAYER, new Player(entityId));
      // // this.engine.addComponent(PLAYER, new Player(entityId));
      // this.engine.addComponent(SPEED, new Speed(entityId, 100 + i));
      // this.engine.addComponent(
      //   TRANSFORM,
      //   new Transform(entityId, { x: 200 + i, y: 200 + i, z: 0 })
      // );
      // this.engine.addComponent(PHYSICS_BODY, new PhysicsBody(entityId));
      // this.engine.addComponent(
      //   SPRITE,
      //   new Sprite(entityId, assetsPath("images/unit_T.png"), { frameWidth: 32 })
      // );
    });
  }

  update(): void {}

  destroy(): void {}
}

export default Manager;
