import { Scene } from "phaser";
import { Engine } from "../../ecs";
import { Archetypes } from "../../ecs/Archetype";
import { benchmarkSubject } from "../../ecs/utils/benchmark";
import { assetsPath } from "../../utils/environment";
import Assets, { Resources } from "../Assets";
import { Components, SCHEMA } from "../components";
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

const phaserSprites = [];
const urls = [];

class SpriteRender extends PhaserSystem {
  archetypes: Archetypes;
  assets: Assets;

  constructor(engine: Engine, scene: Scene, assets: Assets) {
    super(engine, scene);
    this.assets = assets;
  }

  start(): void {
    this.archetypes = this.view(
      Components.Sprite,
      Components.Position,
      Components.Rotation,
      Components.Scale
    );
  }

  update(): void {
    const {
      archetypes,
      archetypes: { length },
    } = this;

    for (let j = 0; j < length; j++) {
      const {
        components: {
          [Components.Sprite]: [urlIndex, frameWidth, _phaserSpriteIndex],
          [Components.Position]: [x, y],
          [Components.Rotation]: [rz],
          [Components.Scale]: [sx, sy],
        },
        entityIdDenseList,
        elementCount,
      } = archetypes[j];

      for (let i = 0; i < elementCount; i++) {
        let phaserSpriteIndex = _phaserSpriteIndex[i];
        let phaserSprite = phaserSprites[phaserSpriteIndex];

        if (!(phaserSprite && phaserSprite.texture.key !== __MISSING)) {
          const urlIndexValue = urlIndex[i];
          let url = urls[urlIndexValue];
          if (!url) {
            url = assetsPath(`images/${this.assets.getResource(Resources.image, urlIndexValue)}`);
            urls[urlIndexValue] = url;
          }
          if (this.isPhaserTexturePresent(url)) {
            [phaserSprite, phaserSpriteIndex] = this.replacePhaserSprite(url);
            _phaserSpriteIndex[i] = phaserSpriteIndex;
          } else {
            const sprite: SpriteData = [
              urlIndexValue,
              frameWidth[i],
              frameWidth[i],
              0,
              0,
              0,
              0,
              entityIdDenseList[i],
            ];
            this.initLoad(sprite);
            return;
          }
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

  private replacePhaserSprite = (url: string): [Phaser.GameObjects.Sprite, number] => {
    const newPhaserSprite = this.scene.add.sprite(0, 0, url);
    const index = phaserSprites.push(newPhaserSprite) - 1;
    return [newPhaserSprite, index];
  };

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
