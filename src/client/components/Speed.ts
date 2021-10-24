import Component from "../../ecs/Component";
import { EntityId } from "../../ecs/types";

class Speed extends Component {
  speed: number;

  constructor(entityId: EntityId, speed: number) {
    super(entityId);
    this.speed = speed;
  }
}

export default Speed;
