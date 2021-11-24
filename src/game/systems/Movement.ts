import { Engine } from "../../ecs";
import Archetype from "../../ecs/Archetype";
import System from "../../ecs/System";
import { Components } from "../components";

class Movement extends System {
  archetypes: Archetype[];

  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    this.archetypes = this.view(Components.Velocity, Components.Position);
  }

  update(): void {
    const {
      archetypes,
      archetypes: { length },
    } = this;

    const seconds = this.deltaTime / 1000;

    for (let j = 0; j < length; j++) {
      const {
        components: {
          [Components.Position]: [x, y, z],
          [Components.Velocity]: [dx, dy, dz],
        },
        elementCount,
      } = archetypes[j];

      for (let i = 0; i < elementCount; i++) {
        x[i] += dx[i] * seconds;
        y[i] += dy[i] * seconds;
        z[i] += dz[i] * seconds;
      }
    }
  }

  destroy(): void {}
}

export default Movement;
