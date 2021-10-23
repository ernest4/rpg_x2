import { Engine } from "../../shared/ecs";
import System from "../../shared/ecs/System";
import { EntityId, QuerySet } from "../../shared/ecs/types";
import LoadSpriteEvent from "../components/LoadSpriteEvent";
import Buffer from "../../shared/ecs/utils/Buffer";
import { Sprite } from "../components";
import Phaser from "phaser";

type LoadEvent = {
  key: string;
  type: string;
  texture: Phaser.Textures.Texture;
  targetEntityId: EntityId;
};

// TODO: jests
class SpriteLoader extends System {
  private _scene: Phaser.Scene;
  private _loadEventsBuffer: Buffer<LoadEvent>;
  private _requestedTextures: { [key: string]: string };

  constructor(engine: Engine, scene: Phaser.Scene) {
    super(engine);
    this._scene = scene;
    this._loadEventsBuffer = new Buffer<LoadEvent>();
    this._requestedTextures = {};
  }

  start(): void {}

  update(): void {
    this.engine.query(this.queueLoadEvents, LoadSpriteEvent);
    // start loading (can call this over and over, even when already loading...no harm)
    this._scene.load.start();
  }

  destroy(): void {}

  private queueLoadEvents = (querySet: QuerySet) => {
    const [{ url, frameConfig, targetEntityId, id }] = querySet as [LoadSpriteEvent];

    this.engine.removeComponentById(id, LoadSpriteEvent);
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

  // Not sure if this works as intended: https://photonstorm.github.io/phaser3-docs/Phaser.Textures.TextureManager.html
  private isPhaserTextureMissing = (textureUrl: string): boolean => {
    return this._scene.textures.get(textureUrl).key === "__MISSING";
  };

  private queueTextureLoad = (
    url: string,
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig,
    targetEntityId: EntityId
  ) => {
    const pendingLoad = this._scene.load.spritesheet({ key: url, url, frameConfig });
    pendingLoad.on(
      "filecomplete",
      (key, type, texture) => this.addLoadEvent(key, type, texture, targetEntityId),
      this._scene
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
