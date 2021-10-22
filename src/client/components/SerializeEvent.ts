import Component from "../../shared/ecs/Component";
import { EntityId } from "../../shared/ecs/types";

class SerializeEvent extends Component {
  constructor(entityId: EntityId) {
    super(entityId);
  }
}

export default SerializeEvent;
