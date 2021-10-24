import { Component } from "react";
import { EntityId } from "../../ecs/types";

class Name extends Component {
  name: string;

  constructor(entityId: EntityId, name: string) {
    super(entityId);
    this.name = name;
  }
}

export default Name;
