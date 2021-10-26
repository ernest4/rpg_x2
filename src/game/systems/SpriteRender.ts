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
  _aX: number[];
  _aY: number[];
  _aZ: number[];

  start(): void {
    this._a = Array.from(Array(300000).keys());
    this._aX = Array.from(Array(300000).keys());
    this._aY = Array.from(Array(300000).keys());
    this._aZ = Array.from(Array(300000).keys());
  }

  update(): void {
    // this.benchmarkSubject("query two in order", () => {
    // });
    this.benchmarkSubject("array component while", () => {
      const _a = this._a;
      const a_length = this._a.length;
      let i = 0;
      const this_engine_getComponentById = this.engine.getComponentById;
      let transformPosition;
      while (i < a_length) {
        if (50 < i && i < 29000) {
          //
          // this.updateSprites(
          // this.engine.getComponentById(500, SPRITE);
          transformPosition = this_engine_getComponentById<Transform>(i, TRANSFORM).position;
          transformPosition.x = i;
          transformPosition.y = i;
          transformPosition.z = i;
          // this.engine.getComponentById(500, PLAYER);
          // );
        }
        i++;
      }
    });
    this.benchmarkSubject("array component direct access, no get", () => {
      let i = 0;
      const transformComponentList = this.engine._componentLists[TRANSFORM];
      if (!transformComponentList) return;
      const elementCount = transformComponentList._elementCount;
      const denseList = transformComponentList._denseList;
      let transformPosition;
      while (i < elementCount) {
        if (50 < i && i < 29000) {
          //
          // this.updateSprites(
          // this.engine.getComponentById(500, SPRITE);
          transformPosition = (<Transform>denseList[i]).position;
          transformPosition.x = i;
          transformPosition.y = i;
          transformPosition.z = i;
          // this.engine.getComponentById(500, PLAYER);
          // );
        }
        i++;
      }
    });
    this.benchmarkSubject("array component direct access, no get, stream", () => {
      let i = 0;
      const transformComponentList = this.engine._componentLists[TRANSFORM];
      if (!transformComponentList) return;
      const callback = ({position}) => {
        position.x = i;
        position.y = i;
        position.z = i;
        i++;
      }
      // @ts-ignore
      transformComponentList.stream(callback);
    });
    this.benchmarkSubject("array raw while", () => {
      const _aX = this._aX;
      const _aY = this._aY;
      const _aZ = this._aZ;
      const aX_length = this._aX.length;
      let i = 0;
      while (i < aX_length) {
        if (50 < i && i < 29000) {
          _aX[i] && (_aX[i] = i);
          _aY[i] && (_aY[i] = i);
          _aZ[i] && (_aZ[i] = i);
        }
        i++;
      }
    });

    this.benchmarkSubject("queryTwoInOrder", () => {
      this.engine.queryTwoInOrder(this.updateSprites, SPRITE, TRANSFORM);
    });
    this.benchmarkSubject("queryTwoInOrderUnchecked", () => {
      this.engine.queryTwoInOrderUnchecked(this.updateSprites, SPRITE, TRANSFORM);
    });
  }

  destroy(): void {}

  private updateSprites = (sprite: Sprite, { position, rotation, scale }: Transform) => {
    let { phaserSprite } = sprite;

    // inline: this.phaserSpriteReady()
    if (!(phaserSprite && phaserSprite.texture.key !== __MISSING)) {
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

  // private phaserSpriteReady = (phaserSprite: Phaser.GameObjects.Sprite) => {
  //   return phaserSprite && phaserSprite.texture.key !== __MISSING;
  // };

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
