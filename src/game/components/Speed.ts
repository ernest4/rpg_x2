import Component, { ComponentSchema, FieldTypes } from "../../ecs/Component";

class Speed<T extends ComponentSchema> extends Component<T> {}

export default new Speed({ speed: FieldTypes.Number });
