import { ComponentClass, EntityId } from "./types";
import Serializable from "./component/interfaces/Serializable";
import SparseSet from "./utils/SparseSet";
import SignatureIdGenerator from "./component/SignatureIdGenerator";
import QueryGroup from "./component/QueryGroup";

export const FieldTypes = { Number: 0, String: "s", Object: new Object() };
export type FieldType = typeof FieldTypes[keyof typeof FieldTypes];
export type ComponentSchema = { [key: string]: FieldType };

export const Vector2 = { x: FieldTypes.Number, y: FieldTypes.Number };
export const Vector3 = { z: FieldTypes.Number, ...Vector2 };
export const NullVector2 = { x: 0, y: 0 };
export const NullVector3 = { z: 0, ...NullVector2 };

export type ComponentsSchema = { [key: number]: ComponentSchema };

// TODO: jests
abstract class Component<T extends ComponentSchema> {
  signatureId: number;
  // private _soa: { [key: string | number]: SparseSet<FieldType> };
  // private _valueSparseSets: SparseSet<FieldType>[];
  // private _referenceSparseSet: SparseSet<any>;
  // private _denseLists: any;
  // private _addCallback: (entityId: EntityId, params: T) => void;
  // private _removeCallback: (entityId: EntityId) => void;
  // private _queryGroup: QueryGroup<any, any>;

  constructor(public test: number) {
    //
  }

  // constructor(schema: T) {
  // this.signatureId = SignatureIdGenerator.newSignatureId();

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
  // }

  // // // TODO: jests
  // // registerEventListener = (functionName: "add" | "remove", callback: (...any) => void) => {
  // //   this[`_${functionName}Callback`] = callback;
  // // };

  // // TODO: jests
  // registerAddEventListener = (callback: typeof this._addCallback) => {
  //   this._addCallback = callback;
  // };

  // // TODO: jests
  // registerRemoveEventListener = (callback: typeof this._removeCallback) => {
  //   this._removeCallback = callback;
  // };

  // // TODO: jests
  // hasId = (entityId: EntityId) => this._referenceSparseSet.hasId(entityId);

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

  // // TODO: jests
  // remove = (entityId: EntityId) => {
  //   let removed;
  //   const sparseSets = this._valueSparseSets;
  //   for (let i = 0; i < sparseSets.length; i++) {
  //     removed = sparseSets[i].remove(entityId);
  //   }
  //   if (removed !== null && this._removeCallback) this._removeCallback(entityId);
  // };

  // // TODO: jests
  // get = (entityId: EntityId): ComponentSchema => {
  //   const result = {}; // TODO: cachet this object on instance?
  //   const entries = Object.entries(this._soa); // TODO: cache THIS after constructions of class ???
  //   let field;
  //   let sparseSet;
  //   for (let i = 0; i < entries.length; i++) {
  //     [field, sparseSet] = entries[i];
  //     result[field] = sparseSet.getItem(entityId);
  //   }
  //   return result;
  // };

  // // TODO: jests
  // getField = (entityId: EntityId, field: string) => {
  //   this._soa[field].getItem(entityId);
  // };

  // // TODO: jests
  // set = (entityId: EntityId, params: { [key in keyof T]: any }) => {
  //   const entries = Object.entries(params);
  //   let field;
  //   let value;
  //   for (let i = 0; i < entries.length; i++) {
  //     [field, value] = entries[i];
  //     this._soa[field].set(entityId, value);
  //   }
  // };

  // // select = () => {
  // //   //
  // // };

  // // filters ?
  // // where = () => {
  // //   //
  // // };

  // all = (): [{ [key in keyof T]: any[] }, number] => {
  //   if (this._denseLists) return [this._denseLists, this._referenceSparseSet._elementCount];

  //   // TODO: cache value count on instance.
  //   const valueCount = this._referenceSparseSet._elementCount;
  //   const result = {}; // TODO: cachet this object on instance?
  //   const entries = Object.entries(this._soa); // TODO: cache THIS after constructions of class ???
  //   let field: string;
  //   let sparseSet: SparseSet<FieldType>;
  //   for (let i = 0; i < entries.length; i++) {
  //     [field, sparseSet] = entries[i];
  //     result[field] = sparseSet.denseItemList;
  //   }
  //   this._denseLists = result; // TODO: cleaner way to cache?
  //   return [result, valueCount] as [{ [key in keyof T]: any[] }, number];
  // };

  // // query builder?
  // // joins = (...components: Component<any>[]) => {
  // //   // ...
  // // };
  // // joins = <K extends ComponentSchema>(component: Component<K>) => {
  // //   let matchCount = 0;
  // //   const valueCount = this._referenceSparseSet._elementCount;
  // //   const entityIds = this._referenceSparseSet.denseIdList;

  // //   for (let i = 0; i < valueCount; i++) {
  // //     if (component.hasId(entityIds[i])) matchCount++;
  // //   }

  // //   return [this.all(), matchCount] as const;
  // // };

  // // group builder? (this would be cached)
  // // runtime errors should pop up if groups are trying to share same components
  // // group = (...components: Component<any>[]) => {
  // //   // ...
  // // };

  // // TODO: jests
  // group = <K extends ComponentSchema>(component: Component<K>) => {
  //   // TODO: error/warn about trying to set other query groups (sharing components)?
  //   if (this._queryGroup) return this._queryGroup;

  //   return new QueryGroup(this, component);
  // };

  // setQueryGroup = <T extends ComponentSchema, K extends ComponentSchema>(
  //   queryGroup: QueryGroup<T, K>
  // ) => {
  //   this._queryGroup = queryGroup;
  // };

  // // // NOTE: bit dangerous as it bypasses the original constructor with constraints.
  // // // use sparingly and only when necessary
  // // static createNull<T extends Component>(entityId: EntityId, componentClass: ComponentClass<T>): T {
  // //   return new componentClass(entityId);
  // // }

  // // // TODO: jests !!
  // // static deserialize = <T extends Component & Serializable>(
  // //   entityId: EntityId,
  // //   componentClass: ComponentClass<T>,
  // //   params: { [key: string]: any }
  // // ): T => {
  // //   const component = Component.createNull(entityId, componentClass);
  // //   component.deserialize(params);
  // //   return component;
  // // };

  // // // TODO: wip use Proxy ??
  // // trackChanges = (...fields: string[]) => {
  // //   fields.forEach(field => {
  // //     this[field] = this.changeTracker(field);
  // //   });
  // // };

  // // hasChanged = (field?: string): boolean => {
  // //   // TODO: ...check all by default, otherwise specific field
  // // };

  // // private changeTracker = (field: string) => {
  // //   // TODO: ...
  // // };
}

export default Component;
