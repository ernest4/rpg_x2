// TODO: jests

import { Component } from "react";
import { EntityId } from "../../../shared/ecs/types";

// TODO: sketches ...
abstract class PhaserComponent<
  T extends Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | Phaser.Sound.BaseSound
> extends Component {
  phaserResource: T;

  constructor(entityId: EntityId, phaserResource: T) {
    super(entityId);
    // this.frame = 0;
    this.phaserResource = phaserResource;
    // this.loadConfig = ...???
  }
}

export default PhaserComponent;
