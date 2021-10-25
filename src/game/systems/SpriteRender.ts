import { QuerySet } from "../../ecs/types";
import { benchmarkSubject } from "../../ecs/utils/benchmark";
import LoadSpriteEvent from "../components/LoadSpriteEvent";
import Sprite from "../components/Sprite";
import Transform from "../components/Transform";
import PhaserSystem, { __MISSING } from "./abstract/PhaserSystem";

// TODO: jests
class SpriteRender extends PhaserSystem {
  start(): void {}

  update(): void {
    this.benchmarkSubject("old query", () => {
      this.engine.query(this.updateSprites, Transform, Sprite);
    });
    this.benchmarkSubject("new query 2.0", () => {
      this.engine.queryByString2(this.updateSprites, "Transform", "Sprite");
    });
    this.benchmarkSubject("new query 3.0", () => {
      this.engine.queryByNumber(this.updateSprites, 0, 1);
    });
  }

  destroy(): void {}

  private updateSprites = (querySet: QuerySet) => {
    const [{ position, rotation, scale }, sprite] = querySet as [Transform, Sprite];
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
      new LoadSpriteEvent(this.newEntityId(), sprite.url, sprite.frameConfig, sprite.entityId)
    );
  };
}

export default SpriteRender;
