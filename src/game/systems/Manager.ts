import System from "../../ecs/System";
// import { Player, Sprite } from "../components";
import SCHEMA, { Components } from "../components";
import PhysicsBody from "../components/PhysicsBody";
import Speed from "../components/Speed";
import Transform from "../components/Transform";
import { assetsPath } from "../../utils/environment";
import { Engine } from "../../ecs";
// import Velocity from "../components/Velocity";

// TODO: jests

const enum C {
  Pos,
  Vel,
  Sca,
}

// const SCH = {
//   [C.Pos]: ["x", "y", "z"],
// } as const;

// type sch = { [key: number]: readonly string[] };

// const func = <T extends readonly [] | readonly any[]>(
//   // const func = <K extends sch, N extends number, T extends K[N]>(
//   // schema: K,
//   componentId: number,
//   keys: T,
//   values: { [key in keyof T]: any } // this enforces same length of the two arrays
// ) => {};

// // func(SCH, C.Pos, ["x", "y", "z"], [0, 0, 0]);
// func(C.Pos, SCH[C.Pos], [0, 0, 0]);

// const enum Types {
//   f32 = "f32",
//   i32 = "i32",
// }

// const SCH = {
//   [C.Pos]: { x: Types.f32, y: Types.f32, z: Types.f32 },
//   [C.Vel]: { x: Types.f32, y: Types.f32 },
// } as const;

// type sch = { [key: number]: { [key: string]: Types } };

// const func = <T extends K[N], K extends sch, N extends number>(
//   // const func = <K extends sch, N extends number, T extends K[N]>(
//   schema: K,
//   componentId: N,
//   values: T // this enforces same length of the two arrays
// ) => {};

// func(SCH, C.Pos, { x: 7, y: 0, z: 3 });

// this.addComponent(Component.Position, ["x", "y", "z"], [0, 0, 0])

// // helper functions
// const i32 = <T extends string>(field: T) => `${field}_i32` as const;

// const SCH = {
//   // [C.Pos]: ["x_i32", "y_i32", "z"], // No type assumes i32 ?
//   [C.Pos]: [i32("x"), "y_i32", "z_i32"],
//   [C.Vel]: ["x_f32", "y_f32"],
// } as const;

// type sch = { [key: number]: readonly string[] };

// const func = <T extends readonly [] | readonly any[]>(
//   // const func = <K extends sch, N extends number, T extends K[N]>(
//   // schema: K,
//   componentId: number,
//   keys: T,
//   values: { [key in keyof T]: any } // this enforces same length of the two arrays
// ) => {};

// // func(SCH, C.Pos, ["x", "y", "z"], [0, 0, 0]);
// func(C.Pos, SCH[C.Pos], [0, 0, 0]);

// helper functions
const i32 = <T extends string>(field: T) => `${field}_i32` as const;

const SCH = {
  // [C.Pos]: ["x_i32", "y_i32", "z"], // No type assumes i32 ?
  [C.Pos]: [i32("x"), "y_i32", "z_i32"],
  [C.Vel]: ["x_f32", "y_f32"],
} as const;

type sch = { [key: number]: readonly string[] };

const func = <T extends readonly [] | readonly any[]>(
  // const func = <K extends sch, N extends number, T extends K[N]>(
  // schema: K,
  componentId: number,
  keys: T,
  values: { [key in keyof T]: any } // this enforces same length of the two arrays
) => {};

// sketch
// func(engine.schema[C.Pos].new(...));

class Manager extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    // TODO: remove, testing
    Array.from(Array(30000).keys()).forEach(i => {
      const entityId = this.newEntityId();

      // this.removeComponent(Components.Player, entityId);
      // this.addComponent(entityId, Velocity.new({ x: 5, y: 45, z: 0 }));
      this.addComponent(entityId, SCHEMA[Components.Velocity].new({ x: 0, y: 0, z: 0 }));

      if (i === 1) this.addComponent(entityId, CID.Player, SCHEMA[CID.Player], []);
      this.addComponent(entityId, CID.Speed, SCHEMA[CID.Speed], [100 + i]);
      this.addComponent(entityId, CID.Position, SCHEMA[CID.Position], [200 + i, 200 + i, 0]);
      this.addComponent(entityId, CID.Velocity, SCHEMA[CID.Velocity], NullVector3);
      // this.addComponent(entityId, Components.Sprite, SCHEMA[Components.Sprite], [
      //   assetsPath("images/unit_T.png"),
      //   32,
      // ]);

      // if (i === 1) this.addComponent(SCHEMA, Components.Player, entityId, {});
      // this.addComponent(SCHEMA, Components.Speed, entityId, { speed: 100 + i });
      // this.addComponent(SCHEMA, Components.Position, entityId, {
      //   x: 200 + i,
      //   y: 200 + i,
      //   z: 0,
      // });
      // this.addComponent(SCHEMA, Components.Velocity, entityId, { x: 0, y: 0, z: 0 });
      // this.addComponent(SCHEMA, Components.Sprite, entityId, {
      //   url: assetsPath("images/unit_T.png"),
      //   frameWidth: 32,
      // });
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
