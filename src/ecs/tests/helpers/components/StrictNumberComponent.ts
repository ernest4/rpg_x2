import Component from "../../../Component";
import { EntityId } from "../../../types";
import SparseSet, { SparseSetItem } from "../../../utils/SparseSet";

class StrictNumberComponent extends Component {
  static className = () => "StrictNumberComponent";

  testNumber: number;
  sparseSet: SparseSet<SparseSetItem>;

  constructor(entityId: EntityId, testNumber: number) {
    super(entityId);
    this.testNumber = testNumber;
    this.sparseSet = new SparseSet<SparseSetItem>();
  }
}

export default StrictNumberComponent;
