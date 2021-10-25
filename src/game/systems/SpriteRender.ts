import { QuerySet } from "../../ecs/types";
import { benchmarkSubject } from "../../ecs/utils/benchmark";
import LoadSpriteEvent from "../components/LoadSpriteEvent";
import { LOAD_SPRITE_EVENT, SPRITE, TRANSFORM } from "../components/queryTags";
import Sprite from "../components/Sprite";
import Transform from "../components/Transform";
import PhaserSystem, { __MISSING } from "./abstract/PhaserSystem";

// TODO: jests

class SpriteRender extends PhaserSystem {
  start(): void {}

  update(): void {
    // this.engine.queryInOrder(this.updateSprites, SPRITE, TRANSFORM);
    // this.benchmarkSubject("query", () => {
    //   this.engine.queryN(this.updateSprites, SPRITE, TRANSFORM);
    // });
    this.benchmarkSubject("queryNInOrder", () => {
      this.engine.queryNInOrder(this.updateSprites, SPRITE, TRANSFORM);
    });
    this.benchmarkSubject("queryNInOrder 2", () => {
      this.engine.queryNInOrder2(this.updateSprites, SPRITE, TRANSFORM);
    });
    // this.benchmarkSubject("query two", () => {
    //   this.engine.queryTwo(this.updateSpritesTwo, SPRITE, TRANSFORM);
    // });
    // this.benchmarkSubject("query two in order", () => {
    //   this.engine.queryTwoInOrder(this.updateSpritesTwo, SPRITE, TRANSFORM);
    // });
  }

  destroy(): void {}

  private updateSprites = (querySet: QuerySet) => {
    const [sprite, { position, rotation, scale }] = querySet as [Sprite, Transform];
    let { phaserSprite } = sprite;

    if (!this.phaserSpriteReady(phaserSprite)) {
      if (this.isPhaserTexturePresent(sprite.url)) {
        phaserSprite = this.replacePhaserSprite(sprite);
      } else return this.initLoad(sprite);
    }

    phaserSprite.x = position.x;
    phaserSprite.y = position.y;
    phaserSprite.angle = rotation.z;
    phaserSprite.scaleX = scale.x;
    phaserSprite.scaleY = scale.y;
  };

  private updateSpritesTwo = (sprite: Sprite, { position, rotation, scale }: Transform) => {
    let { phaserSprite } = sprite;

    if (!this.phaserSpriteReady(phaserSprite)) {
      if (this.isPhaserTexturePresent(sprite.url)) {
        phaserSprite = this.replacePhaserSprite(sprite);
      } else return this.initLoad(sprite);
    }

    phaserSprite.x = position.x;
    phaserSprite.y = position.y;
    phaserSprite.angle = rotation.z;
    phaserSprite.scaleX = scale.x;
    phaserSprite.scaleY = scale.y;
  };

  private phaserSpriteReady = (phaserSprite: Phaser.GameObjects.Sprite) => {
    return phaserSprite && phaserSprite.texture.key !== __MISSING;
  };

  private replacePhaserSprite = (sprite: Sprite) => {
    const newPhaserSprite = this.scene.add.sprite(0, 0, sprite.url);
    sprite.phaserSprite = newPhaserSprite;
    return newPhaserSprite;
  };

  private initLoad = (sprite: Sprite) => {
    this.engine.addComponent(
      LOAD_SPRITE_EVENT,
      new LoadSpriteEvent(this.newEntityId(), sprite.url, sprite.frameConfig, sprite.entityId)
    );
  };
}

export default SpriteRender;
