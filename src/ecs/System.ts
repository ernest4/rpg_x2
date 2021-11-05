import Archetype from "./Archetype";
import Component, { ComponentsSchema } from "./Component";
import Engine from "./Engine";
import { benchmarkSubject } from "./utils/benchmark";

// TODO: jest tests !!!!
abstract class System {
  private readonly _engine: Engine;
  query: (...componentIds: number[]) => Archetype[];

  constructor(engine: Engine) {
    this._engine = engine;
    this.query = this.engine.query;
  }

  // TODO: init stuff, engine should run this when system right after system is added
  abstract start(): void;

  // NOTE: called once per tick. DeltaTime can be extracted from the engine reference
  abstract update(): void;

  // TODO: clean up before system shutdown, engine should call this before removing system
  abstract destroy(): void;

  newEntityId = () => this._engine.newEntityId();

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
