import Component, { ComponentSchema } from "../Component";
import { EntityId } from "../types";

class QueryGroup<T extends ComponentSchema, K extends ComponentSchema> {
  private _component1: Component<T>;
  private _component2: Component<K>;
  private _groupedItemsCount: number = 0;

  constructor(component1: Component<T>, component2: Component<K>) {
    this._component1 = component1;
    this._component2 = component2;
    this.registerEventListeners();
    this.setQueryGroupOnComponents();
  }

  all = () => {
    return [this._component1.all()[0], this._component2.all()[0], this._groupedItemsCount];
  };

  private registerEventListeners = () => {
    this._component1.registerAddEventListener((entityId: EntityId, params: T) => {
      if (this._component2.hasId(entityId)) {
        // TODO: group...
      }
    });

    this._component1.registerRemoveEventListener((entityId: EntityId) => {
      if (this._component2.hasId(entityId)) {
        // TODO: if grouped, ungroup
      }
    });

    this._component2.registerAddEventListener((entityId: EntityId, params: K) => {
      //
    });

    this._component2.registerRemoveEventListener((entityId: EntityId) => {
      //
    });
  };

  private setQueryGroupOnComponents = () => {
    this._component1.setQueryGroup(this);
    this._component2.setQueryGroup(this);
  };
}

export default QueryGroup;
