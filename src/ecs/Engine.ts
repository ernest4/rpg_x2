import { ComponentClass, DeltaTime, EntityId, QueryCallback, QuerySet } from "./types";
import EntityIdPool, { EntityIdPoolParams } from "./engine/EntityIdPool";
import SparseSet from "./utils/SparseSet";
import System from "./System";
import { isNumber } from "./utils/Number";
import Entity from "./Entity";
import Stats from "./utils/Stats";
import Archetype, { Fields, Mask, SOA, Values } from "./Archetype";
import { benchmarkSubject } from "./utils/benchmark";
import { ComponentsSchema } from "./Component";

// TODO: move out to own class?
// class EntityIdAlias extends SparseSetItem {
//   entityId: EntityId;

//   constructor(aliasId: EntityId, entityId: EntityId) {
//     super(aliasId);
//     this.entityId = entityId;
//   }
// }

// TODO: jest tests !!!!
class Engine {
  private _deltaTime: DeltaTime = 0;
  private _updating: boolean = false;
  // updateComplete: any; // TODO: better type?
  // NOTE: for faster iteration, reference straight to update function, one indirection instead of 2
  // (-> system -> update)
  // _systemUpdateFunctions: ((engine: Engine, deltaTime: DeltaTime) => void)[];
  private _systems: System[] = []; // NOTE: handle onn system to call start() and destroy()
  private _debug: boolean | undefined;
  // private _entityIdAliases: SparseSet<EntityIdAlias>;
  readonly entityIdPool: EntityIdPool = new EntityIdPool();
  private _stats: Stats;
  // lastComponentSignatureId: number;
  private _archetypes: Archetype[];
  _componentsSchema: ComponentsSchema;
  // queries: Archetype[][] = [];
  private _queries: { [key: string]: Archetype[] } = {};
  readonly maxEntities: number;
  private _queriesById: Archetype[][] = [];
  // private _queryStringToId: { [key: string]: number } = {};

  constructor(componentsSchema: ComponentsSchema, maxEntities = 1e6, debug?: boolean) {
    this.maxEntities = maxEntities;
    this._debug = debug;
    if (debug) this._stats = new Stats();
    // this._systemUpdateFunctions = [];
    // this.updateComplete = new signals.Signal(); // TODO: signals?? https://github.com/millermedeiros/js-signals
    // this.entityIdPool = new EntityIdPool();
    // this._entityIdAliases = new SparseSet();
    // this._events = {
    //   removedComponent: (component: Component, oldEntityId: EntityId) => {},
    // };

    // TODO: validate schema!?!
    this._componentsSchema = componentsSchema;

    // TODO: optimize, maybe use arrays?
    // or cache line optimized search of keys anyway?
    this._archetypes = [];
  }

  // TODO: jests
  serialize = () => {
    // TODO: serialize entityId pool & all serializable components
    // TODO: serialize _entityIdAliases too ?!?
  };

  // TODO: jests
  deserialize = () => {
    // TODO: deserialize entityId pool & all serializable components
    // TODO: deserialize _entityIdAliases too ?!?
  };

  addSystem = (system: System) => {
    // addSystem = (system: System, priority?: number) => {
    // TODO: priority integer sorting
    // simple priority based on insertion order for now...
    // this._systemUpdateFunctions.push(system.update);
    this._systems.push(system);
    system.start();

    // NOTE: constructor.name only works in development, which is where we want to print this anyway
    if (this._debug) console.log(`[Engine]: Started system: ${system.constructor.name}`);
  };

  // TODO: jests
  addSystems = (...systems: System[]) => systems.forEach(this.addSystem);

  // getSystem

  // removeSystem
  // () => { ... system.destroy()}

  // removeAllSystems

  addComponent = <F extends readonly [] | readonly any[]>(
    componentId: number,
    entityId: EntityId,
    _fields: F,
    values: { [key in keyof F]: number }
  ) => {
    const currentArchetype = this.getEntityArchetype(entityId);
    // if (currentArchetype.hasComponents(componentId)) return; // exit early if component exists

    const currentArchetypeMask = currentArchetype?.mask || []; // first component wont have any archetypes
    const unionMask = this.createMaskWithComponentBitFlip(currentArchetypeMask, componentId);
    let nextArchetype = this.getArchetype(unionMask);
    if (!nextArchetype) {
      nextArchetype = this.createArchetype(
        unionMask,
        ...(currentArchetype?.componentIds || []), // first component wont have current archetype
        componentId
      );
    }

    this.changeUpEntityArchetype(
      currentArchetype,
      nextArchetype,
      entityId,
      componentId,
      <number[]>(<any>values)
    );
  };

  getEntityArchetype = (entityId: EntityId): Archetype | null => {
    const { _archetypes } = this;
    for (let i = 0, l = _archetypes.length; i < l; i++) {
      if (_archetypes[i].hasEntity(entityId)) return _archetypes[i];
    }
    return null;
  };

  createMaskWithComponentBitFlip = (mask: Mask, componentId: number): Mask => {
    const newMask = [...mask];
    // NOTE: when component bit is missing, this will add it
    // when it's already there, it will take it away
    // Therefore can call this function to both add new bit and remove existing
    newMask[~~(componentId / 32)] ^= 1 << componentId % 32;
    return newMask;
  };

