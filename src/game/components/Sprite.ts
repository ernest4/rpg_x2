import Component from "../../ecs/Component";
import { EntityId } from "../../ecs/types";
import Phaser from "phaser";

// TODO: when removing sprite, make sure to destroy the phaserSprite gameObject or it will leak memory!
class Sprite extends Component {
  private _phaserSprite: Phaser.GameObjects.Sprite;
  url: string;
  frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig;

  constructor(
    entityId: EntityId,
    url: string,
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig
  ) {
    super(entityId);
    // this.frame = 0;
    this.url = url;
    this.frameConfig = frameConfig;
  }

  set phaserSprite(newPhaserSprite: Phaser.GameObjects.Sprite) {
    this._phaserSprite?.destroy(); // NOTE: cleanup, don't leak phaser objects!
    this._phaserSprite = newPhaserSprite;
  }

  get phaserSprite() {
    return this._phaserSprite;
  }
}

export default Sprite;
