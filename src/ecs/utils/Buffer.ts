// TODO: jests
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
    const { _secondaryBuffer } = this;
    this.swap();
    // this.each(callback);
    // Inlining...
    for (let i = 0, l = _secondaryBuffer.length; i < l; i++) {
      callback(_secondaryBuffer[i]);
    }
    this.flush();
  };

  last = () => {
    const {
      _activeBuffer,
      _activeBuffer: { length },
    } = this;

    return _activeBuffer[length - 1];
  };

  swap = () => {
    // TODO: is this really safe? Probably. JS is single threaded...
    const temp = this._activeBuffer;
    this._activeBuffer = this._secondaryBuffer;
    this._secondaryBuffer = temp;
  };

  flush = () => (this._secondaryBuffer = []);

  flushAll = () => {
    this._activeBuffer = [];
    this._secondaryBuffer = [];
  };

  size = () => this._activeBuffer.length;

  // each = (callback: (item: T) => void) => this._secondaryBuffer.forEach(callback);
}

export default Buffer;
