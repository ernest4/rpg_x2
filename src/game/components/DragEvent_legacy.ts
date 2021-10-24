import Component from "../../ecs/Component";
import { EntityId } from "../../ecs/types";

class DragEvent extends Component {
  dragX!: number;
  dragY!: number;

  constructor(entityId: EntityId) {
    super(entityId);
  }
}

export default DragEvent;
