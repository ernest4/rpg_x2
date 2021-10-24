import Component from "../../ecs/Component";
import { EntityId } from "../../ecs/types";

class Player extends Component {
  static className = () => "Player";

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
