import { Engine } from "../../shared/ecs";
import System from "../../shared/ecs/System";
import { QuerySet } from "../../shared/ecs/types";
import LoadSpriteEvent from "../components/LoadSpriteEvent";
import Sprite from "../components/Sprite";
import Transform from "../components/Transform";

// TODO: jests
class SpriteRender extends System {
  private _scene: Phaser.Scene;

  constructor(engine: Engine, scene: Phaser.Scene) {
    super(engine);
    this._scene = scene;
  }

  start(): void {}

  update(): void {
    this.engine.query(this.updateSprites, Transform, Sprite);
  }

  destroy(): void {}

  private updateSprites = (querySet: QuerySet) => {
    const [{ position, rotation, scale }, sprite] = querySet as [Transform, Sprite];
    const { phaserSprite, url } = sprite;

    if (!this.phaserSpriteReady(phaserSprite)) {
      if (this.textureReady(url)) this.replacePhaserSprite(sprite);
      else this.initLoad(sprite);
    }

    phaserSprite.x = position.x;
    phaserSprite.y = position.y;
    phaserSprite.angle = rotation.z;
    phaserSprite.scaleX = scale.x;
    phaserSprite.scaleY = scale.y;
  };

  private phaserSpriteReady = (phaserSprite: Phaser.GameObjects.Sprite) => {
    return phaserSprite && phaserSprite.texture.key !== "__MISSING";
  };

  private textureReady = (url: string) => {
    return this._scene.textures.get(url).key !== "__MISSING";
  };

  private replacePhaserSprite = (sprite: Sprite) => {
    sprite.phaserSprite.destroy(); // NOTE: cleanup, don't leak phaser objects!
    sprite.phaserSprite = this._scene.add.sprite(0, 0, sprite.url);
  };

  private initLoad = ({ url, frameConfig, entityId }: Sprite) => {
    this.engine.addComponent(new LoadSpriteEvent(this.newEntityId(), url, frameConfig, entityId));
  };
}

export default SpriteRender;
