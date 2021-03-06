import Component from "../../ecs/Component";
import Event from "../../ecs/component/interfaces/Event";
import { EntityId } from "../../ecs/types";
import { INPUT_EVENT_TYPE, INPUT_KEY } from "../systems/InputListener";

class InputEvent extends Component implements Event {
  static className = () => "InputEvent";
  
  targetEntityId: EntityId;
  type: INPUT_EVENT_TYPE;
  key: INPUT_KEY;

  constructor(
    entityId: EntityId,
    type: INPUT_EVENT_TYPE,
    key: INPUT_KEY,
    targetEntityId: EntityId
  ) {
    super(entityId);
    this.type = type;
    this.key = key;
    this.targetEntityId = targetEntityId;
  }
}

export default InputEvent;
