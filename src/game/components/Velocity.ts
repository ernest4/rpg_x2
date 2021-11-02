import Component, { ComponentSchema, FieldTypes, Vector3 } from "../../ecs/Component";

class Velocity<T extends ComponentSchema> extends Component<T> {}

export default new Velocity(Vector3);
