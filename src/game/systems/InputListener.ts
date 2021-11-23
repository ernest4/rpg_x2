import { Engine } from "../../ecs";
import Buffer from "../../ecs/utils/Buffer";
import Phaser from "phaser";
import PhaserSystem from "./abstract/PhaserSystem";
import { Components, SCHEMA } from "../scenes/Main";
import Archetype from "../../ecs/Archetype";

export enum INPUT_KEY {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  A,
  W,
  S,
  D,
}

export enum INPUT_EVENT_TYPE {
  keydown,
  keyup,
}

type InputEventObject = [INPUT_EVENT_TYPE, INPUT_KEY];

const DEFAULT_INPUTS: InputEventObject[] = [
  [INPUT_EVENT_TYPE.keydown, INPUT_KEY.UP],
  [INPUT_EVENT_TYPE.keydown, INPUT_KEY.DOWN],
  [INPUT_EVENT_TYPE.keydown, INPUT_KEY.LEFT],
  [INPUT_EVENT_TYPE.keydown, INPUT_KEY.RIGHT],
  [INPUT_EVENT_TYPE.keydown, INPUT_KEY.A],
  [INPUT_EVENT_TYPE.keydown, INPUT_KEY.W],
  [INPUT_EVENT_TYPE.keydown, INPUT_KEY.S],
  [INPUT_EVENT_TYPE.keydown, INPUT_KEY.D],

  [INPUT_EVENT_TYPE.keyup, INPUT_KEY.UP],
  [INPUT_EVENT_TYPE.keyup, INPUT_KEY.DOWN],
  [INPUT_EVENT_TYPE.keyup, INPUT_KEY.LEFT],
  [INPUT_EVENT_TYPE.keyup, INPUT_KEY.RIGHT],
  [INPUT_EVENT_TYPE.keyup, INPUT_KEY.A],
  [INPUT_EVENT_TYPE.keyup, INPUT_KEY.W],
  [INPUT_EVENT_TYPE.keyup, INPUT_KEY.S],
  [INPUT_EVENT_TYPE.keyup, INPUT_KEY.D],
];

// TODO: jests
class InputListener extends PhaserSystem {
  private _inputs: InputEventObject[];
  private _inputsBuffer: Buffer<InputEventObject> = new Buffer<InputEventObject>();
  playerArchetypes: Archetype[];
  inputEventArchetypes: Archetype[];

  constructor(engine: Engine, scene: Phaser.Scene, inputs: InputEventObject[] = DEFAULT_INPUTS) {
    super(engine, scene);
    this._inputs = inputs;
  }

  start(): void {
    this.registerInputCallbacks();
    this.inputEventArchetypes = this.view(Components.InputEvent);
    this.playerArchetypes = this.view(Components.Player);
  }

  update(): void {
    this.destroyInputEvents();
    this.createInputEvents();
  }

  destroy(): void {}

  private registerInputCallbacks = () => this._inputs.forEach(this.registerInputCallback);

  private registerInputCallback = ([type, key]: InputEventObject) => {
    this.scene.input.keyboard.on(`${INPUT_EVENT_TYPE[type]}-${INPUT_KEY[key]}`, (e: any) =>
      this._inputsBuffer.push([type, key])
    );
  };

  private destroyInputEvents = () => {
    const {
      inputEventArchetypes: archetypes,
      inputEventArchetypes: { length },
      destroyEntity,
    } = this;

    for (let j = 0; j < length; j++) {
      const { entityIdDenseList, elementCount } = archetypes[j];
      for (let i = 0; i < elementCount; i++) destroyEntity(entityIdDenseList[i]);
    }
  };

  private createInputEvents = () => {
    const {
      playerArchetypes: archetypes,
      playerArchetypes: { length },
    } = this;

    for (let j = 0; j < length; j++) {
      const { entityIdDenseList, elementCount } = archetypes[j];

      for (let i = 0; i < elementCount; i++) {
        const playerEntityId = entityIdDenseList[i];

        this._inputsBuffer.process(([type, key]) => {
          this.addComponent(
            Components.InputEvent,
            this.newEntityId(),
            SCHEMA[Components.InputEvent],
            [type, key, playerEntityId]
          );
        });
      }
    }
  };
}

export default InputListener;
