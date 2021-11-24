import { f32, i32, Vector3f } from "../../ecs/Component";

export const enum Components {
  Position,
  Velocity,
  Rotation,
  AngularVelocity,
  Scale,
  Speed,
  Player,
  Sprite,
  InputEvent,
  LoadSpriteEvent,
  Hitpoints,
  Name,
}

export const SCHEMA = {
  [Components.Position]: Vector3f,
  [Components.Velocity]: Vector3f,
  [Components.Rotation]: [f32("rz")],
  [Components.AngularVelocity]: [f32("az")],
  [Components.Scale]: Vector3f,
  [Components.Speed]: [i32("speed")],
  [Components.Player]: [],
  [Components.Sprite]: [i32("url"), i32("frameWidth"), i32("phaserSprite")],
  [Components.InputEvent]: [i32("type"), i32("key"), i32("targetEntityId")],
  [Components.LoadSpriteEvent]: [
    i32("url"),
    i32("frameWidth"),
    i32("frameHeight"),
    i32("startFrame"),
    i32("endFrame"),
    i32("margin"),
    i32("spacing"),
    i32("targetEntityId"),
  ],
  [Components.Hitpoints]: [i32("hitpoints")],
  [Components.Name]: [i32("name")],
} as const;

// TODO: for scene editor
// export const COMPONENT_NAMES = {};
// Object.keys(SCHEMA).forEach(componentId => {
//   COMPONENT_NAMES[componentId] = Components[componentId]; // Doesnt work...
// });
