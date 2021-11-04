class SparseSet<T> {
  denseIdList: number[];
  denseItemList: T[];
  _elementCount: number = 0; // No elements initially
  private _sparseList: number[];

  constructor() {
    this.denseIdList = []; // EntityIds
    this.denseItemList = []; // Components
    this._sparseList = [];
  }

  // TODO: jests
  hasId = (id: number) => {
    return (
      this._sparseList[id] < this._elementCount && this.denseIdList[this._sparseList[id]] === id
    );
  };

  // TODO: jests
  getUncheckedId = (id: number): number | null => this.denseIdList[this._sparseList[id]];

  // TODO: jests
  getItem = (id: number): T | null => {
    return this.hasId(id) ? this.denseItemList[this._sparseList[id]] : null;
  };

  // TODO: jests
  getUncheckedItem = (id: number): T | null => this.denseItemList[this._sparseList[id]];

  // Inserts a new element into set
  add = (id: number, item: T): T | null => {
    const elementCount = this._elementCount;

    // Corner cases, x must not be out of
    // range, dense[] should not be full and
    // x should not already be present
    // if (x > maxValue) return;
    // if (n >= capacity) return;
    // if (this.get(itemId) !== null) return null;
    if (this.hasId(id)) return null;

    // Inserting into array-dense[] at index 'n'.
    this.denseIdList[elementCount] = id;
    this.denseItemList[elementCount] = item;

    // Mapping it to sparse[] array.
    this._sparseList[id] = elementCount;

    // Increment count of elements in set
    this._elementCount = elementCount + 1;

    return item;
  };

  // TODO: jests
  // Inserts a new element into set
  addUnchecked = (id: number, item: T): T | null => {
    const elementCount = this._elementCount;

    // Inserting into array-dense[] at index 'n'.
    this.denseIdList[elementCount] = id;
    this.denseItemList[elementCount] = item;

    // Mapping it to sparse[] array.
    this._sparseList[id] = elementCount;

    // Increment count of elements in set
    this._elementCount = elementCount + 1;

    return item;
  };

  // TODO: jests
  set = (id: number, item: T): void => {
    // if (!this.hasId(id)) return this.add(id, item);
    if (!this.hasId(id)) return;

    this.denseItemList[this._sparseList[id]] = item;
  };

  // TODO: jests
  remove = (id: number): T | null => {
    const sparseList = this._sparseList;
    const denseIdList = this.denseIdList;
    const denseItemList = this.denseItemList;
    const elementCount = this._elementCount;

    // If x is not present
    if (!this.hasId(id)) return null;

    const denseListIndex = sparseList[id];

    const lastId = denseIdList[elementCount - 1]; // Take an element from end
    denseIdList[denseListIndex] = lastId; // Overwrite.
    sparseList[lastId] = denseListIndex; // Overwrite.

    // Take last item from end and overwrite
    const removedItem = denseItemList[denseListIndex];
    denseItemList[denseListIndex] = denseItemList[elementCount - 1];

    // Since one element has been deleted, we
    // decrement 'n' by 1.
    this._elementCount = elementCount - 1;
    return removedItem;
  };

  // TODO: jests
  removeUnchecked = (id: number): T | null => {
    const sparseList = this._sparseList;
    const denseIdList = this.denseIdList;
    const denseItemList = this.denseItemList;
    const elementCount = this._elementCount;

    const denseListIndex = sparseList[id];

    const lastId = denseIdList[elementCount - 1]; // Take an element from end
    denseIdList[denseListIndex] = lastId; // Overwrite.
    sparseList[lastId] = denseListIndex; // Overwrite.

    // Take last item from end and overwrite
    const removedItem = denseItemList[denseListIndex];
    denseItemList[denseListIndex] = denseItemList[elementCount - 1];

    // Since one element has been deleted, we
    // decrement 'n' by 1.
    this._elementCount = elementCount - 1;
    return removedItem;
  };

  // TODO: jests
  swap = (idA: number, idB: number) => {
    // TODO: safe checks?
    const sparseList = this._sparseList;
    const denseIdList = this.denseIdList;
    const denseItemList = this.denseItemList;

    // swap denseListIds
    const denseListIndexB = sparseList[idB];
    const denseListIndexA = sparseList[idA];
    denseIdList[denseListIndexA] = idB;
    sparseList[idB] = denseListIndexA;
    denseIdList[denseListIndexB] = idA;
    sparseList[idA] = denseListIndexB;

    // swap denseListItems
    const itemB = denseItemList[denseListIndexB];
    const itemA = denseItemList[denseListIndexA];
    denseItemList[denseListIndexA] = itemB;
    denseItemList[denseListIndexB] = itemA;
  };

  clear = () => (this._elementCount = 0);

  iterable = (): [T[], number] => [this.denseItemList, this._elementCount];
}

export default SparseSet;
