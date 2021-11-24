class Buffer<T> {
  private _buffer1: T[];
  private _buffer2: T[];
  private _activeBuffer: T[];
  private _secondaryBuffer: T[];

  constructor() {
    this._buffer1 = [];
    this._buffer2 = [];
    this._activeBuffer = this._buffer1;
    this._secondaryBuffer = this._buffer2;
  }

  push = (item: T) => this._activeBuffer.push(item);

  process = (callback: (item: T) => void) => {
    this.swap();
    const { _secondaryBuffer } = this;
    for (let i = 0, l = _secondaryBuffer.length; i < l; i++) {
      callback(_secondaryBuffer[i]);
    }
    this.flushSecondary();
  };

  last = (): T | null => {
    const {
      _activeBuffer,
      _activeBuffer: { length },
    } = this;

    if (length === 0) return null;

    return _activeBuffer[length - 1];
  };

  flushAll = () => {
    this._activeBuffer = [];
    this._secondaryBuffer = [];
  };

  size = () => this._activeBuffer.length;

  private swap = () => {
    // TODO: is this really safe? Probably. JS is single threaded...
    const temp = this._activeBuffer;
    this._activeBuffer = this._secondaryBuffer;
    this._secondaryBuffer = temp;
  };

  private flushSecondary = () => (this._secondaryBuffer = []);
}

export default Buffer;
