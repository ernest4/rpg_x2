import Component, { ComponentSchema, _i32 } from "../../ecs/Component";

class Velocity<T extends ComponentSchema> extends Component<T> {}

// export default new Velocity(Vector3);
export default new Velocity({ x: _i32(), y: _i32() });
