import Component, { ComponentsSchema, FieldType } from "./Component";
import { EntityId } from "./types";

export type Mask = number[];
type ComponentIds = number[];
type Fields = string[];
type Values = any[];

// this is optimized version of sparseSet...
// TODO: jests !!!
class Archetype {
  mask: Mask;
  componentIds: ComponentIds;

  elementCount: number = 0; // No elements initially
  denseEntityIdList: EntityId[] = [];
  private _sparseEntityIdList: number[] = [];
  components: { [componentId: number]: { [componentField: string]: any[] } };

  constructor(mask: Mask, componentsSchema: ComponentsSchema, ...componentIds: number[]) {
    this.mask = mask;
    this.componentIds = componentIds;

    this.components = {};
    let soa: { [componentField: string]: FieldType[] };
    for (let i = 0, l = componentIds.length; i < l; i++) {
      const componentSchemaEntries = Object.entries(componentsSchema[i]);
      for (let j = 0, ll = componentSchemaEntries.length; j < ll; j++) {
        const [field, fieldType] = componentSchemaEntries[j];
        soa[field] = []; // denseList per field
      }
      this.components[i] = soa;
    }
  }

  maskMatches = (mask: Mask): boolean => {
    for (let i = 0, l = this.mask.length; i < l; i++) {
      if (this.mask[i] !== mask[i]) return false;
    }
    return true;
  };

  maskContains = (subMask: Mask) => {
    for (let i = 0, l = subMask.length; i < l; i++) {
      if (this.mask[i] !== subMask[i]) return false;
    }
    return true;
  };

  hasEntity = (entityId: EntityId) => {
    return (
      this._sparseEntityIdList[entityId] < this.elementCount &&
      this.denseEntityIdList[this._sparseEntityIdList[entityId]] === entityId
    );
  };

  // TODO: refactor this? more linear arrays
  // array of component ids?
  // array of fields?
  // array of values?
  // less of this object decomposing into arrays stuff...
  add = (
    entityId: EntityId,
    newComponents: { [componentId: number]: { [componentField: string]: any } }
  ): void => {
    const { elementCount, denseEntityIdList, _sparseEntityIdList, components } = this;

    denseEntityIdList[elementCount] = entityId;

    const newComponentsEntries = Object.entries(newComponents);
    for (let i = 0, l = newComponentsEntries.length; i < l; i++) {
      const [newComponentId, newComponentValues] = newComponentsEntries[i];
      const newComponentEntries = Object.entries(newComponentValues);
      for (let j = 0, ll = newComponentEntries.length; j < ll; j++) {
        const [field, value] = newComponentEntries[j];
        components[newComponentId][field][elementCount] = value;
      }
    }

    _sparseEntityIdList[entityId] = elementCount;
    this.elementCount++;
  };

  remove = (entityId: EntityId): [ComponentIds, Fields, Values] => {
    // if (!this.hasEntity(entityId)) return; // TODO: is this needed?

    const { _sparseEntityIdList, elementCount, denseEntityIdList } = this;
    // [1, 1, 2,...]
    // [x, y, name,...]
    // [123, 456, 'abc',...]
    const componentIds: ComponentIds = [];
    const fields: Fields = [];
    const values: Values = [];

    const denseListIndex = _sparseEntityIdList[entityId];

    for (let i = 0, l = this.componentIds.length; i < l; i++) {
      const componentId = this.componentIds[i];
      const componentEntries = Object.entries(this.components[componentId]);
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
    _sparseEntityIdList[lastEntityId] = denseListIndex;

    this.elementCount--;
    return [componentIds, fields, values];
  };

  get = () => {
    //
  };
}

export default Archetype;

// TODO: need to get soa archetype working
// only chance to get good perf...
