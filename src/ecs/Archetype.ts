import Component, { ComponentsSchema, FieldType } from "./Component";
import { EntityId } from "./types";

export type Mask = number[];

// TODO: jests !!!

// TODO: this will be optimized version of sparseSet
class Archetype {
  mask: Mask;
  componentIds: number[];

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

  remove = (entityId: EntityId): { [componentId: number]: { [componentField: string]: any } } => {
    //
    // serialization scheme?
    // [componentId, field, value, componentId, field, value... ]
    // OR
    // soa!
    // [componentId, componentId, componentId...]
    // [field, field, field...]
    // [value, value, value, value...]
  };

  get = () => {
    //
  };
}

export default Archetype;

// TODO: need to get soa archetype working
// only chance to get good perf...
