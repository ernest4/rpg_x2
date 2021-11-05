import System from "../../ecs/System";
import { Player, Sprite } from "../components";
import PhysicsBody from "../components/PhysicsBody";
import Speed from "../components/Speed";
import Transform from "../components/Transform";
import { assetsPath } from "../../utils/environment";
import { Engine } from "../../ecs";
import { Components, SCHEMA } from "../scenes/Main";

// TODO: jests

const enum C {
  Pos,
}

const SCH = {
  [C.Pos]: ["x", "y", "z"],
} as const;

type sch = { [key: number]: readonly string[] };

// const func = <K extends sch, N extends number, T extends readonly [] | readonly any[]>(
const func = <K extends sch, N extends number, T extends K[N]>(
  // schema: K,
  componentId: N,
  keys: T,
  values: { [K in keyof T]: any } // this enforces same length of the two arrays
) => {};

// func(SCH, C.Pos, ["x", "y", "z"], [0, 0, 0]);
func(C.Pos, SCH[C.Pos], [0, 0, 0]);

// this.addComponent(Component.Position, ["x", "y", "z"], [0, 0, 0])

class Manager extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    // TODO: remove, testing
    Array.from(Array(30000).keys()).forEach(i => {
      const entityId = this.newEntityId();

      // this.removeComponent(Components.Player, entityId);

      // ALT way??
      // this.addComponent(Component.Position, ["x", "y", "z"], [0, 0, 0])
      // this.addComponent(Component.Position, ["z"], [0])
      if (i === 1) this.addComponent(SCHEMA, Components.Player, entityId, {});
      this.addComponent(SCHEMA, Components.Speed, entityId, { speed: 100 + i });
      this.addComponent(SCHEMA, Components.Position, entityId, {
        x: 200 + i,
        y: 200 + i,
        z: 0,
      });
      this.addComponent(SCHEMA, Components.Velocity, entityId, { x: 0, y: 0, z: 0 });
      this.addComponent(SCHEMA, Components.Sprite, entityId, {
        url: assetsPath("images/unit_T.png"),
        frameWidth: 32,
      });

      // if (i === 1) Player.add(entityId, { entityId }); // TODO: simplify components like this so passing entityId in schema not needed?
      // Speed.add(entityId, { speed: 100 + i });
      // Position.add(entityId, { x: 200 + i, y: 200 + i, z: 0 });
      // Velocity.add(entityId, NullVector3);
      // Sprite.add(entityId, { url: assetsPath("images/unit_T.png"), frameWidth: 32 });

      // if (i === 1) this.addComponent(PLAYER, new Player(entityId));
      // // this.addComponent(PLAYER, new Player(entityId));
      // this.addComponent(SPEED, new Speed(entityId, 100 + i));
      // this.addComponent(
      //   TRANSFORM,
      //   new Transform(entityId, { x: 200 + i, y: 200 + i, z: 0 })
      // );
      // this.addComponent(PHYSICS_BODY, new PhysicsBody(entityId));
      // this.addComponent(
      //   SPRITE,
      //   new Sprite(entityId, assetsPath("images/unit_T.png"), { frameWidth: 32 })
      // );
    });
  }

  update(): void {}

  destroy(): void {}
}

export default Manager;
