import Component from "./Component";
import { EntityId } from "./types";

export type Mask = number[];

// TODO: this will be optimized version of sparseSet
class Archetype {
  components: Component<any>[];
  mask: Mask;

  _elementCount: number = 0; // No elements initially
  denseEntityIdList: EntityId[] = [];
  private _sparseEntityIdList: number[] = [];

  constructor(mask: Mask, ...components: Component<any>[]) {
    // this.components = components; // TODO: create denseItemList for each field of the components
    this.mask = mask;
  }

  maskMatches = (mask: Mask): boolean => {
    for (let i = 0, l = this.mask.length; i < l; i++) {
      if (this.mask[i] !== mask[i]) return false;
    }
    return true;
  };

  hasEntity = (entityId: EntityId) => {
    return (
      this._sparseEntityIdList[entityId] < this._elementCount &&
      this.denseEntityIdList[this._sparseEntityIdList[entityId]] === entityId
    );
  };

  iterable = () => {
    // const count = this.components[0].all()[1];
    // return [...this.components, count];
  };
}

export default Archetype;

// TODO: need to get soa archetype working
// only chance to get good perf...
