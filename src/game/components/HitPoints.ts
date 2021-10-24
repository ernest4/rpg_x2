import { Component } from "react";
import { EntityId } from "../../ecs/types";

class HitPoints extends Component {
  hitPoints: number;

  constructor(entityId: EntityId, hitPoints: number) {
    super(entityId);
    this.hitPoints = hitPoints;
  }
}

export default HitPoints;
