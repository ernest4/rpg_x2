import { Engine } from "../../../shared/ecs";
import { DeltaTime } from "../../../shared/ecs/types";
import MessageDeserializer from "../shared/systems/MessageDeserializer";
import { DEVELOPMENT } from "../../../shared/utils/environment";
import ConnectionListener from "../../systems/ConnectionListener";
import DisconnectionListener from "../../systems/DisconnectionListener";
import InputListener from "../../systems/InputListener";
import Manager from "../../systems/Manager";
import MessageListener from "../../systems/MessageListener";
import SpriteRender from "../../systems/SpriteRender";
import Broadcaster from "../../systems/Broadcaster";
import MovementController from "../../systems/MovementController";
import SpriteLoader from "../../systems/SpriteLoader";
import NetworkedComponentsSynchronizer from "../../systems/NetworkedComponentsSynchronizer";
import {
  CharacterMessage,
  DrifterMessage,
  HitPointsMessage,
  HunterMessage,
  MESSAGE_TYPE,
  NameMessage,
  TransformMessage,
} from "../shared/messages/schema";
import Transform from "../shared/components/Transform";
import HitPoints from "../shared/components/HitPoints";
import Character from "../shared/components/Character";
import Drifter from "../shared/components/characterTypes/Drfiter";
import Name from "../shared/components/Name";
import DrifterMessageToSpriteLoadEvent from "../../systems/DrifterMessageToSpriteLoadEvent";
import Phaser from "phaser";
import Movement from "../../systems/Movement";
// import FpsCounter from "./utils/FpsCounter";

export default class Main extends Phaser.Scene {
  // dudeQuads!: any[];
  lastDeltaTime: any;
  lastFrame: any;
  // fpsCounter!: FpsCounter;
  private _engine!: Engine;
  private _webSocket: WebSocket;

  constructor(config) {
    super(config);
  }

  // init(data) {}
  // preload() {}

  create(data) {
    this.initECS();
  }

  update(time, delta) {
    this.updateEngine(delta);
  }

  private initECS = () => {
    this._engine = new Engine(DEVELOPMENT);
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


      // new AssetLoader(this._engine), // TODO: async load in sprites / textures /sounds etc
      new SpriteLoader(this._engine, this), // TODO: refactor into asset loader?
      new SpriteRender(this._engine) // NOTE: always last
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

  private updateEngine = (deltaTime: DeltaTime) => this._engine.update(deltaTime);
}