  getArchetype = (mask: Mask): Archetype | null => {
    const { _archetypes } = this;
    for (let i = 0, l = _archetypes.length; i < l; i++) {
      if (_archetypes[i].maskMatches(mask)) return _archetypes[i];
    }
    return null;
  };

  createArchetype = (mask: Mask, ...componentIds: number[]): Archetype => {
    const newArchetype = new Archetype(
      mask,
      this._componentsSchema,
      this.maxEntities,
      ...componentIds
    );
    this._archetypes.push(newArchetype);

    // updating query sets
    const { _queries } = this;
    const queryStrings = Object.keys(_queries);
    const newArchetypeQueryString = newArchetype.componentIds.sort().toString();
    for (let i = 0, l = queryStrings.length; i < l; i++) {
      const queryString = queryStrings[i];
      if (!newArchetypeQueryString.includes(queryString)) continue;

      _queries[queryString].push(newArchetype);
    }

    return newArchetype;
  };

  changeUpEntityArchetype = (
    currentArchetype: Archetype,
    newArchetype: Archetype,
    entityId: EntityId,
    newComponentId: number,
    newComponentValues: number[]
  ) => {
    const oldDataStream = currentArchetype?.remove(entityId) || []; // first component wont have any archetypes
    newArchetype.add(entityId, oldDataStream, newComponentId, newComponentValues);
  };

  // addComponents = (...components: Component[]) => components.forEach(this.addComponent);
  // addComponents = (...components: Component[]) => components.forEach(this.addComponent);

  // TODO: sketches...
  // addComponentToEntity = <T extends Component>(entity: Entity, component: T) => {
  //   entity._loadComponent(component); // TODO: maybe call reload() sticking to public api? but it's expensive, will loop through all component lists...
  //   return this.addComponent(component);
  // };

  removeComponent = (componentId: number, entityId: EntityId) => {
    const currentArchetype = this.getEntityArchetype(entityId);
    // if (!currentArchetype.hasComponents(componentId)) return; // exit early if doesn't exist

    // if last component...
    if (currentArchetype.componentIds.length === 1) {
      // On last component
      if (currentArchetype.componentIds[0] === componentId) {
        // currentArchetype.remove(entityId);
        currentArchetype.destroy(entityId);
        this.entityIdPool.reclaimId(entityId);
        return;
      } else {
        // TODO: some error case? is this possible?
        throw Error("Removing component entity doesn't have. TODO: handle this!");
      }
    }

    const differenceMask = this.createMaskWithComponentBitFlip(currentArchetype.mask, componentId);
    let nextArchetype = this.getArchetype(differenceMask);
    if (!nextArchetype) {
      nextArchetype = this.createArchetype(
        differenceMask,
        ...currentArchetype.componentIdsWithout(componentId)
      );
    }

    this.changeDownEntityArchetype(currentArchetype, nextArchetype, entityId);
  };

  changeDownEntityArchetype = (
    currentArchetype: Archetype,
    newArchetype: Archetype,
    entityId: EntityId
  ) => {
    newArchetype.add(entityId, currentArchetype.remove(entityId));
  };

  // removeComponents = (...components: Component[]) => components.forEach(this.removeComponent);

  // removeComponentsOfClass = <T extends Component>(componentClass: ComponentClass<T>) => {
  //   this._componentLists[componentClass.className()]?.stream(this.removeComponent);
  // };

  // removeComponentsOfTag = (tag: number) => {
  //   const removeCallback = (component: Component) => this.removeComponent(tag, component);
  //   this._componentLists[tag]?.stream(removeCallback);
  // };

  // removeComponentsOfClasses = (...componentClasses: ComponentClass<any>[]) => {
  //   componentClasses.forEach(this.removeComponentsOfTag);
  // };

  // getComponentById = <T extends Component>(entityId: EntityId, tag: number) => {
  //   return this._componentLists[tag]?.get(entityId) as T | null;
  // };

  // withComponent = <T extends Component>(
  //   callback: (component: T) => void,
  //   entityId: EntityId,
  //   tag: number
  // ): void => {
  //   const component = this.getComponentById<T>(entityId, tag);
  //   if (component) callback(component);
  // };

  // getComponentsById = (entityId: EntityId, ...tags: number[]): Component[] => {
  //   const components: Component[] = [];
  //   const callback = (tag: number) => components.push(this.getComponentById(entityId, tag));
  //   tags.forEach(callback);
  //   return components;
  // };

  // withComponents = (
  //   callback: (components: Component[]) => void,
  //   entityId: EntityId,
  //   ...tags: number[]
  // ): void => {
  //   const components = this.getComponentsById(entityId, ...tags);
  //   if (components.filter(component => component).length !== components.length) return;
  //   callback(components);
  // };

  // getAllComponentsOfId = (entityId: EntityId) => {
  //   let components: Component[] = [];
  //   Object.values(this._componentLists).forEach(componentList => {
  //     const component = componentList.get(entityId);
  //     if (component) components.push(component);
  //   });
  //   return components;
  // };

