import Component, { ComponentSchema, FieldTypes, Vector3 } from "../../ecs/Component";

class Sprite<T extends ComponentSchema> extends Component<T> {}

export default new Sprite({ url: FieldTypes.String, frameWidth: FieldTypes.Number });
