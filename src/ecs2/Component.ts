import { ComponentClass, EntityId } from "./types";
import Serializable from "./component/interfaces/Serializable";
import SparseSet from "./utils/SparseSet";

export type ComponentSchema = { [key: string]: number | string | Object };
// NOTE: custom components will extend this.
// NOTE: NO OTHER METHODS ON COMPONENTS (except getters/setters) !!!

// TODO: jests
class Component<T extends ComponentSchema> {
  signatureId: number;
  private _values: { [key: string | number]: SparseSet<any> };

  constructor(signatureId, schema: T) {
    this.signatureId = signatureId;

    this._values = {}; // private

    const entries = Object.entries(schema);
    for (let i = 0; i < entries.length; i++) {
      const [field, type] = entries[i];
      this._values[field] = new SparseSet();
    }
  }

  // TODO: jests
  add = (entityId: EntityId, params: T) => {
    const entries = Object.entries(params);
    for (let i = 0; i < entries.length; i++) {
      const [field, value] = entries[i];
      this._values[field].add(entityId, value);
    }
  };

  // TODO: jests
  remove = (entityId: EntityId) => {
    const sparseSets = Object.values(this._values);
    for (let i = 0; i < sparseSets.length; i++) {
      sparseSets[i].remove(entityId);
    }
  };

  // TODO: jests
  get = (entityId: EntityId) => {
    const result = {}; // TODO: cachet this object on instance?
    const entries = Object.entries(this._values); // TODO: cache THIS after constructions of class ???
    for (let i = 0; i < entries.length; i++) {
      const [field, sparseSet] = entries[i];
      result[field] = sparseSet.getItem(entityId);
    }
    return result;
  };

  // TODO: jests
  set = () => {
    //
  };

  // // NOTE: bit dangerous as it bypasses the original constructor with constraints.
  // // use sparingly and only when necessary
  // static createNull<T extends Component>(entityId: EntityId, componentClass: ComponentClass<T>): T {
  //   return new componentClass(entityId);
  // }

  // // TODO: jests !!
  // static deserialize = <T extends Component & Serializable>(
  //   entityId: EntityId,
  //   componentClass: ComponentClass<T>,
  //   params: { [key: string]: any }
  // ): T => {
  //   const component = Component.createNull(entityId, componentClass);
  //   component.deserialize(params);
  //   return component;
  // };

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
