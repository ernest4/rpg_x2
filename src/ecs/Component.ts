import { ComponentClass, EntityId } from "./types";
import Serializable from "./component/interfaces/Serializable";
import SparseSet from "./utils/SparseSet";
import SignatureIdGenerator from "./component/SignatureIdGenerator";

export const FieldTypes = { Number: 0, String: "s", Object: new Object() };
export type FieldType = typeof FieldTypes[keyof typeof FieldTypes];
export type ComponentSchema = { [key: string]: FieldType };

export const Vector2 = { x: FieldTypes.Number, y: FieldTypes.Number };
export const Vector3 = { z: FieldTypes.Number, ...Vector2 };
export const NullVector2 = { x: 0, y: 0 };
export const NullVector3 = { z: 0, ...NullVector2 };

export type ComponentsSchema = { [key: string]: ComponentSchema };

// TODO: jests
class Component<T extends ComponentSchema> {
  signatureId: number;
  private _soa: { [key: string | number]: SparseSet<FieldType> };
  private _valueSparseSets: SparseSet<FieldType>[];

  constructor(schema: T) {
    this.signatureId = SignatureIdGenerator.newSignatureId();

    this._soa = {}; // private

    const entries = Object.entries(schema);
    let field;
    let type;
    for (let i = 0; i < entries.length; i++) {
      [field, type] = entries[i];
      this._soa[field] = new SparseSet();
    }

    // caching...
    this._valueSparseSets = Object.values(this._soa);
  }

  // TODO: jests
  add = (entityId: EntityId, params: T) => {
    const entries = Object.entries(params);
    let field;
    let value;
    for (let i = 0; i < entries.length; i++) {
      [field, value] = entries[i];
      this._soa[field].add(entityId, value);
    }
  };

  // TODO: jests
  remove = (entityId: EntityId) => {
    const sparseSets = this._valueSparseSets;
    for (let i = 0; i < sparseSets.length; i++) {
      sparseSets[i].remove(entityId);
    }
  };

  // TODO: jests
  get = (entityId: EntityId) => {
    const result = {}; // TODO: cachet this object on instance?
    const entries = Object.entries(this._soa); // TODO: cache THIS after constructions of class ???
    let field;
    let sparseSet;
    for (let i = 0; i < entries.length; i++) {
      [field, sparseSet] = entries[i];
      result[field] = sparseSet.getItem(entityId);
    }
    return result;
  };

  // TODO: jests
  getField = (entityId: EntityId, field: string) => {
    this._soa[field].getItem(entityId);
  };

  // TODO: jests
  set = (entityId: EntityId, params: { [key in keyof T]: any }) => {
    const entries = Object.entries(params);
    let field;
    let value;
    for (let i = 0; i < entries.length; i++) {
      [field, value] = entries[i];
      this._soa[field].set(entityId, value);
    }
  };

  // select = () => {
  //   //
  // };

  // filters ?
  // where = () => {
  //   //
  // };

  all = () => {
    // TODO: cache value count on instance.
    const valueCount = Object.values(this._soa)[0]._elementCount;
    return [this._soa, valueCount];
  };

  // query builder?
  joins = (...components: Component<any>[]) => {
    // ...
  };

  // group builder? (this would be cached)
  // runtime errors should pop up if groups are trying to share same components
  group = (...components: Component<any>[]) => {
    // ...
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
