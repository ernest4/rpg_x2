import Component from "../../ecs/Component";
import { EntityId } from "../../ecs/types";

class SerializeEvent extends Component {
  constructor(entityId: EntityId) {
    super(entityId);
  }
}

export default SerializeEvent;
