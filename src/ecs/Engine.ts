import { ComponentClass, DeltaTime, EntityId, QueryCallback, QuerySet } from "./types";
import EntityIdPool, { EntityIdPoolParams } from "./engine/EntityIdPool";
import Component, { ComponentSchema } from "./Component";
import SparseSet from "./utils/SparseSet";
import System from "./System";
import { isNumber } from "./utils/Number";
import Entity from "./Entity";
import Stats from "./utils/Stats";
import Archetype, { ComponentsSchema, Fields, Mask, Values } from "./Archetype";
import { benchmarkSubject } from "./utils/benchmark";

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
  // _componentLists: SparseSet<Component>[] = [];
  private _debug: boolean | undefined;
  // private _entityIdAliases: SparseSet<EntityIdAlias>;
  readonly entityIdPool: EntityIdPool = new EntityIdPool();
  private _stats: Stats;
  components: { [key: string]: Component<any> };
  _componentLists: any;
  lastComponentSignatureId: number;
  private _archetypes: Archetype[];
  _componentsSchema: ComponentsSchema;
  queries: Archetype[][] = [];
  private _queryStringToId: { [key: string]: number } = {};

  constructor(componentsSchema: ComponentsSchema, debug?: boolean) {
    this._debug = debug;
    if (debug) this._stats = new Stats();
    // this._systemUpdateFunctions = [];
    // this.updateComplete = new signals.Signal(); // TODO: signals?? https://github.com/millermedeiros/js-signals
    // this.entityIdPool = new EntityIdPool();
    // this._entityIdAliases = new SparseSet();
    // this._events = {
    //   removedComponent: (component: Component, oldEntityId: EntityId) => {},
    // };

    // move to helper class, some "increasing number generator" ?
    this.lastComponentSignatureId = 0;

    // Object.entries(componentsSchema).forEach(([componentName, componentSchema]) => {
    //   const signatureId = this.newComponentSignatureId(); // unique increasing numbers
    //   this.components[componentName] = new Component(signatureId, componentSchema);
    // });

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

  // addComponent = <T extends Component>(component: T) => {
  //   // NOTE: indexing using component class name
  //   // @ts-ignore
  //   const componentClassName = component.constructor.className();
  //   let componentList = this._componentLists[componentClassName];

  //   if (!componentList) {
  //     componentList = new SparseSet();
  //     this._componentLists[componentClassName] = componentList;
  //   }

  //   componentList.add(component);
  //   return component;
  // };

  // private defineComponent = (componentName: string, componentSchema: ComponentSchema) => {
  //   const signatureId = this.newComponentSignatureId(); // unique increasing numbers
  //   this.components[componentName] = new Component(signatureId, componentSchema);
  // };

  private newComponentSignatureId = () => ++this.lastComponentSignatureId;

  // addComponent = <T extends Component>(tag: number, component: T) => {
  //   let componentList = this._componentLists[tag];

  //   if (!componentList) {
  //     componentList = new SparseSet();
  //     this._componentLists[tag] = componentList;
  //   }

  //   componentList.add(component);
  //   return component;
  // };

  addComponent = <F extends readonly [] | readonly any[]>(
    entityId: EntityId,
    componentId: number,
    fields: F,
    values: { [key in keyof F]: any }
  ) => {
    // let benchReport: any = [];
    // let currentArchetype;
    // benchReport.push(
    //   benchmarkSubject("getEntityArchetype", () => {
    //     currentArchetype = this.getEntityArchetype(entityId);
    //   })
    // );
    const currentArchetype = this.getEntityArchetype(entityId);
    const currentArchetypeMask = currentArchetype?.mask || []; // first component wont have any archetypes
    // let unionMask;
    // benchReport.push(
    //   benchmarkSubject("createMaskWithComponentBitFlip", () => {
    //     unionMask = this.createMaskWithComponentBitFlip(currentArchetypeMask, componentId);
    //   })
    // );
    const unionMask = this.createMaskWithComponentBitFlip(currentArchetypeMask, componentId);
    // let nextArchetype;
    // benchReport.push(
    //   benchmarkSubject("getArchetype", () => {
    //     nextArchetype = this.getArchetype(unionMask);
    //   })
    // );
    let nextArchetype = this.getArchetype(unionMask);
    if (!nextArchetype) {
      nextArchetype = this.createArchetype(
        unionMask,
        ...(currentArchetype?.componentIds || []), // first component wont have any archetypes
        componentId
      );
    }

    // benchReport.push(
    //   benchmarkSubject("changeUpEntityArchetype", () => {
    //     this.changeUpEntityArchetype(
    //       currentArchetype,
    //       nextArchetype,
    //       entityId,
    //       componentId,
    //       // @ts-ignore
    //       fields,
    //       values
    //     );
    //   })
    // );
    this.changeUpEntityArchetype(
      currentArchetype,
      nextArchetype,
      entityId,
      componentId,
      // @ts-ignore
      fields,
      values
    );

    // console.log(JSON.stringify(benchReport));
  };

  getEntityArchetype = (entityId: EntityId): Archetype => {
    const { _archetypes } = this;
    // TODO: this loop could both find the current AND the next archetype in one go!
    for (let i = 0, l = _archetypes.length; i < l; i++) {
      if (_archetypes[i].hasEntity(entityId)) {
        return _archetypes[i];
      }
    }
  };

  createMaskWithComponentBitFlip = (mask: Mask, componentId: number): Mask => {
    const newMask = [...mask];
    // NOTE: when component bit is missing, this will add it
    // when it's already there, it will take it away
    // Therefore can call this function to both add new bit and remove existing
    newMask[~~(componentId / 32)] ^= 1 << componentId % 32;
    return newMask;
  };

  getArchetype = (mask: Mask): Archetype | void => {
    const { _archetypes } = this;
    for (let i = 0, l = _archetypes.length; i < l; i++) {
      if (_archetypes[i].maskMatches(mask)) return _archetypes[i];
    }
  };

  createArchetype = (mask: Mask, ...componentIds: number[]): Archetype => {
    const newArchetype = new Archetype(mask, this._componentsSchema, ...componentIds);
    this._archetypes.push(newArchetype);
    return newArchetype;
  };

  changeUpEntityArchetype = (
    currentArchetype: Archetype,
    newArchetype: Archetype,
    entityId: EntityId,
    componentId: number,
    newComponentFields: Fields,
    newComponentValues: Values
  ) => {
    const [componentIds, fields, values] = currentArchetype?.remove(entityId) || [[], [], []]; // first component wont have any archetypes

    // combine new and old components in single data stream
    for (let i = 0, l = newComponentFields.length; i < l; i++) {
      componentIds.push(componentId);
      fields.push(newComponentFields[i]);
      values.push(newComponentValues[i]);
    }

    newArchetype.add(entityId, componentIds, fields, values);
  };

  // addComponents = (...components: Component[]) => components.forEach(this.addComponent);
  // addComponents = (...components: Component[]) => components.forEach(this.addComponent);

  // TODO: sketches...
  // addComponentToEntity = <T extends Component>(entity: Entity, component: T) => {
  //   entity._loadComponent(component); // TODO: maybe call reload() sticking to public api? but it's expensive, will loop through all component lists...
  //   return this.addComponent(component);
  // };

  // removeComponent = (component: Component) => {
  //   // NOTE: indexing using component class name
  //   // @ts-ignore
  //   const componentClassName = component.constructor.className();
  //   const componentList = this._componentLists[componentClassName];
  //   if (!componentList) return;

  //   const oldEntityId = component.id;
  //   // this._events.removedComponent(component, oldEntityId);
  //   componentList.remove(component);
  //   if (isNumber(oldEntityId)) this.reclaimEntityIdIfFree(oldEntityId);
  // };

  // removeComponent = (tag: number, component: Component) => {
  //   // NOTE: indexing using component class name
  //   // @ts-ignore
  //   // const componentClassName = component.constructor.className();
  //   const componentList = this._componentLists[tag];
  //   if (!componentList) return;

  //   const oldEntityId = component.id;
  //   // this._events.removedComponent(component, oldEntityId);
  //   componentList.remove(component);
  //   if (isNumber(oldEntityId)) this.reclaimEntityIdIfFree(oldEntityId);
  // };

  removeComponent = (componentId: number, entityId: EntityId) => {
    // let benchReport: any = [];

    const currentArchetype = this.getEntityArchetype(entityId);

    // benchReport.push(
    //   benchmarkSubject("reclaimId", () => {
    //     // if last component...
    //     if (currentArchetype.componentIds.length === 1) {
    //       // TODO: some error case?
    //       if (currentArchetype.componentIds[0] === componentId) {
    //         currentArchetype.remove(entityId); // TODO: use more efficient remove that doesnt return values?
    //         this.entityIdPool.reclaimId(entityId);
    //       }
    //     }
    //   })
    // );
    // if last component...
    if (currentArchetype.componentIds.length === 1) {
      // TODO: some error case?
      if (currentArchetype.componentIds[0] === componentId) {
        currentArchetype.remove(entityId); // TODO: use more efficient remove that doesnt return values?
        this.entityIdPool.reclaimId(entityId);
      }
    }

    const differenceMask = this.createMaskWithComponentBitFlip(currentArchetype.mask, componentId);
    let nextArchetype = this.getArchetype(differenceMask);
    if (!nextArchetype) {
      nextArchetype = this.createArchetype(
        differenceMask,
        ...currentArchetype.componentIds.filter(id => id !== componentId)
      );
    }
    // benchReport.push(
    //   benchmarkSubject("changeDownEntityArchetype", () => {
    //     // @ts-ignore
    //     this.changeDownEntityArchetype(currentArchetype, nextArchetype, entityId);
    //   })
    // );
    this.changeDownEntityArchetype(currentArchetype, nextArchetype, entityId);

    // console.log(JSON.stringify(benchReport));
  };

  changeDownEntityArchetype = (
    currentArchetype: Archetype,
    newArchetype: Archetype,
    entityId: EntityId
  ) => {
    newArchetype.add(entityId, ...currentArchetype.remove(entityId));
  };

  // removeComponents = (...components: Component[]) => components.forEach(this.removeComponent);

  // removeComponentById = <T extends Component>(
  //   entityId: EntityId,
  //   componentClass: ComponentClass<T>
  // ) => {
  //   const componentList = this._componentLists[componentClass.className()];
  //   if (!componentList) return;

  //   componentList.remove(entityId);
  //   if (isNumber(entityId)) this.reclaimEntityIdIfFree(entityId);
  // };

  // removeComponentById = (entityId: EntityId, tag: number) => {
  //   const componentList = this._componentLists[tag];
  //   if (!componentList) return;

  //   componentList.remove(entityId);
  //   if (isNumber(entityId)) this.reclaimEntityIdIfFree(entityId);
  // };

  // removeComponentsById = (entityId: EntityId, ...componentClasses: ComponentClass<any>[]) => {
  //   const callback = (componentClass: ComponentClass<any>) => {
  //     this.removeComponentById(entityId, componentClass);
  //   };
  //   componentClasses.forEach(callback);
  // };

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

  // removeEntity = (entityId: EntityId) => {
  //   // NOTE: In EnTT this happens by iterating every single sparse set in the registry, checking if it contains the entity, and deleting it if it does.
  //   Object.values(this._componentLists).forEach(componentList => componentList.remove(entityId));
  //   this.entityIdPool.reclaimId(entityId);
  // };

  removeEntity = (entityId: EntityId) => {
    const currentArchetype = this.getEntityArchetype(entityId);
    currentArchetype.remove(entityId); // TODO: use more efficient remove that doesnt return values?
    this.entityIdPool.reclaimId(entityId);
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

  // TODO: jests
  // NOTE: most general, slowest query
  // queryN = (callback: QueryCallback, ...queryTags: number[]) => {
  //   const componentsLists = this._componentLists;
  //   let shortestComponentListIndex = 0;
  //   let shortestComponentList = componentsLists[queryTags[shortestComponentListIndex]];
  //   if (!shortestComponentList) return;

  //   let nextShortestComponentList: SparseSet<Component>;
  //   const componentClassesLength = queryTags.length;
  //   for (let i = 0; i < componentClassesLength; i++) {
  //     nextShortestComponentList = componentsLists[queryTags[i]];

  //     if (nextShortestComponentList && shortestComponentList) {
  //       if (nextShortestComponentList.size < shortestComponentList.size) {
  //         shortestComponentList = nextShortestComponentList;
  //         shortestComponentListIndex = i;
  //       }
  //     }
  //   }

  //   let querySet: QuerySet = [];
  //   let anotherComponent: Component;
  //   const processComponent = component => {
  //     for (let i = 0; i < componentClassesLength; i++) {
  //       anotherComponent = componentsLists[queryTags[i]]?.get(component.id);

  //       if (!anotherComponent) return; // NOTE: soon as we discover a missing component, abandon further pointless search for that entityId !
  //       querySet[i] = anotherComponent;
  //     }
  //     callback(querySet);
  //   };

  //   shortestComponentList.stream(processComponent);
  // };

  // TODO: jests
  // For systems that query 1 component, can't be faster than this!
  // queryOne = <T extends Component>(queryTag: number): [T[], number] => {
  //   return (<SparseSet<T>>this._componentLists[queryTag]).iterable();
  // };

  // query = (...componentIds: number[]): Archetype[] => {
  //   const resultArchetypes: Archetype[] = [];
  //   const searchMask = this.createMaskFromComponentIds(...componentIds);

  //   const { _archetypes } = this;
  //   for (let i = 0, l = _archetypes.length; i < l; i++) {
  //     if (_archetypes[i].maskContains(searchMask)) resultArchetypes.push(_archetypes[i]);
  //   }

  //   return resultArchetypes;
  // };

  registerQuery = (...componentIds: number[]): number => {
    const { _archetypes, _queryStringToId } = this;
    const queryString = componentIds.sort().toString();
    if (0 <= _queryStringToId[queryString]) return _queryStringToId[queryString];

    const resultArchetypes: Archetype[] = [];
    const searchMask = this.createMaskFromComponentIds(...componentIds);

    for (let i = 0, l = _archetypes.length; i < l; i++) {
      if (_archetypes[i].maskContains(searchMask)) resultArchetypes.push(_archetypes[i]);
    }

    const queryId = this.queries.push(resultArchetypes) - 1;
    _queryStringToId[queryString] = queryId;
    return queryId;
  };

  query = (queryId: number): Archetype[] => {
    return this.queries[queryId];
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
