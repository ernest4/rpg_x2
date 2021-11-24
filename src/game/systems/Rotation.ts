import { Engine } from "../../ecs";
import Archetype from "../../ecs/Archetype";
import System from "../../ecs/System";
import { Components } from "../components";

class Rotation extends System {
  archetypes: Archetype[];

  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    this.archetypes = this.view(Components.Rotation, Components.AngularVelocity);
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
          [Components.Rotation]: [rz],
          [Components.AngularVelocity]: [az],
        },
        elementCount,
      } = archetypes[j];

      for (let i = 0; i < elementCount; i++) {
        const newRz = rz[i] + az[i] * seconds;
        rz[i] = 360 < newRz ? newRz - 360 : newRz;
      }
    }
  }

  destroy(): void {}
}

export default Rotation;
