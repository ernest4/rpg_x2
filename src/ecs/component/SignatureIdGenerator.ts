class SignatureIdGenerator {
  private _lastId: number;

  constructor() {
    this._lastId = 0;
  }

  newSignatureId = () => ++this._lastId;
}

export default new SignatureIdGenerator();
