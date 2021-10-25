import { Engine } from "../../ecs";
import System from "../../ecs/System";
import InputEvent from "../components/InputEvent";
import PhysicsBody from "../components/PhysicsBody";
import { INPUT_EVENT, PHYSICS_BODY, SPEED } from "../components/queryTags";
import Speed from "../components/Speed";
import { INPUT_EVENT_TYPES } from "./InputListener";

// TODO: jests
class MovementController extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {}

  update(): void {
    this.engine.queryOne(this.filterInputEvents, INPUT_EVENT);
  }

  destroy(): void {}

  private filterInputEvents = (inputEvent: InputEvent) => {
    this.engine.withComponents(
      components => this.applyInputEvent(inputEvent, ...(components as [PhysicsBody, Speed])),
      inputEvent.targetEntityId,
      PHYSICS_BODY,
      SPEED
    );
  };

  private applyInputEvent = (
    { type, key }: InputEvent,
    physicsBody: PhysicsBody,
    { speed }: Speed
  ) => {
    switch (key) {
      case "A":
        if (type === INPUT_EVENT_TYPES.KEYUP && physicsBody.linearVelocity.x < 0) {
          physicsBody.linearVelocity.x = 0;
          break;
        }

        if (type === INPUT_EVENT_TYPES.KEYDOWN) physicsBody.linearVelocity.x = -speed;
        break;
      case "D":
        if (type === INPUT_EVENT_TYPES.KEYUP && 0 < physicsBody.linearVelocity.x) {
          physicsBody.linearVelocity.x = 0;
          break;
        }

        if (type === INPUT_EVENT_TYPES.KEYDOWN) physicsBody.linearVelocity.x = speed;
        break;
      case "W":
        if (type === INPUT_EVENT_TYPES.KEYUP && physicsBody.linearVelocity.y < 0) {
          physicsBody.linearVelocity.y = 0;
          break;
        }

        if (type === INPUT_EVENT_TYPES.KEYDOWN) physicsBody.linearVelocity.y = -speed;
        break;
      case "S":
        if (type === INPUT_EVENT_TYPES.KEYUP && 0 < physicsBody.linearVelocity.y) {
          physicsBody.linearVelocity.y = 0;
          break;
        }

        if (type === INPUT_EVENT_TYPES.KEYDOWN) physicsBody.linearVelocity.y = speed;
        break;
    }
  };

  // private applyKeyToVelocity = (
  //   physicsBody: PhysicsBody,
  //   axis: "x" | "y",
  //   type: INPUT_EVENT_TYPES,
  //   value: number
  // ) => {
  //   if (type === INPUT_EVENT_TYPES.KEYUP && physicsBody.linearVelocity.x < 0) {
  //     physicsBody.linearVelocity[axis] = 0;
  //     return;
  //   }

  //   if (type === INPUT_EVENT_TYPES.KEYDOWN) physicsBody.linearVelocity.x = -speed;
  // };
}

export default MovementController;
