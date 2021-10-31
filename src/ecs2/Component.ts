import { ComponentClass, EntityId } from "./types";
import { SparseSetItem } from "./utils/SparseSet";
import Serializable from "./component/interfaces/Serializable";

// NOTE: custom components will extend this.
// NOTE: NO OTHER METHODS ON COMPONENTS (except getters/setters) !!!
abstract class Component extends SparseSetItem {
  constructor(entityId: EntityId) {
    super(entityId);
  }

  get entityId() {
    return this.id;
  }

  // NOTE: bit dangerous as it bypasses the original constructor with constraints.
  // use sparingly and only when necessary
  static createNull<T extends Component>(entityId: EntityId, componentClass: ComponentClass<T>): T {
    return new componentClass(entityId);
  }

  // TODO: jests !!
  static deserialize = <T extends Component & Serializable>(
    entityId: EntityId,
    componentClass: ComponentClass<T>,
    params: { [key: string]: any }
  ): T => {
    const component = Component.createNull(entityId, componentClass);
    component.deserialize(params);
    return component;
  };

  // // TODO: wip use Proxy ??
  // trackChanges = (...fields: string[]) => {
  //   fields.forEach(field => {
  //     this[field] = this.changeTracker(field);
  //   });
  // };

  // hasChanged = (field?: string): boolean => {
  //   // TODO: ...check all by default, otherwise specific field
  // };

  // private changeTracker = (field: string) => {
  //   // TODO: ...
  // };
}

export default Component;
