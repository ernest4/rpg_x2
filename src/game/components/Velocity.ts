import Component, { ComponentSchema, FieldTypes, i32, Vector3 } from "../../ecs/Component";

class Velocity<T extends ComponentSchema> extends Component<T> {}

// export default new Velocity(Vector3);
export default new Velocity({ x: i32, y: i32 });