  // createEntity = (): Entity => {
  //   return new Entity(this.newEntityId(), this);

  //   // TODO: every single entity have PositionComponent and TagComponent by default ????
  //   // entity.addComponent(new PositionComponent(...))
  //   // entity.addComponent(new TagComponent(...))
  //   // return entity;
  // };

  getEntity = (
    entityId: EntityId
  ): [components: { [componentId: number]: SOA }, entityIndex: number] | null => {
    const archetype = this.getEntityArchetype(entityId);
    if (!archetype) return null;

    return archetype.getEntity(entityId);
  };

  newEntityId = (): EntityId => this.entityIdPool.getId();

  // newEntityIdWithAlias = (aliasId: EntityId): EntityId | null => {
  //   const entityId = this.newEntityId();
  //   if (isNumber(this.addEntityIdAlias(entityId, aliasId))) return entityId;

  //   this.entityIdPool.reclaimId(entityId);
  //   return null;
  // };

  // addEntityIdAlias = (entityId: EntityId, aliasId: EntityId): EntityId | null => {
  //   const addedAliasId = this._entityIdAliases.add(new EntityIdAlias(aliasId, entityId));
  //   return addedAliasId ? addedAliasId.id : null;
  // };

  // getEntityIdByAlias = (aliasId: EntityId) => {
  //   return (<EntityIdAlias>this._entityIdAliases.get(aliasId))?.entityId;
  // };

  // getOrCreateEntityIdByAlias = (aliasId: EntityId): EntityId => {
  //   const entityId = this.getEntityIdByAlias(aliasId);
  //   return isNumber(entityId) ? entityId : this.newEntityIdWithAlias(aliasId);
  // };

  // getOrCreateNullComponentById = <T extends Component>(
  //   entityId: EntityId,
  //   componentClass: ComponentClass<T>,
  //   tag: number
  // ): T => {
  //   let component = this.getComponentById<T>(entityId, tag);
  //   return component ? component : Component.createNull(entityId, componentClass);
  // };

  // getOrAddNullComponentById = <T extends Component>(
  //   entityId: EntityId,
  //   componentClass: ComponentClass<T>,
  //   tag: number
  // ): T => {
  //   return this.addComponent(tag, this.getOrCreateNullComponentById(entityId, componentClass, tag));
  // };

  removeEntity = (entityId: EntityId) => {
    const currentArchetype = this.getEntityArchetype(entityId);
    if (currentArchetype) {
      currentArchetype.remove(entityId);
      this.entityIdPool.reclaimId(entityId);
    }
  };

  destroyEntity = (entityId: EntityId) => {
    const currentArchetype = this.getEntityArchetype(entityId);
    if (currentArchetype) {
      currentArchetype.destroy(entityId);
      this.entityIdPool.reclaimId(entityId);
    }
  };

  // // NOTE: fast O(1) bulk operations
  // removeAllComponents = () => {
  //   Object.values(this._componentLists).forEach(componentList => componentList.clear());
  //   this.entityIdPool.clear();
  // };

  update = (deltaTime: DeltaTime) => {
    this._deltaTime = deltaTime;
    // TODO: cycle through the systems, in priority
    this._updating = true;
    // this._systemUpdateFunctions.forEach(this.callSystemUpdateFunction);
    this._systems.forEach(this.updateSystem);
    if (this._debug) this._stats.update(deltaTime);
    this._updating = false;
    // this.updateComplete.dispatch(); // TODO: signals??
  };

  view = (...componentIds: number[]): Archetype[] => {
    const { _archetypes, _queries } = this;
    const queryString = componentIds.sort().toString();
    if (_queries[queryString]) return _queries[queryString];

    const resultArchetypes: Archetype[] = [];
    const searchMask = this.createMaskFromComponentIds(...componentIds);

    for (let i = 0, l = _archetypes.length; i < l; i++) {
      if (_archetypes[i].maskContains(searchMask)) resultArchetypes.push(_archetypes[i]);
    }

    // const queryId = this.queries.push(resultArchetypes) - 1;
    // _queryStringToId[queryString] = queryId;
    // return queryId;
    _queries[queryString] = resultArchetypes;
    return resultArchetypes;
  };

  createMaskFromComponentIds = (...componentIds: number[]) => {
    const newMask = [];
    for (let i = 0, l = componentIds.length; i < l; i++) {
      const componentId = componentIds[i];
      newMask[~~(componentId / 32)] ^= 1 << componentId % 32;
    }
    return newMask;
  };

  get deltaTime() {
    return this._deltaTime;
  }

  // TODO: jests
  get stats() {
    return this._stats;
  }

  private updateSystem = (system: System) => {
    if (this._debug) return this._stats.benchmark(system.constructor.name, () => system.update());

    system.update();
  };

  // private reclaimEntityIdIfFree = (entityId: EntityId) => {
  //   if (this.getAllComponentsOfId(entityId).length === 0) {
  //     this.entityIdPool.reclaimId(entityId);
  //     // entity.reload();
  //   }
  // };
}

export default Engine;
