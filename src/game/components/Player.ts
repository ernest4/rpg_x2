import Component, { ComponentSchema, FieldTypes, Vector3 } from "../../ecs/Component";

class Player<T extends ComponentSchema> extends Component<T> {}

export default new Player({ entityId: FieldTypes.Number });
