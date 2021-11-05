import { ComponentClass, DeltaTime, EntityId, QueryCallback, QuerySet } from "./types";
import EntityIdPool, { EntityIdPoolParams } from "./engine/EntityIdPool";
import Component, { ComponentSchema, ComponentsSchema } from "./Component";
import SparseSet from "./utils/SparseSet";
import System from "./System";
import { isNumber } from "./utils/Number";
import Entity from "./Entity";
import Stats from "./utils/Stats";
import Archetype, { Mask } from "./Archetype";

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
  readonly entityIdPool: EntityIdPool;
  private _stats: Stats;
  components: { [key: string]: Component<any> };
  _componentLists: any;
  lastComponentSignatureId: number;
  private _archetypes: Archetype[];
  _componentsSchema: ComponentsSchema;

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

  addComponent = <N extends number, K extends ComponentsSchema, C extends K[N]>(
    schema: K,
    componentId: N,
    entityId: EntityId,
    componentValues: { [key in keyof C]: C[key] }
  ) => {
    const currentArchetype = this.getEntityArchetype(entityId);
    const newMask = this.createNewMask(currentArchetype.mask, componentId);
    let newArchetype = this.getArchetype(newMask);
    if (!newArchetype) {
      newArchetype = this.createArchetype(newMask, ...currentArchetype.componentIds, componentId);
    }
    this.changeEntityArchetype(currentArchetype, newArchetype, entityId, {
      [componentId]: componentValues,
    });
  };

  getEntityArchetype = (entityId: EntityId): Archetype => {
    // TODO: this loop could both find the current AND the next archetype in one go!
    for (let i = 0, l = this._archetypes.length; i < l; i++) {
      if (this._archetypes[i].hasEntity(entityId)) {
        return this._archetypes[i];
      }
    }
  };

  createNewMask = (mask: Mask, componentId: number): Mask => {
    const newMask = [...mask];
    newMask[~~(componentId / 32)] ^= 1 << componentId % 32;
    return newMask;
  };

  getArchetype = (mask: Mask): Archetype | void => {
    for (let i = 0, l = this._archetypes.length; i < l; i++) {
      if (this._archetypes[i].maskMatches(mask)) return this._archetypes[i];
    }
  };

  createArchetype = (mask: Mask, ...componentIds: number[]): Archetype => {
    return new Archetype(mask, this._componentsSchema, ...componentIds);
  };

  changeEntityArchetype = <C extends ComponentSchema>(
    currentArchetype: Archetype,
    newArchetype: Archetype,
    entityId: EntityId,
    newComponent: { [key: number]: { [key in keyof C]: C[key] } }
  ) => {
    const oldComponentsValues = currentArchetype.remove(entityId);
    newArchetype.add(entityId, { ...oldComponentsValues, ...newComponent });
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
    //
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

  query = (...componentIds: number[]): Archetype[] => {
    const resultArchetypes: Archetype[] = [];
    const searchMask = this.createMaskFromComponentIds(...componentIds);

    for (let i = 0, l = this._archetypes.length; i < l; i++) {
      if (this._archetypes[i].maskContains(searchMask)) resultArchetypes.push(this._archetypes[i]);
    }

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
