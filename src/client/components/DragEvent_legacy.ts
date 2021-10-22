import Component from "../../shared/ecs/Component";
import { EntityId } from "../../shared/ecs/types";

class DragEvent extends Component {
  dragX!: number;
  dragY!: number;

  constructor(entityId: EntityId) {
    super(entityId);
  }
}

export default DragEvent;
