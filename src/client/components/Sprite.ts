import Component from "../../shared/ecs/Component";
import { EntityId } from "../../shared/ecs/types";
import Phaser from "phaser";

// TODO: when removing sprite, make sure to destroy the phaserSprite gameObject or it will leak memory!
class Sprite extends Component {
  phaserSprite: Phaser.GameObjects.Sprite;
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
}

export default Sprite;
