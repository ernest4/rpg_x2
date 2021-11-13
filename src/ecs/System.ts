import Archetype from "./Archetype";
import Engine from "./Engine";
import { DeltaTime, EntityId } from "./types";

// TODO: jest tests !!!!
abstract class System {
  private readonly _engine: Engine;
  view: (...componentIds: number[]) => Archetype[];
  addComponent: <F extends readonly [] | readonly any[]>(
    componentId: number,
    entityId: EntityId,
    fields: F,
    values: { [key in keyof F]: number }
  ) => void;
  removeComponent: (componentId: number, entityId: EntityId) => void;
  newEntityId: () => EntityId;

  constructor(engine: Engine) {
    this._engine = engine;
    this.view = this.engine.view;
    this.addComponent = this.engine.addComponent;
    this.removeComponent = this.engine.removeComponent;
    this.newEntityId = this.engine.newEntityId;
  }

  // TODO: init stuff, engine should run this when system right after system is added
  abstract start(): void;

  // NOTE: called once per tick. DeltaTime can be extracted from the engine reference
  abstract update(): void;

  // TODO: clean up before system shutdown, engine should call this before removing system
  abstract destroy(): void;

  log = (object: any) => {
    console.log(this.logTag(JSON.stringify(object)));
  };

  benchmarkSubject = (subject: string, callback: Function) => {
    this.engine.stats.benchmark(this.logTag(subject), callback);
  };

  get engine() {
    return this._engine;
  }

  get deltaTime() {
    return this.engine.deltaTime;
  }

  private logTag = (subject: string) => `[Engine]:[${this.constructor.name}]:${subject}`;
}

export default System;
