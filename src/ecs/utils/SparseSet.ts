import { isNumber } from "./Number";
export class SparseSetItem {
  protected _id: number;

  constructor(id: number) {
    this._id = id;
  }

  get id(): number {
    return this._id;
  }

  set id(newId: number) {
    this._id = newId;
  }
}

class SparseSet<T extends SparseSetItem = SparseSetItem> {
  // TODO: will want to optimize these lists to use ArrayBuffer for dense memory access where
  // possible?
  readonly _denseList: T[];
  // TODO: Sparse lists will become hash maps in V8 optimizer. They are less efficient in speed
  // compared to arrays. So maybe use fixed size ArrayBuffer as well? Dynamically grow it yourself?
  private _sparseList: number[];
  _elementCount: number = 0; // No elements initially
  private _preallocatedSize: number;

  constructor(preallocatedSize: number = 30000) {
    // constructor(sparseSetMaxValue, denseSetCapacity) {
    // sparse = new int[maxV + 1]();
    // dense = new int[cap]();
    // capacity = cap;
    // maxValue = maxV;
    // n = 0; // No elements initially
    // this._objectIdKeyName = objectIdKeyName;

    // Preallocation makes arrays faster
    this._preallocatedSize = preallocatedSize;
    this._denseList = new Array(preallocatedSize).fill(null);
    this._sparseList = new Array(preallocatedSize).fill(-1);
  }

  get = (id: number): T | null => {
    // Searched element must be in range
    // if (x > maxValue) return -1;

    // The first condition verifies that 'x' is
    // within 'n' in this set and the second
    // condition tells us that it is present in
    // the data structure.

    const denseListIndex = this._sparseList[id];
    if (this._elementCount <= denseListIndex) return null;

    const denseList = this._denseList;
    if (denseList[denseListIndex]?.id !== id) return null;

    return denseList[denseListIndex];
  };

  // Inserts a new element into set
  add = (item: T): T | null => {
    const itemId = item.id;
    const elementCount = this._elementCount;

    // Corner cases, x must not be out of
    // range, dense[] should not be full and
    // x should not already be present
    // if (x > maxValue) return;
    // if (n >= capacity) return;
    if (this.get(itemId) !== null) return null;

    // Inserting into array-dense[] at index 'n'.
    this._denseList[elementCount] = item;

    // Mapping it to sparse[] array.
    this._sparseList[itemId] = elementCount;

    // Increment count of elements in set
    this._elementCount = elementCount + 1;

    return item;
  };

  // A function that deletes 'x' if present in this data
  // structure, else it does nothing (just returns).
  // By deleting 'x', we unset 'x' from this set.
  remove = (item: T | number): number | null => {
    const itemId = isNumber(item) ? (item as number) : (item as T).id;
    const sparseList = this._sparseList;
    const denseList = this._denseList;
    const elementCount = this._elementCount;

    // If x is not present
    if (this.get(itemId) === null) return null;

    const denseListIndex = sparseList[itemId];

    const lastItem = denseList[elementCount - 1]; // Take an element from end
    denseList[denseListIndex] = lastItem; // Overwrite.
    sparseList[lastItem.id] = denseListIndex; // Overwrite.

    // Since one element has been deleted, we
    // decrement 'n' by 1.
    this._elementCount = elementCount - 1;

    return itemId; // return removed item id
  };

  clear = () => (this._elementCount = 0);

  get size() {
    return this._elementCount;
  }

  stream = (callback: (item: T) => void) => {
    // Caching this to prevent add / remove from messing with the stream
    const elementCount = this._elementCount;
    const denseList = this._denseList;
    let i = 0;
    while (i < elementCount) {
      callback(denseList[i]);
      i++;
    }
  };
}

export default SparseSet;
