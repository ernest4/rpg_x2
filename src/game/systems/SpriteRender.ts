import { QuerySet } from "../../ecs/types";
import { benchmarkSubject } from "../../ecs/utils/benchmark";
import LoadSpriteEvent from "../components/LoadSpriteEvent";
import { LOAD_SPRITE_EVENT, PLAYER, SPRITE, TRANSFORM } from "../components/queryTags";
import Sprite from "../components/Sprite";
import Transform from "../components/Transform";
import PhaserSystem, { __MISSING } from "./abstract/PhaserSystem";

// TODO: jests

class SpriteRender extends PhaserSystem {
  private _a: any;

  start(): void {
    // this._a = Array.from(Array(30000).keys());
    // this._a = this._a.map(i => (this._a[i] = { components: 0b110011 }));
  }

  update(): void {
    // this.engine.queryInOrder(this.updateSprites, SPRITE, TRANSFORM);
    // this.benchmarkSubject("query", () => {
    //   this.engine.queryN(this.updateSprites, SPRITE, TRANSFORM);
    // });
    // this.benchmarkSubject("query two in order", () => {
    // });
    // this.benchmarkSubject("array", () => {
    //   const _a = this._a;
    //   const a_length = this._a.length;
    //   for (let i = 0; i < a_length; i++) {
    //     if (_a[i].components & 0b110011) {
    //       //
    //       // this.updateSprites(
    //       this.engine.getComponentById(500, SPRITE);
    //       this.engine.getComponentById(500, TRANSFORM);
    //       this.engine.getComponentById(500, PLAYER);
    //       // );
    //     }
    //   }
    // });

    this.engine.queryTwoInOrder(this.updateSprites, SPRITE, TRANSFORM);
  }

  destroy(): void {}

  // private updateSprites = (querySet: QuerySet) => {
  //   const [sprite, { position, rotation, scale }] = querySet as [Sprite, Transform];
  //   let { phaserSprite } = sprite;

  //   if (!this.phaserSpriteReady(phaserSprite)) {
  //     if (this.isPhaserTexturePresent(sprite.url)) {
  //       phaserSprite = this.replacePhaserSprite(sprite);
  //     } else return this.initLoad(sprite);
  //   }

  //   phaserSprite.x = position.x;
  //   phaserSprite.y = position.y;
  //   phaserSprite.angle = rotation.z;
  //   phaserSprite.scaleX = scale.x;
  //   phaserSprite.scaleY = scale.y;
  // };

  private updateSprites = (sprite: Sprite, { position, rotation, scale }: Transform) => {
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
