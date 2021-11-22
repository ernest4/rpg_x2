import { DeltaTime } from "../../ecs/types";
import InputListener from "../systems/InputListener";
import Manager from "../systems/Manager";
import SpriteRender from "../systems/SpriteRender";
import MovementController from "../systems/MovementController";
import SpriteLoader from "../systems/SpriteLoader";
import Phaser from "phaser";
import Movement from "../systems/Movement";
import FpsCounter from "../../utils/FpsCounter";
import { DEVELOPMENT } from "../../utils/environment";
import { Engine } from "../../ecs";
import { f32, i32, Vector3f } from "../../ecs/Component";
// import FpsCounter from "./utils/FpsCounter";

// TODO: move this to own file?
export const enum Components {
  Position,
  Velocity,
  Rotation,
  AngularVelocity,
  Scale,
  Speed,
  Player,
  Sprite,
  InputEvent,
  LoadSpriteEvent,
}

export const SCHEMA = {
  [Components.Position]: Vector3f,
  [Components.Velocity]: Vector3f,
  [Components.Rotation]: [f32("rz")],
  [Components.AngularVelocity]: [f32("az")],
  [Components.Scale]: Vector3f,
  [Components.Speed]: [i32("speed")],
  [Components.Player]: [],
  [Components.Sprite]: [i32("url"), i32("frameWidth"), i32("phaserSprite")],
  [Components.InputEvent]: [i32("type"), i32("key"), i32("targetEntityId")],
  [Components.LoadSpriteEvent]: [
    i32("url"),
    i32("frameWidth"),
    i32("frameHeight"),
    i32("startFrame"),
    i32("endFrame"),
    i32("margin"),
    i32("spacing"),
    i32("targetEntityId"),
  ],
} as const;

export default class Main extends Phaser.Scene {
  // dudeQuads!: any[];
  lastDeltaTime: any;
  lastFrame: any;
  // fpsCounter!: FpsCounter;
  private _engine!: Engine;
  fpsCounter: FpsCounter;

  constructor(config) {
    super(config);
  }

  // init(data) {}
  // preload() {}

  create(data) {
    this.initECS();
    this.fpsCounter = new FpsCounter(); // if DEVELOPMENT ?
  }

  update(time, deltaTime: DeltaTime) {
    this._engine.update(deltaTime);
    this.fpsCounter.update(deltaTime);
  }

  private initECS = () => {
    this._engine = new Engine(SCHEMA, DEVELOPMENT);
    // TODO: test all systems.
    this._engine.addSystems(
      new Manager(this._engine),

      // TODO: clean up and add back SERIALIZATION. Serialization will detect Sprite/Sounds etc and remove them, creating loadEvents for them...
      // TODO: get rid of this after applying it to serialization
      // NEED TO PRODUCE LoadSpriteEvent !
      // new DrifterMessageToSpriteLoadEvent(this._engine),

      // OR !!! maybe just add straight sprite components and renderer can check if loaded and if not
      // create load event component and remove the sprite component...
      // simpler??!?!

      // TODO: clean up and add back SCENE_EDITOR

      new InputListener(this._engine, this),
      new MovementController(this._engine),
      new Movement(this._engine),

      // TODO: once you have camera
      // this.cameras.main.setBackgroundColor(0xffffff);

      // new AssetLoader(this._engine), // TODO: async load in sprites / textures /sounds etc
      new SpriteLoader(this._engine, this), // TODO: refactor into asset loader?
      new SpriteRender(this._engine, this) // NOTE: always last
    );

    // new Serialization(this._engine, this));
    // if (DEVELOPMENT) new SceneEditor(this._engine),
    // // new Network(this._engine, this)); // TODO: networking here ...
    // new Input(this._engine, this));
    // new Interaction(this._engine, this));
    // new MovementControl(this._engine),
    // // new AI(this._engine),
    // // physics
    // new Dragging(this._engine),
    // new Movement(this._engine),
    // // new Animation(this._engine), // will hook into state of the entity (animation state machine)
    // // new Collision(this._engine),
    // new Render(this._engine, this)); // shadows will be handled under sprite? or should it be separate system...?
    // // analysis -> print how long each system is taking / where is the bottleneck?

    // // TODO: move to camera component / render component
    // this.cameras.main.setBackgroundColor(0xffffff);

    // // TODO: move to some system 'Debug' system?
    // this.fpsCounter = new FpsCounter();
  };
}
