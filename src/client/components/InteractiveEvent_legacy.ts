import Component from "../../shared/ecs/Component";
import { EntityId, InteractiveEventType } from "../../shared/ecs/types";

class InteractiveEvent extends Component {
  type!: InteractiveEventType;

  constructor(entityId: EntityId) {
    super(entityId);
  }

  // get pointerDown() {
  //   return this.type === InteractiveEventType.POINTER_DOWN;
  // }

  // get pointerUp() {
  //   return this.type === InteractiveEventType.POINTER_UP;
  // }

  // get pointerOver() {
  //   return this.type === InteractiveEventType.POINTER_OVER;
  // }

  // get pointerOut() {
  //   return this.type === InteractiveEventType.POINTER_OUT;
  // }
}

export default InteractiveEvent;
