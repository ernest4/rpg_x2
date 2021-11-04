import Component, { ComponentSchema } from "../Component";
import { EntityId } from "../types";

class QueryGroup<T extends ComponentSchema, K extends ComponentSchema> {
  private _component1: Component<T>;
  private _component2: Component<K>;
  private _groupedItemsCount: number = 0;
  _componentGroupPointer: number = 0;

  constructor(component1: Component<T>, component2: Component<K>) {
    this._component1 = component1;
    this._component2 = component2;
    this.initializeGrouping();
    this.setQueryGroupOnComponents();
  }

  all = () => {
    return [this._component1.all()[0], this._component2.all()[0], this._groupedItemsCount] as const;
  };

  private initializeGrouping = () => {
    const entityIds = this._component1._referenceSparseSet.denseIdList;
    const count = this._component1._referenceSparseSet._elementCount;
    for (let i = 0; i < count; i++) {
      if (this.entityInGroup(entityIds[i])) this.addToGroup(entityIds[i]);
    }
  };

  entityInGroup = (entityId: EntityId) => {
    return this._component1.hasId(entityId) && this._component2.hasId(entityId);
  };

  addToGroup = (entityId: EntityId) => {
    this._component1.swap(
      // TODO: cache this denseIdList ?!?!
      this._component1._referenceSparseSet.denseIdList[this._componentGroupPointer],
      entityId
    );
    this._component2.swap(
      this._component2._referenceSparseSet.denseIdList[this._componentGroupPointer],
      entityId
    );
    this._groupedItemsCount++;
  };

  removeFromGroup = (entityId: EntityId) => {
    this._component1.swap(
      // TODO: cache this denseIdList ?!?!
      this._component1._referenceSparseSet.denseIdList[this._componentGroupPointer - 1],
      entityId
    );
    this._component2.swap(
      this._component2._referenceSparseSet.denseIdList[this._componentGroupPointer - 1],
      entityId
    );
    this._groupedItemsCount--;
  };

  private setQueryGroupOnComponents = () => {
    this._component1.setQueryGroup(this);
    this._component2.setQueryGroup(this);
  };
}

export default QueryGroup;
