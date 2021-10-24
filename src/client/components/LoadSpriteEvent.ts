import Component from "../../ecs/Component";
import Event from "../../ecs/component/interfaces/Event";
import { EntityId } from "../../ecs/types";
import Phaser from "phaser";

class LoadSpriteEvent extends Component implements Event {
  url: string;
  private _frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
  targetEntityId: EntityId;

  constructor(
    entityId: EntityId,
    url: string,
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig,
    targetEntityId: EntityId
  ) {
    super(entityId);
    this.url = url;
    this._frameConfig = frameConfig;
    this.targetEntityId = targetEntityId;
  }

  get frameConfig(): Phaser.Types.Loader.FileTypes.ImageFrameConfig {
    return this._frameConfig;
  }
}

export default LoadSpriteEvent;
