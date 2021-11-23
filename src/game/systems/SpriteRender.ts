import Archetype from "../../ecs/Archetype";
import { benchmarkSubject } from "../../ecs/utils/benchmark";
import { assetsPath } from "../../utils/environment";
import Assets, { Resources } from "../Assets";
import { Components, SCHEMA } from "../scenes/Main";
import PhaserSystem, { __MISSING } from "./abstract/PhaserSystem";

// TODO: jests

type SpriteData = [
  url: number,
  frameWidth: number,
  frameHeight: number,
  startFrame: number,
  endFrame: number,
  margin: number,
  spacing: number,
  targetEntityId: number
];

class SpriteRender extends PhaserSystem {
  archetypes: Archetype[];

  start(): void {
    this.archetypes = this.view(
      Components.Sprite,
      Components.Position,
      Components.Rotation,
      Components.Scale
    );
  }

  update(): void {
    // this.benchmarkSubject("query two in order", () => {
    // });
    // this.engine.queryTwoInOrder(this.updateSprites, SPRITE, TRANSFORM);

    const {
      archetypes,
      archetypes: { length },
    } = this;

    for (let j = 0; j < length; j++) {
      const {
        components: {
          [Components.Sprite]: [urlIndex, frameWidth, _phaserSpriteIndex],
          [Components.Position]: [x, y, z],
          [Components.Rotation]: [rz],
          [Components.Scale]: [sx, sy, sz],
        },
        entityIdDenseList,
        elementCount,
      } = archetypes[j];

      for (let i = 0; i < elementCount; i++) {
        let phaserSpriteIndex = _phaserSpriteIndex[i];
        let phaserSprite = Assets.getResource(Resources.phaserSprite, phaserSpriteIndex);
        const url = assetsPath(`images/${Assets.getResource(Resources.image, urlIndex[i])}`);
        const sprite: SpriteData = [
          urlIndex[i],
          frameWidth[i],
          frameWidth[i],
          0,
          0,
          0,
          0,
          entityIdDenseList[i],
        ];

        if (!(phaserSprite && phaserSprite.texture.key !== __MISSING)) {
          if (this.isPhaserTexturePresent(url)) {
            [phaserSprite, phaserSpriteIndex] = this.replacePhaserSprite(url);
            _phaserSpriteIndex[i] = phaserSpriteIndex;
          } else return this.initLoad(sprite);
        }

        phaserSprite.x = x[i];
        phaserSprite.y = y[i];
        phaserSprite.angle = rz[i];
        phaserSprite.scaleX = sx[i];
        phaserSprite.scaleY = sy[i];
      }
    }
  }

  destroy(): void {}

  // private updateSprites = (sprite: Sprite, { position, rotation, scale }: Transform) => {
  //   let { phaserSprite } = sprite;

  //   // inline: this.phaserSpriteReady()
  //   if (!(phaserSprite && phaserSprite.texture.key !== __MISSING)) {
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

  // private phaserSpriteReady = (phaserSprite: Phaser.GameObjects.Sprite) => {
  //   return phaserSprite && phaserSprite.texture.key !== __MISSING;
  // };

  private replacePhaserSprite = (url: string): [Phaser.GameObjects.Sprite, number] => {
    const newPhaserSprite = this.scene.add.sprite(0, 0, url);
    // sprite.phaserSprite = newPhaserSprite;
    const index = Assets.putResource(Resources.phaserSprite, newPhaserSprite);
    return [newPhaserSprite, index];
  };

  // private initLoad = (sprite: Sprite) => {
  //   this.engine.addComponent(
  //     LOAD_SPRITE_EVENT,
  //     new LoadSpriteEvent(this.newEntityId(), sprite.url, sprite.frameConfig, sprite.entityId)
  //   );
  // };

  private initLoad = (sprite: SpriteData) => {
    this.addComponent(
      Components.LoadSpriteEvent,
      this.newEntityId(),
      SCHEMA[Components.LoadSpriteEvent],
      sprite
    );
  };
}

export default SpriteRender;
