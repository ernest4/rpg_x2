import { ComponentClass, EntityId } from "./types";
import Serializable from "./component/interfaces/Serializable";
import SparseSet from "./utils/SparseSet";
import SignatureIdGenerator from "./component/SignatureIdGenerator";
import QueryGroup from "./component/QueryGroup";

// export const FieldTypes = { Number: 0, String: "s", Object: new Object() };
// export type FieldType = typeof FieldTypes[keyof typeof FieldTypes];
// export type ComponentSchema = { [key: string]: FieldType };
export type ComponentSchema = { [key: string]: i32 | f32 };

// TODO: implement this POC!
export enum i32 {}
export enum f32 {}
export const _i32 = () => <i32>(<any>"i32");
export const _f32 = () => <f32>(<any>"f32");
export const Vector2 = { x: _i32(), y: _i32() };

type args = typeof Vector2;
const v: args = { x: 3, y: 9 };

// export const Vector3 = { z: FieldTypes.Number, ...Vector2 };
// export const NullVector2 = { x: 0, y: 0 };
// export const NullVector3 = { z: 0, ...NullVector2 };

// export type ComponentsSchema = { [key: string]: ComponentSchema };

// TODO: jests
class Component<T extends ComponentSchema> {
  id: number;
  private _soa: { [key: string | number]: SparseSet<number> };
  private _valueSparseSets: SparseSet<number>[];
  private _referenceSparseSet: SparseSet<any>;
  private _denseLists: any;

  constructor(schema: T) {
    this.id = SignatureIdGenerator.newSignatureId();

    // this._soa = {}; // private

    // const entries = Object.entries(schema);
    // let field;
    // let type;
    // for (let i = 0; i < entries.length; i++) {
    //   [field, type] = entries[i];
    //   this._soa[field] = new SparseSet();
    // }

    // // caching...
    // this._valueSparseSets = Object.values(this._soa);
    // this._referenceSparseSet = Object.values(this._soa)[0];
  }

  new = (params: T): T & { _componentId: number } => {
    // @ts-ignore
    params._componentId = this.id;
    // @ts-ignore
    return params;
  };

  _newSoa = () => {
    //
  };

  // // TODO: jests
  // add = (entityId: EntityId, params: T) => {
  //   let added;
  //   const entries = Object.entries(params);
  //   let field;
  //   let value;
  //   for (let i = 0; i < entries.length; i++) {
  //     [field, value] = entries[i];
  //     added = this._soa[field].add(entityId, value);
  //   }
  //   if (added !== null && this._addCallback) this._addCallback(entityId, params);
  // };

  // TODO: jests
  _add = (params: T) => {
    // let added;
    // const entries = Object.entries(params);
    // let field;
    // let value;
    // for (let i = 0; i < entries.length; i++) {
    //   [field, value] = entries[i];
    //   added = this._soa[field].add(entityId, value);
    // }
    // if (added !== null && this._addCallback) this._addCallback(entityId, params);
  };

  // // TODO: jests
  // remove = (entityId: EntityId) => {
  //   // let removed;
  //   // const sparseSets = this._valueSparseSets;
  //   // for (let i = 0; i < sparseSets.length; i++) {
  //   //   removed = sparseSets[i].remove(entityId);
  //   // }
  //   // if (removed !== null && this._removeCallback) this._removeCallback(entityId);
  // };

  // TODO: jests
  _remove = (denseListIndex: number) => {
    // let removed;
    // const sparseSets = this._valueSparseSets;
    // for (let i = 0; i < sparseSets.length; i++) {
    //   removed = sparseSets[i].remove(entityId);
    // }
    // if (removed !== null && this._removeCallback) this._removeCallback(entityId);
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
