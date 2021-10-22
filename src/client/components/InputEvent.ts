import Component from "../../shared/ecs/Component";
import Event from "../../shared/ecs/component/interfaces/Event";
import { EntityId } from "../../shared/ecs/types";
import { INPUT_EVENT_TYPE, INPUT_KEY } from "../systems/InputListener";

class InputEvent extends Component implements Event {
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
