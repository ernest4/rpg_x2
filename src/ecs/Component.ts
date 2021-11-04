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

export type ComponentsSchema = { [key: string]: ComponentSchema };

// TODO: jests
class Component<T extends ComponentSchema> {
  signatureId: number;
  private _soa: { [key in keyof T]: SparseSet<T[key]> };
  private _valueSparseSets: SparseSet<FieldType>[];
  _referenceSparseSet: SparseSet<any>;
  private _denseLists: any;
  private _queryGroup: QueryGroup<any, any>;

  constructor(schema: T) {
    this.signatureId = SignatureIdGenerator.newSignatureId();

    // @ts-ignore
    this._soa = {}; // private

    const entries: [keyof T, FieldType][] = Object.entries(schema);
    let field;
    let type;
    for (let i = 0; i < entries.length; i++) {
      [field, type] = entries[i];
      // @ts-ignore
      this._soa[field] = new SparseSet();
    }

    // caching...
    this._valueSparseSets = Object.values(this._soa);
    this._referenceSparseSet = Object.values(this._soa)[0];
  }

  // TODO: jests
  hasId = (entityId: EntityId) => this._referenceSparseSet.hasId(entityId);

  // TODO: jests
  add = (entityId: EntityId, params: { [key in keyof T]: T[key] }) => {
    if (this._referenceSparseSet.hasId(entityId)) return;

    const entries = Object.entries(params);
    for (let i = 0; i < entries.length; i++) {
      const [field, value] = entries[i];
      this._soa[field].addUnchecked(entityId, value);
    }

    if (!this._queryGroup) return;
    if (this._queryGroup.entityInGroup(entityId)) this._queryGroup.addToGroup(entityId);
  };

  // TODO: jests
  remove = (entityId: EntityId) => {
    if (!this._referenceSparseSet.hasId(entityId)) return;
    if (this._queryGroup && this._queryGroup.entityInGroup(entityId)) {
      this._queryGroup.removeFromGroup(entityId);
    }

    const sparseSets = this._valueSparseSets;
    for (let i = 0; i < sparseSets.length; i++) {
      sparseSets[i].remove(entityId);
    }
  };

  // TODO: jests
  swap = (EntityIdA: EntityId, EntityIdB: EntityId) => {
    const sparseSets = this._valueSparseSets;
    for (let i = 0; i < sparseSets.length; i++) {
      sparseSets[i].swap(EntityIdA, EntityIdB);
    }
  };

  // TODO: jests
  get = (entityId: EntityId): { [key in keyof T]: T[key] } | null => {
    if (!this._referenceSparseSet.hasId(entityId)) return null;

    const result = {}; // TODO: cachet this object on instance?
    const entries = Object.entries(this._soa); // TODO: cache THIS after constructions of class ???
    let field;
    let sparseSet;
    for (let i = 0; i < entries.length; i++) {
      [field, sparseSet] = entries[i];
      result[field] = sparseSet.addUnchecked(entityId);
    }
    return result as { [key in keyof T]: T[key] };
  };

  // TODO: jests
  getField = (entityId: EntityId, field: keyof T) => {
    return this._soa[field].getItem(entityId);
  };

  // TODO: jests
  set = (entityId: EntityId, params: { [key in keyof T]: T[key] }) => {
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

  all = (): [{ [key in keyof T]: T[key][] }, number, number[]] => {
    if (this._denseLists) {
      return [
        this._denseLists,
        this._referenceSparseSet._elementCount,
        this._referenceSparseSet.denseIdList,
      ];
    }

    // TODO: cache value count on instance.
    const valueCount = this._referenceSparseSet._elementCount;
    const result = {}; // TODO: cachet this object on instance?
    const entries = Object.entries(this._soa); // TODO: cache THIS after constructions of class ???
    let field: string;
    let sparseSet: SparseSet<FieldType>;
    for (let i = 0; i < entries.length; i++) {
      [field, sparseSet] = entries[i];
      result[field] = sparseSet.denseItemList;
    }
    this._denseLists = result; // TODO: cleaner way to cache?
    return [result, valueCount, this._referenceSparseSet.denseIdList] as [
      { [key in keyof T]: T[key][] },
      number,
      number[]
    ];
  };

  clear = () => {
    // TODO: ... clear all components
  };

  // query builder?
  // joins = (...components: Component<any>[]) => {
  //   // ...
  // };
  // joins = <K extends ComponentSchema>(component: Component<K>) => {
  //   let matchCount = 0;
  //   const valueCount = this._referenceSparseSet._elementCount;
  //   const entityIds = this._referenceSparseSet.denseIdList;

  //   for (let i = 0; i < valueCount; i++) {
  //     if (component.hasId(entityIds[i])) matchCount++;
  //   }

  //   return [this.all(), matchCount] as const;
  // };

  // group builder? (this would be cached)
  // runtime errors should pop up if groups are trying to share same components
  // group = (...components: Component<any>[]) => {
  //   // ...
  // };

  // TODO: jests
  // TODO: subgroups
  group = <K extends ComponentSchema>(component: Component<K>): QueryGroup<T, K> => {
    // TODO: error/warn about trying to set other query groups (sharing components)?
    if (this._queryGroup) return this._queryGroup;

    return new QueryGroup(this, component);
  };

  setQueryGroup = <T extends ComponentSchema, K extends ComponentSchema>(
    queryGroup: QueryGroup<T, K>
  ) => {
    this._queryGroup = queryGroup;
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
