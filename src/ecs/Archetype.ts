import { connectAdvanced } from "react-redux";
import Component, { ComponentSchema, TypedArray } from "./Component";
import { ComponentsSchema } from "./Engine";
import { EntityId } from "./types";

export type Mask = number[];
type ComponentIds = number[];
export type Fields = string[];
export type Values = any[];
// export type ComponentsSchema = { [key: number]: readonly string[] };

// const TYPE_TO_ARRAY = {
//   [Type.f32]: Float32Array,
//   [Type.i32]: Int32Array,
// };

// type TypedArray = Float32Array | Int32Array;

const MAX_SPARSE_ENTITIES = 1e6;
const TOMBSTONE_ENTITY = MAX_SPARSE_ENTITIES - 1;
// this is optimized version of sparseSet...
class Archetype {
  mask: Mask;
  componentIds: ComponentIds;

  elementCount: number = 0; // No elements initially
  entityIdDenseList: EntityId[] = [];
  private _sparseEntityIdList: Uint32Array = new Uint32Array(MAX_SPARSE_ENTITIES).fill(
    TOMBSTONE_ENTITY
  ); // TODO: 1e6 enough??
  components: { [componentId: number]: { [componentField: string]: TypedArray } } = {};
  maxEntities: number;
  componentDenseLists: { [componentId: number]: TypedArray[] } = {};
  denseLists: TypedArray[] = [];

  constructor(
    mask: Mask,
    componentsSchema: ComponentsSchema,
    maxEntities: number,
    ...componentIds: number[]
  ) {
    this.mask = mask;
    this.componentIds = componentIds;
    this.maxEntities = maxEntities;

    for (let i = 0, l = componentIds.length; i < l; i++) {
      const componentId = componentIds[i];
      const componentInstance = componentsSchema[componentId];
      // this.components[componentId] = componentInstance._newSoa(maxEntities);
      const [soa, denseLists] = componentInstance._newSoa(maxEntities);
      this.components[componentId] = soa;
      this.componentDenseLists[componentId] = denseLists;
      this.denseLists = [...this.denseLists, ...denseLists];
    }
  }

  maskMatches = (queryMask: Mask): boolean => {
    const { mask } = this;
    for (let i = 0, l = mask.length; i < l; i++) {
      if (mask[i] !== queryMask[i]) return false;
    }
    return true;
  };

  // TODO: handle edge case when subMask is [] which returns true?
  // or is that fine?
  maskContains = (subMask: Mask) => {
    const { mask } = this;
    for (let i = 0, l = subMask.length; i < l; i++) {
      if ((mask[i] & subMask[i]) !== subMask[i]) return false;
    }
    return true;
  };

  hasComponents = (...componentIds: number[]): boolean => {
    const { mask } = this;
    for (let i = 0, l = componentIds.length; i < l; i++) {
      const componentId = componentIds[i];
      if (!(mask[~~(componentId / 32)] & (1 << componentId % 32))) return false;
    }
    return true;
  };

  hasEntity = (entityId: EntityId): boolean => {
    const { _sparseEntityIdList } = this;
    const entityIdIndex = _sparseEntityIdList[entityId];
    return entityIdIndex < this.elementCount && entityIdIndex !== TOMBSTONE_ENTITY;
    // return this._sparseEntityIdList[entityId] !== TOMBSTONE_ENTITY;
    // return entityIdIndex < this.elementCount && this.entityIdDenseList[entityIdIndex] !== entityId;
  };

  // TODO: jests !!!
  add = (entityId: EntityId, componentIds: ComponentIds, fields: Fields, values: Values): void => {
    // if (this.hasEntity(entityId)) return; // TODO: is this needed?

    const { elementCount, entityIdDenseList, _sparseEntityIdList, components } = this;
    entityIdDenseList[elementCount] = entityId;

    // TODO: can optimize this further by reducing indirection?
    // pass in another array that specifies how many iterations per componentId?
    for (let i = 0, l = componentIds.length; i < l; i++) {
      const component = components[componentIds[i]];
      if (!component) continue;
      component[fields[i]][elementCount] = values[i];
    }

    _sparseEntityIdList[entityId] = elementCount;
    this.elementCount++;
  };

  // TODO: jests !!!
  remove = (entityId: EntityId): [ComponentIds, Fields, Values] => {
    // if (!this.hasEntity(entityId)) return; // TODO: is this needed?

    const { _sparseEntityIdList, elementCount, entityIdDenseList, components } = this;
    const denseListIndex = _sparseEntityIdList[entityId];
    _sparseEntityIdList[entityId] = TOMBSTONE_ENTITY;
    // swap ids of last entity with deleted entity to overwrite
    const lastEntityId = entityIdDenseList[elementCount - 1];
    entityIdDenseList[denseListIndex] = lastEntityId;
    _sparseEntityIdList[lastEntityId] = denseListIndex;

    // TODO: caching!!
    const componentIds: ComponentIds = []; // TODO: cache on class no initialization
    const fields: Fields = []; // TODO: cache on class no initialization
    const values: Values = [];
    // [1, 1, 2,...]
    // [x, y, name,...]
    // [123, 456, 'abc',...]

    // TODO: once above cached, i think this can become single for loop
    for (let i = 0, l = this.componentIds.length; i < l; i++) {
      const componentId = this.componentIds[i];
      const componentEntries = Object.entries(components[componentId]);
      for (let j = 0, ll = componentEntries.length; j < ll; j++) {
        // capture data
        componentIds.push(componentId);
        const [field, valuesDenseList] = componentEntries[j];
        fields.push(field);
        values.push(valuesDenseList[denseListIndex]);
        // replace with last item to 'delete' but keep list packed
        valuesDenseList[denseListIndex] = valuesDenseList[elementCount - 1];
      }
    }

    this.elementCount--;
    return [componentIds, fields, values];
  };

  // TODO: jests !!!
  destroy = (entityId: EntityId): void => {
    // if (!this.hasEntity(entityId)) return; // TODO: is this needed?

    const { _sparseEntityIdList, elementCount, entityIdDenseList, denseLists } = this;
    const denseListIndex = _sparseEntityIdList[entityId];
    _sparseEntityIdList[entityId] = TOMBSTONE_ENTITY;
    // swap ids of last entity with deleted entity to overwrite
    const lastEntityId = entityIdDenseList[elementCount - 1];
    entityIdDenseList[denseListIndex] = lastEntityId;
    _sparseEntityIdList[lastEntityId] = denseListIndex;

    for (let k = 0, ll = denseLists.length; k < ll; k++) {
      const valuesDenseList = denseLists[k];
      // replace with last item to 'delete' but keep list packed
      valuesDenseList[denseListIndex] = valuesDenseList[elementCount - 1];
    }

    this.elementCount--;
  };

  // TODO: jests !!!
  get = () => {
    //
  };

  // TODO: jests !!!
  getEntityIndexUnchecked = (entityId: EntityId) => {
    return this.entityIdDenseList[this._sparseEntityIdList[entityId]];
  };

  // TODO: jests !!!
  getEntity = (
    entityId: EntityId
  ): [{ [componentId: number]: { [componentField: string]: TypedArray } }, number] | null => {
    if (!this.hasEntity(entityId)) return null;

    const entityIndex = this.entityIdDenseList[this._sparseEntityIdList[entityId]];
    return [this.components, entityIndex];
  };
}

export default Archetype;

// TODO: need to get soa archetype working
// only chance to get good perf...
