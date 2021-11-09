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
const TOMBSTONE_ENTITY = 1e6 - 1;
// this is optimized version of sparseSet...
class Archetype {
  mask: Mask;
  componentIds: ComponentIds;

  elementCount: number = 0; // No elements initially
  denseEntityIdList: EntityId[] = [];
  private _sparseEntityIdList: Uint32Array = new Uint32Array(MAX_SPARSE_ENTITIES).fill(
    TOMBSTONE_ENTITY
  ); // TODO: 1e6 enough??
  components: { [componentId: number]: { [componentField: string]: TypedArray } };
  maxEntities: number;

  constructor(
    mask: Mask,
    componentsSchema: ComponentsSchema,
    maxEntities: number,
    ...componentIds: number[]
  ) {
    this.mask = mask;
    this.componentIds = componentIds;
    this.maxEntities = maxEntities;

    this.components = {};
    for (let i = 0, l = componentIds.length; i < l; i++) {
      const componentId = componentIds[i];
      const componentInstance = componentsSchema[componentId];
      this.components[componentId] = componentInstance._newSoa(maxEntities);
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

  // TODO: jests !!!
  // TODO: optimize with tombstone lookup https://skypjack.github.io/2020-08-02-ecs-baf-part-9/
  hasEntity = (entityId: EntityId) => {
    const { _sparseEntityIdList } = this;
    const entityIdIndex = _sparseEntityIdList[entityId];
    return entityIdIndex < this.elementCount && entityIdIndex !== TOMBSTONE_ENTITY;
  };

  // TODO: jests !!!
  add = (entityId: EntityId, componentIds: ComponentIds, fields: Fields, values: Values): void => {
    // if (this.hasEntity(entityId)) return; // TODO: is this needed?
    const { elementCount, denseEntityIdList, _sparseEntityIdList, components } = this;

    denseEntityIdList[elementCount] = entityId;

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

    const { _sparseEntityIdList, elementCount, denseEntityIdList, components } = this;
    // [1, 1, 2,...]
    // [x, y, name,...]
    // [123, 456, 'abc',...]

    // TODO: caching!!
    const componentIds: ComponentIds = []; // TODO: cache on class no initialization
    const fields: Fields = []; // TODO: cache on class no initialization
    const values: Values = [];

    const denseListIndex = _sparseEntityIdList[entityId];

    // TODO: once above cached, i think this can become single for loop
    for (let i = 0, l = this.componentIds.length; i < l; i++) {
      const componentId = this.componentIds[i];
      const componentEntries = Object.entries(components[componentId]);
      for (let j = 0, ll = componentEntries.length; i < ll; i++) {
        // capture data
        componentIds.push(componentId);
        const [field, valuesDenseList] = componentEntries[j];
        fields.push(field);
        values.push(valuesDenseList[denseListIndex]);
        // replace with last item to 'delete' but keep list packed
        valuesDenseList[denseListIndex] = valuesDenseList[elementCount - 1];
      }
    }

    // swap ids of last entity with deleted entity to overwrite
    const lastEntityId = denseEntityIdList[elementCount - 1];
    denseEntityIdList[denseListIndex] = lastEntityId;
    // _sparseEntityIdList[lastEntityId] = denseListIndex;
    _sparseEntityIdList[lastEntityId] = TOMBSTONE_ENTITY;

    this.elementCount--;
    return [componentIds, fields, values];
  };

  // TODO: jests !!!
  destroy = (entityId: EntityId): void => {
    // if (!this.hasEntity(entityId)) return; // TODO: is this needed?

    const { _sparseEntityIdList, elementCount, denseEntityIdList, componentIds, components } = this;

    const denseListIndex = _sparseEntityIdList[entityId];

    // TODO: once above cached, i think this can become single for loop
    for (let i = 0, l = componentIds.length; i < l; i++) {
      const componentId = componentIds[i];
      const componentEntries = Object.entries(components[componentId]);
      for (let j = 0, ll = componentEntries.length; i < ll; i++) {
        const [field, valuesDenseList] = componentEntries[j];
        // replace with last item to 'delete' but keep list packed
        valuesDenseList[denseListIndex] = valuesDenseList[elementCount - 1];
      }
    }

    // swap ids of last entity with deleted entity to overwrite
    const lastEntityId = denseEntityIdList[elementCount - 1];
    denseEntityIdList[denseListIndex] = lastEntityId;
    _sparseEntityIdList[lastEntityId] = denseListIndex;

    this.elementCount--;
  };

  // TODO: jests !!!
  get = () => {
    //
  };

  // TODO: jests !!!
  getEntityIndexUnchecked = (entityId: EntityId) => {
    return this.denseEntityIdList[this._sparseEntityIdList[entityId]];
  };

  // TODO: jests !!!
  getEntity = (
    entityId: EntityId
  ): [{ [componentId: number]: { [componentField: string]: TypedArray } }, number] | null => {
    if (!this.hasEntity(entityId)) return null;

    const entityIndex = this.denseEntityIdList[this._sparseEntityIdList[entityId]];
    return [this.components, entityIndex];
  };
}

export default Archetype;

// TODO: need to get soa archetype working
// only chance to get good perf...
