import { Engine } from "../../shared/ecs";
import Buffer from "../../shared/ecs/utils/Buffer";
import InputEvent from "../components/InputEvent";
import Phaser from "phaser";
import { Player } from "../components";
import PhaserSystem from "./abstract/PhaserSystem";

export const INPUT_KEYS = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  A: "A",
  W: "W",
  S: "S",
  D: "D",
} as const;

export type INPUT_KEY = typeof INPUT_KEYS[keyof typeof INPUT_KEYS];

export const INPUT_EVENT_TYPES = {
  KEYDOWN: "keydown",
  KEYUP: "keyup",
} as const;

export type INPUT_EVENT_TYPE = typeof INPUT_EVENT_TYPES[keyof typeof INPUT_EVENT_TYPES];

type InputEventObject = [INPUT_EVENT_TYPE, INPUT_KEY];

const DEFAULT_INPUTS: InputEventObject[] = [
  [INPUT_EVENT_TYPES.KEYDOWN, INPUT_KEYS.UP],
  [INPUT_EVENT_TYPES.KEYDOWN, INPUT_KEYS.DOWN],
  [INPUT_EVENT_TYPES.KEYDOWN, INPUT_KEYS.LEFT],
  [INPUT_EVENT_TYPES.KEYDOWN, INPUT_KEYS.RIGHT],
  [INPUT_EVENT_TYPES.KEYDOWN, INPUT_KEYS.A],
  [INPUT_EVENT_TYPES.KEYDOWN, INPUT_KEYS.W],
  [INPUT_EVENT_TYPES.KEYDOWN, INPUT_KEYS.S],
  [INPUT_EVENT_TYPES.KEYDOWN, INPUT_KEYS.D],

  [INPUT_EVENT_TYPES.KEYUP, INPUT_KEYS.UP],
  [INPUT_EVENT_TYPES.KEYUP, INPUT_KEYS.DOWN],
  [INPUT_EVENT_TYPES.KEYUP, INPUT_KEYS.LEFT],
  [INPUT_EVENT_TYPES.KEYUP, INPUT_KEYS.RIGHT],
  [INPUT_EVENT_TYPES.KEYUP, INPUT_KEYS.A],
  [INPUT_EVENT_TYPES.KEYUP, INPUT_KEYS.W],
  [INPUT_EVENT_TYPES.KEYUP, INPUT_KEYS.S],
  [INPUT_EVENT_TYPES.KEYUP, INPUT_KEYS.D],
];

// TODO: jests
class InputListener extends PhaserSystem {
  private _inputs: InputEventObject[];
  private _inputsBuffer: Buffer<InputEventObject> = new Buffer<InputEventObject>();

  constructor(engine: Engine, scene: Phaser.Scene, inputs: InputEventObject[] = DEFAULT_INPUTS) {
    super(engine, scene);
    this._inputs = inputs;
  }

  start(): void {
    this.registerInputCallbacks();
  }

  update(): void {
    this.engine.removeComponentsOfClass(InputEvent);
    this.engine.query(this.createInputEvents, Player);
  }

  destroy(): void {}

  private registerInputCallbacks = () => this._inputs.forEach(this.registerInputCallback);

  private registerInputCallback = ([type, key]: InputEventObject) => {
    this.scene.input.keyboard.on(`${type}-${key}`, (e: any) =>
      this._inputsBuffer.push([type, key])
    );
  };

  private createInputEvents = ([{ entityId: playerEntityId }]: [Player]) => {
    this._inputsBuffer.process(([type, key]) => {
      const inputEvent = new InputEvent(this.newEntityId(), type, key, playerEntityId);
      this.engine.addComponent(inputEvent);
    });
  };
}

export default InputListener;
