import Component from "../../shared/ecs/Component";
import { EntityId } from "../../shared/ecs/types";

class Player extends Component {
  constructor(entityId: EntityId) {
    super(entityId);
  }

  serialize(): { [key: string]: any; entityId: EntityId } {
    const { entityId } = this;
    return { entityId };
  }

  deserialize(params: { [key: string]: any }): void {}
}

export default Player;
