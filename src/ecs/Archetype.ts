import { ComponentsSchema } from "./Component";
import { EntityId } from "./types";

export type Mask = number[];
type ComponentIds = number[];
export type Fields = string[];
export type Values = any[];
// export type ComponentsSchema = { [key: number]: readonly string[] };

export type TypedArray = Float32Array | Int32Array;
export type SOA = TypedArray[];

const TYPE_TO_ARRAY = {
  f32: Float32Array,
  i32: Int32Array,
};

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
  components: { [componentId: number]: SOA } = {};
  maxEntities: number;
  componentFields: { [componentId: number]: string[] } = {};
  componentDenseLists: { [componentId: number]: TypedArray[] } = {};
  fields: string[] = [];
  denseLists: TypedArray[] = [];
  cachedComponentIds: number[] = [];
  cacheFields: string[] = [];
  dataStreamTemplate: number[] = [];

  constructor(
    mask: Mask,
    componentsSchema: ComponentsSchema,
    maxEntities: number,
    ...componentIds: number[]
  ) {
    this.mask = mask;
    this.componentIds = componentIds.sort();
    this.maxEntities = maxEntities;

    const { dataStreamTemplate: dataStream } = this;
    for (let i = 0, l = componentIds.length; i < l; i++) {
      const componentId = componentIds[i];
      dataStream.push(componentId);
      const componentSchema = componentsSchema[componentId];

      const soa: SOA = [];
      const valuesCount = componentSchema.length;
      dataStream.push(valuesCount);
      for (let k = 0; k < valuesCount; k++) {
        const [field, type] = componentSchema[k].split("_");
        const denseList = new TYPE_TO_ARRAY[type](maxEntities); // denseList per field
        soa[k] = denseList;
        this.denseLists.push(denseList); // caching
        dataStream.push(denseList);
      }
      this.components[componentId] = soa;
      // this.componentDenseLists[componentId] = denseLists;
      // this.componentFields[componentId] = fields;
      // this.fields = [...this.fields, ...fields];
      // this.denseLists = [...this.denseLists, ...denseLists];
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

  // data stream => [componentId, valuesCount, value0, value1..., componentId, valuesCount, value0,...]
  // TODO: jests !!!
  add = (
    entityId: EntityId,
    oldComponentsDataStream: number[],
    newComponentId?: number,
    newValues?: number[]
  ): void => {
    // if (this.hasEntity(entityId)) return; // TODO: is this needed?

    const { elementCount, entityIdDenseList, _sparseEntityIdList, components } = this;
    entityIdDenseList[elementCount] = entityId;

    // old components
    for (let i = 0, l = oldComponentsDataStream.length; i < l; ) {
      const componentId = oldComponentsDataStream[i];
      const valuesCount = oldComponentsDataStream[i + 1];
      const value0 = i + 2;
      const soa = components[componentId];

      for (let k = value0, ll = value0 + valuesCount; k < ll; k++) {
        const zeroIndexed = k - value0;
        const newValue = oldComponentsDataStream[k];
        soa[zeroIndexed][elementCount] = newValue;
      }

      i += 1 + 1 + valuesCount;
    }

    // new component
    if (newValues) {
      const valuesCount = newValues.length;
      const soa = components[newComponentId];

      for (let k = 0; k < valuesCount; k++) {
        soa[k][elementCount] = newValues[k];
      }
    }

    _sparseEntityIdList[entityId] = elementCount;
    this.elementCount++;
  };

  // // TODO: jests !!!
  // add = (entityId: EntityId, componentIds: ComponentIds, fields: Fields, values: Values): void => {
  //   // if (this.hasEntity(entityId)) return; // TODO: is this needed?

  //   const { elementCount, entityIdDenseList, _sparseEntityIdList, components } = this;
  //   entityIdDenseList[elementCount] = entityId;

  //   // TODO: can optimize this further by reducing indirection?
  //   // pass in another array that specifies how many iterations per componentId?
  //   for (let i = 0, l = componentIds.length; i < l; i++) {
  //     const component = components[componentIds[i]];
  //     if (!component) continue;
  //     component[fields[i]][elementCount] = values[i];
  //   }

  //   _sparseEntityIdList[entityId] = elementCount;
  //   this.elementCount++;
  // };

  // TODO: jests !!!
  remove = (entityId: EntityId): number[] => {
    // if (!this.hasEntity(entityId)) return; // TODO: is this needed?

    const { _sparseEntityIdList, elementCount, entityIdDenseList, dataStreamTemplate } = this;
    const denseListIndex = _sparseEntityIdList[entityId];
    _sparseEntityIdList[entityId] = TOMBSTONE_ENTITY;
    // swap ids of last entity with deleted entity to overwrite
    const lastEntityId = entityIdDenseList[elementCount - 1];
    entityIdDenseList[denseListIndex] = lastEntityId;
    _sparseEntityIdList[lastEntityId] = denseListIndex;

    // TODO cache most of this return array? just plug the values in?
    const dataStream: number[] = [];

    const lastElement = elementCount - 1;
    for (let i = 0, l = dataStreamTemplate.length; i < l; ) {
      const componentId = dataStreamTemplate[i];
      dataStream.push(componentId);
      const valuesCount = dataStreamTemplate[i + 1];
      dataStream.push(valuesCount);
      const value0 = i + 2;

      for (let k = value0, ll = value0 + valuesCount; k < ll; k++) {
        const denseList = dataStreamTemplate[k];
        dataStream.push(denseList[denseListIndex]);
        denseList[denseListIndex] = denseList[lastElement];
      }

      i += 1 + 1 + valuesCount;
    }

    this.elementCount--;
    return dataStream;
  };

  // TODO: jests !!!
  destroy = (entityId: EntityId): void => {
    // if (!this.hasEntity(entityId)) return; // TODO: is this needed?

    const { _sparseEntityIdList, elementCount, entityIdDenseList, denseLists } = this;
    const denseListIndex = _sparseEntityIdList[entityId];
    _sparseEntityIdList[entityId] = TOMBSTONE_ENTITY;
    // swap ids of last entity with deleted entity to overwrite
    const lastElement = elementCount - 1;
    const lastEntityId = entityIdDenseList[lastElement];
    entityIdDenseList[denseListIndex] = lastEntityId;
    _sparseEntityIdList[lastEntityId] = denseListIndex;

    for (let k = 0, ll = denseLists.length; k < ll; k++) {
      const valuesDenseList = denseLists[k];
      // replace with last item to 'delete' but keep list packed
      valuesDenseList[denseListIndex] = valuesDenseList[lastElement];
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

  // // TODO: jests !!!
  // getEntity = (
  //   entityId: EntityId
  // ): [{ [componentId: number]: { [componentField: string]: TypedArray } }, number] | null => {
  //   if (!this.hasEntity(entityId)) return null;

  //   const entityIndex = this.entityIdDenseList[this._sparseEntityIdList[entityId]];
  //   return [this.components, entityIndex];
  // };
}

export default Archetype;
