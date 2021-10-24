import Component from "../../ecs/Component";
import { EntityId } from "../../ecs/types";
import SparseSet, { SparseSetItem } from "../../ecs/utils/SparseSet";

class NearbyCharacters extends Component {
  entityIdSet: SparseSet<SparseSetItem>;

  constructor(entityId: EntityId) {
    super(entityId);
    this.entityIdSet = new SparseSet();
  }
}

export default NearbyCharacters;
