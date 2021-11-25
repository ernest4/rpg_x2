import { ComponentClass, EntityId } from "./types";
import Serializable from "./component/interfaces/Serializable";
import SignatureIdGenerator from "./component/SignatureIdGenerator";

// TODO: more number types?
// export const enum Type {
//   f32,
//   i32,
// }
export const i32 = <T extends string>(field: T) => `_${field}_i32` as const;
export const f32 = <T extends string>(field: T) => `_${field}_f32` as const;
export const string = <T extends string>(field: T) => `string_${field}_i32` as const;

export const Vector2i = [i32("x"), i32("y")] as const;
export const Vector2f = [f32("x"), f32("y")] as const;
export const Vector3i = [...Vector2i, i32("z")] as const;
export const Vector3f = [...Vector2f, f32("z")] as const;
// export const Vector3f = <X extends string, Y extends string, Z extends string>(x: X, y: Y, z: Z) =>
//   [i32(x), i32(y), f32(z)] as const;

export const NullVector3 = [0, 0, 0] as const;

type KeyAndType = string;
export type ComponentsSchema = { [componentId: number]: readonly KeyAndType[] };
// export type ComponentsSchema = { [componentId: number]: Component<any> };

// export const FieldTypes = { Number: 0, String: "s", Object: new Object() };
// export type FieldType = typeof FieldTypes[keyof typeof FieldTypes];
// export type ComponentSchema = { [key: string]: FieldType };
// export type ComponentSchema = { [key: string]: i32 | f32 };

// export enum i32 {}
// export enum f32 {}
// export const _i32 = () => <i32>(<any>"i32");
// export const _f32 = () => <f32>(<any>"f32");
// export const Vector2i = { x: _i32(), y: _i32() };
// export const Vector2f = { x: _f32(), y: _f32() };
// export const Vector3i = { z: _f32(), ...Vector2i };
// export const Vector3f = { z: _f32(), ...Vector2f };
// export const Floats32 = <T extends string>(...fields: T[]): { [key in T]: i32 } => {
//   const object = {};
//   fields.forEach(field => {
//     // @ts-ignore
//     object[field] = _f32();
//   });
//   // @ts-ignore
//   return object;
// };

// type args = typeof Vector2i;
// const v: args = { x: 3, y: 9 };

// export const Vector3 = { z: FieldTypes.Number, ...Vector2 };
// export const NullVector2 = { x: 0, y: 0 };
// export const NullVector3 = { z: 0, ...NullVector2 };

// export type ComponentsSchema = { [key: string]: ComponentSchema };

// TODO: jests
// class Component<T extends ComponentSchema> {
//   id: number;
//   private _schema: T;

//   constructor(id: number, schema: T) {
//     this.id = id;
//     this._schema = schema;
//   }

//   new = (params: { [key in keyof T]: T[key] }): { [key in keyof T]: T[key] } & {
//     _componentInstance: Component<T>;
//   } => {
//     // modifying over making new object to avoid allocations...
//     // @ts-ignore
//     params._componentInstance = this;
//     // @ts-ignore
//     return params;
//   };

//   _newSoa = (maxEntities: number): [SOA, string[], TypedArray[]] => {
//     const soa: SOA = {};
//     const fields: string[] = [];
//     const denseLists: TypedArray[] = [];
//     const componentSchemaEntries = Object.entries(this._schema);
//     for (let j = 0, ll = componentSchemaEntries.length; j < ll; j++) {
//       const [field, type] = componentSchemaEntries[j];
//       const denseList = new TYPE_TO_ARRAY[type](maxEntities); // denseList per field
//       soa[field] = denseList;
//       fields.push(field);

//       denseLists.push(denseList);
//     }
//     return [soa, fields, denseLists];
//   };

//   // // TODO: jests
//   // add = (entityId: EntityId, params: T) => {
//   //   let added;
//   //   const entries = Object.entries(params);
//   //   let field;
//   //   let value;
//   //   for (let i = 0; i < entries.length; i++) {
//   //     [field, value] = entries[i];
//   //     added = this._soa[field].add(entityId, value);
//   //   }
//   //   if (added !== null && this._addCallback) this._addCallback(entityId, params);
//   // };

//   // TODO: jests
//   _add = (params: T) => {
//     // let added;
//     // const entries = Object.entries(params);
//     // let field;
//     // let value;
//     // for (let i = 0; i < entries.length; i++) {
//     //   [field, value] = entries[i];
//     //   added = this._soa[field].add(entityId, value);
//     // }
//     // if (added !== null && this._addCallback) this._addCallback(entityId, params);
//   };

//   // // TODO: jests
//   // remove = (entityId: EntityId) => {
//   //   // let removed;
//   //   // const sparseSets = this._valueSparseSets;
//   //   // for (let i = 0; i < sparseSets.length; i++) {
//   //   //   removed = sparseSets[i].remove(entityId);
//   //   // }
//   //   // if (removed !== null && this._removeCallback) this._removeCallback(entityId);
//   // };

//   // TODO: jests
//   _remove = (denseListIndex: number) => {
//     // let removed;
//     // const sparseSets = this._valueSparseSets;
//     // for (let i = 0; i < sparseSets.length; i++) {
//     //   removed = sparseSets[i].remove(entityId);
//     // }
//     // if (removed !== null && this._removeCallback) this._removeCallback(entityId);
//   };

//   // // NOTE: bit dangerous as it bypasses the original constructor with constraints.
//   // // use sparingly and only when necessary
//   // static createNull<T extends Component>(entityId: EntityId, componentClass: ComponentClass<T>): T {
//   //   return new componentClass(entityId);
//   // }

//   // // TODO: jests !!
//   // static deserialize = <T extends Component & Serializable>(
//   //   entityId: EntityId,
//   //   componentClass: ComponentClass<T>,
//   //   params: { [key: string]: any }
//   // ): T => {
//   //   const component = Component.createNull(entityId, componentClass);
//   //   component.deserialize(params);
//   //   return component;
//   // };

//   // // TODO: wip use Proxy ??
//   // trackChanges = (...fields: string[]) => {
//   //   fields.forEach(field => {
//   //     this[field] = this.changeTracker(field);
//   //   });
//   // };

//   // hasChanged = (field?: string): boolean => {
//   //   // TODO: ...check all by default, otherwise specific field
//   // };

//   // private changeTracker = (field: string) => {
//   //   // TODO: ...
//   // };
// }

// export default Component;
