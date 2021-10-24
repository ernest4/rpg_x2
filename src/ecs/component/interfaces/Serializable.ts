import { EntityId } from "../../types";

// TODO: jests
interface Serializable {
  serialize(): { entityId: EntityId; [key: string]: any };
  deserialize(params: { [key: string]: any }): void;
}

export default Serializable;
