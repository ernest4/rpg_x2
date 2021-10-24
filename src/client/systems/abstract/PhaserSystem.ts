import System from "../../../ecs/System";
import { Engine } from "../../../ecs";
import Phaser from "phaser";

// TODO: jests
abstract class PhaserSystem extends System {
  private readonly _scene: Phaser.Scene;

  constructor(engine: Engine, scene: Phaser.Scene) {
    super(engine);
    this._scene = scene;
  }

  isPhaserTextureMissing = (textureUrl: string): boolean => {
    return this._scene.textures.get(textureUrl).key === "__MISSING";
  };

  isPhaserTexturePresent = (textureUrl: string): boolean => {
    return !this.isPhaserTextureMissing(textureUrl);
  };

  get scene() {
    return this._scene;
  }
}

export default PhaserSystem;
