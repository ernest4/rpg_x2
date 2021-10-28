import { EntityId } from "../types";

export interface EntityIdPoolParams {
  lastUsedEntityId: EntityId;
  reclaimedEntityIdPool: EntityId[];
  reclaimedEntityIdPoolSize: number;
}

// TODO: jest tests !!!!
class EntityIdPool {
  private _lastUsedEntityId: EntityId;
  private _reclaimedEntityIdPoolSize: number;
  private _reclaimedEntityIdPool: EntityId[];
  _referenceCounts: { [entityId: number]: number };

  // TODO: need to think about when and how this entityId pool will be saved and reinitialized
  // along with the rest of the games entities...
  constructor() {
    this._lastUsedEntityId = -1;
    this._reclaimedEntityIdPool = [];
    this._reclaimedEntityIdPoolSize = 0;
    this._referenceCounts = {};
  }

  // TODO: jests
  deserialize = ({
    lastUsedEntityId,
    reclaimedEntityIdPool,
    reclaimedEntityIdPoolSize,
  }: EntityIdPoolParams) => {
    this._lastUsedEntityId = lastUsedEntityId;
    this._reclaimedEntityIdPool = reclaimedEntityIdPool;
    this._reclaimedEntityIdPoolSize = reclaimedEntityIdPoolSize;
  };

  // TODO: jests
  serialize = (): EntityIdPoolParams => {
    return {
      lastUsedEntityId: this._lastUsedEntityId,
      reclaimedEntityIdPool: this._reclaimedEntityIdPool,
      reclaimedEntityIdPoolSize: this._reclaimedEntityIdPoolSize,
    };
  };

  // TODO: jests
  reclaimId = (entityId: EntityId) => {
    const referenceCounts = this._referenceCounts;
    referenceCounts[entityId] -= 1;
    if (referenceCounts[entityId] !== 0) return;
    this._reclaimedEntityIdPool[this._reclaimedEntityIdPoolSize++] = entityId;
  };

  // TODO: jests
  getId = (): EntityId => {
    const index = this._reclaimedEntityIdPoolSize - 1;
    let entityId;
    const referenceCounts = this._referenceCounts;

    if (0 <= index) {
      this._reclaimedEntityIdPoolSize--;
      entityId = this._reclaimedEntityIdPool[index];
      referenceCounts[entityId] = 1;
      return entityId;
    }

    entityId = ++this._lastUsedEntityId;
    referenceCounts[entityId] = 1;
    return entityId;
  };

  // TODO: jests
  clear = (): number => {
    const oldReclaimedEntityIdPoolSize = this._reclaimedEntityIdPoolSize;
    this._reclaimedEntityIdPoolSize = 0;
    this._lastUsedEntityId = -1;
    this._referenceCounts = {};
    return oldReclaimedEntityIdPoolSize;
  };

  get size(): number {
    return this._reclaimedEntityIdPoolSize;
  }
}

export default EntityIdPool;
