import { i32, Vector3 } from "../../ecs2/utils/types";

const EVENT = { targetEntityId: i32 };

export const enum Components {
  Transform,
  PhysicsBody,
  Speed,
  Player,
  InputEvent,
  Sprite,
  LoadSpriteEvent,
}

export const SCHEMA = {
  [Components.Transform]: { position: Vector3, rotation: Vector3, scale: Vector3 },
  [Components.PhysicsBody]: { linearVelocity: Vector3, angularVelocity: Vector3 },
  [Components.Speed]: { value: i32 },
  [Components.Player]: {},
  [Components.InputEvent]: { type: i32, key: i32, ...EVENT },
  [Components.Sprite]: {
    url: i32,
    frameConfig: {
      frameWidth: i32,
      frameHeight: i32,
      startFrame: i32,
      endFrame: i32,
      margin: i32,
      spacing: i32,
    },
  },
  [Components.LoadSpriteEvent]: {
    url: i32,
    frameConfig: {
      frameWidth: i32,
      frameHeight: i32,
      startFrame: i32,
      endFrame: i32,
      margin: i32,
      spacing: i32,
    },
    ...EVENT,
  },
};
