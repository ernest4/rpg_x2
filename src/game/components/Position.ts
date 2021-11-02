import Component, { ComponentSchema, FieldTypes, Vector3 } from "../../ecs/Component";

class Position<T extends ComponentSchema> extends Component<T> {}

export default new Position(Vector3);
