import { Engine } from "../../ecs";
import System from "../../ecs/System";
import { EntityId, QuerySet } from "../../ecs/types";
import LoadSpriteEvent from "../components/LoadSpriteEvent";
import Buffer from "../../ecs/utils/Buffer";
import { Sprite } from "../components";
import Phaser from "phaser";
import PhaserSystem from "./abstract/PhaserSystem";
import { LOAD_SPRITE_EVENT } from "../components/queryTags";

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

  start(): void {}

  update(): void {
    this.engine.query(this.queueLoadEvents, LOAD_SPRITE_EVENT);
    // start loading (can call this over and over, even when already loading...no harm)
    this.scene.load.start();
  }

  destroy(): void {}

  private queueLoadEvents = (querySet: QuerySet) => {
    const [{ url, frameConfig, targetEntityId, id }] = querySet as [LoadSpriteEvent];

    this.engine.removeComponentById(id, LOAD_SPRITE_EVENT);
    // NOTE: don't re-request to load something loading/loaded already
    if (this.isTextureLoading(url) || this.isTextureLoaded(url)) return;

    // texture not loaded or loading, request one now.
    this.queueTextureLoad(url, frameConfig, targetEntityId);
  };

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
