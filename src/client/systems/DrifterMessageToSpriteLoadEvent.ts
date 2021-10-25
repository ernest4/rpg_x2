import { Engine } from "../../ecs";
import System from "../../ecs/System";
import Drifter from "../../shared/components/characterTypes/Drfiter";
import { DrifterMessage } from "../../shared/messages/schema";
import { QuerySet } from "../../ecs/types";
import { Sprite } from "../../components";
import LoadSpriteEvent from "../../components/LoadSpriteEvent";
import { isNumber } from "../../ecs/utils/Number";

class DrifterMessageToSpriteLoadEvent extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {}

  update(): void {
    this.engine.queryN(this.createSpriteLoadEvents, DrifterMessage);
  }

  destroy(): void {}

  private createSpriteLoadEvents = (querySet: QuerySet) => {
    const [{ targetEntityId }] = querySet as [DrifterMessage];

    const entityId = this.engine.getEntityIdByAlias(<number>targetEntityId);
    if (!isNumber(entityId)) return;
    const drifter = this.engine.getOrCreateNullComponentById(entityId, Drifter);
    const sprite = this.engine.getComponentById(drifter.entityId, Sprite);
    if (sprite) return;

    const spriteLoadEvent = new LoadSpriteEvent(
      this.newEntityId(),
      "assets/images/unit_T.png",
      { frameWidth: 32 },
      drifter.entityId
    );
    this.engine.addComponent(spriteLoadEvent);
  };
}

export default DrifterMessageToSpriteLoadEvent;
