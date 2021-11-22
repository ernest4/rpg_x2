import { Engine } from "../../ecs";
import System from "../../ecs/System";
import { EntityId } from "../../ecs/types";
import Buffer from "../../ecs/utils/Buffer";
import Phaser from "phaser";
import PhaserSystem from "./abstract/PhaserSystem";
import { Components } from "../scenes/Main";
import Archetype from "../../ecs/Archetype";
import Assets, { Resources } from "../Assets";

type LoadEvent = {
  key: string;
  type: string;
  texture: Phaser.Textures.Texture;
  targetEntityId: EntityId;
};

// TODO: jests
class SpriteLoader extends PhaserSystem {
  private _loadEventsBuffer: Buffer<LoadEvent> = new Buffer<LoadEvent>();
  private _requestedTextures: { [key: string]: string } = {};
  archetypes: Archetype[];

  start(): void {
    this.archetypes = this.view(Components.LoadSpriteEvent);
  }

  update(): void {
    // this.engine.queryOne(this.queueLoadEvents, LOAD_SPRITE_EVENT);

    const {
      archetypes,
      archetypes: { length },
    } = this;

    for (let j = 0; j < length; j++) {
      const {
        components: {
          [Components.LoadSpriteEvent]: [
            urlIndex,
            frameWidth,
            frameHeight,
            startFrame,
            endFrame,
            margin,
            spacing,
            targetEntityId,
          ],
        },
        entityIdDenseList,
        elementCount,
      } = archetypes[j];

      for (let i = 0; i < elementCount; i++) {
        const url = Assets.getResource(Resources.image, urlIndex[i]);
        // NOTE: don't re-request to load something loading/loaded already
        if (this.isTextureLoading(url) || this.isTextureLoaded(url)) continue;

        // texture not loaded or loading, request one now.
        const frameConfig = {
          frameWidth: frameWidth[i],
          frameHeight: frameHeight[i],
          startFrame: startFrame[i],
          endFrame: endFrame[i],
          margin: margin[i],
          spacing: spacing[i],
        };
        this.queueTextureLoad(url, frameConfig, targetEntityId[i]);

        this.destroyEntity(entityIdDenseList[i]);
      }
    }

    // start loading (can call this over and over, even when already loading...no harm)
    this.scene.load.start();
  }

  destroy(): void {}

  // private queueLoadEvents = ({ url, frameConfig, targetEntityId, id }: LoadSpriteEvent) => {
  //   this.engine.removeComponentById(id, LOAD_SPRITE_EVENT);
  //   // NOTE: don't re-request to load something loading/loaded already
  //   if (this.isTextureLoading(url) || this.isTextureLoaded(url)) return;

  //   // texture not loaded or loading, request one now.
  //   this.queueTextureLoad(url, frameConfig, targetEntityId);
  // };

  private isTextureLoading = (url: string) => {
    return this._requestedTextures[url] && this.isPhaserTextureMissing(url);
  };

  private isTextureLoaded = (url: string) => {
    return this._requestedTextures[url] && !this.isPhaserTextureMissing(url);
  };

  private queueTextureLoad = (
    url: string,
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig,
    targetEntityId: EntityId
  ) => {
    const pendingLoad = this.scene.load.spritesheet({ key: url, url, frameConfig });
    pendingLoad.on(
      "filecomplete",
      (key, type, texture) => this.addLoadEvent(key, type, texture, targetEntityId),
      this.scene
    );
    this._requestedTextures[url] = url;
  };

  private addLoadEvent = (
    key: string,
    type: string,
    texture: Phaser.Textures.Texture,
    targetEntityId: EntityId
  ) => {
    this._loadEventsBuffer.push({ key, type, texture, targetEntityId });
  };
}

export default SpriteLoader;

// function addImage (key, type, thing)
// {
//     console.log(key);
//     console.log(type);
//     console.log(thing);
//     this.add.image(400, 300, key);
// }
