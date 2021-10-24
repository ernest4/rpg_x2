import Component from "../../../Component";
import { EntityId } from "../../../types";

class StringComponent extends Component {
  static className = () => "StringComponent";

  testString: string;

  constructor(entityId: EntityId, testString?: string) {
    super(entityId);
    this.testString = testString || "abc";
  }
}

export default StringComponent;
