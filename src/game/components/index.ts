// import DragEvent from "./DragEvent";
import Component, { Vector2f } from "../../ecs/Component";
// import InputEvent from "./InputEvent";
// // import Interactive from "./Interactive";
// import InteractiveEvent from "./InteractiveEvent_legacy";
// // import PhysicsBody from "./PhysicsBody";
// import Player from "./Player";
// import Sprite from "./Sprite";

// import Transform from "./Transform";

export const Velocity = new Component(Vector2f);
export const Position = new Component(Vector2f);

export default {
  [Velocity.id]: Velocity,
  [Position.id]: Position,
};

// export const schema = {
//   // // DragEvent,
//   // InputEvent,
//   // // Interactive,
//   // InteractiveEvent,
//   // // PhysicsBody,
//   // Player,
//   // Sprite,
//   // // Transform,
//   Velocity: new Component(Vector2i),
// };
