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
  getItem = (id: number): T | null => {
    return this.hasId(id) ? this.denseItemList[this._sparseList[id]] : null;
  };

  // TODO: jests
  getUncheckedItem = (id: number): number | null => this.denseIdList[this._sparseList[id]];

  // Inserts a new element into set
  add = (id: number, item: T): void => {
    const elementCount = this._elementCount;

    // Corner cases, x must not be out of
    // range, dense[] should not be full and
    // x should not already be present
    // if (x > maxValue) return;
    // if (n >= capacity) return;
    // if (this.get(itemId) !== null) return null;
    if (this.hasId(id)) return;

    // Inserting into array-dense[] at index 'n'.
    this.denseIdList[elementCount] = id;
    this.denseItemList[elementCount] = item;

    // Mapping it to sparse[] array.
    this._sparseList[id] = elementCount;

    // Increment count of elements in set
    this._elementCount = elementCount + 1;
  };

  // TODO: jests
  remove = (number: number): void => {
    const sparseList = this._sparseList;
    const denseIdList = this.denseIdList;
    const denseItemList = this.denseItemList;
    const elementCount = this._elementCount;

    // If x is not present
    if (!this.hasId(number)) return;

    const denseListIndex = sparseList[number];

    const lastId = denseIdList[elementCount - 1]; // Take an element from end
    denseIdList[denseListIndex] = lastId; // Overwrite.
    sparseList[lastId] = denseListIndex; // Overwrite.

    // Take last item from end and overwrite
    denseItemList[denseListIndex] = denseItemList[elementCount - 1];

    // Since one element has been deleted, we
    // decrement 'n' by 1.
    this._elementCount = elementCount - 1;
  };

  clear = () => (this._elementCount = 0);
}

export default SparseSet;
