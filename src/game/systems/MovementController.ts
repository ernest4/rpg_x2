import { Engine } from "../../ecs";
import Archetype, { SOA } from "../../ecs/Archetype";
import System from "../../ecs/System";
import { Components } from "../components";
import { INPUT_EVENT_TYPE, INPUT_KEY } from "./InputListener";

// TODO: jests
class MovementController extends System {
  archetypes: Archetype[];

  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    this.archetypes = this.view(Components.InputEvent);
  }

  update(): void {
    const {
      archetypes,
      archetypes: { length },
    } = this;

    for (let j = 0; j < length; j++) {
      const {
        components: {
          [Components.InputEvent]: [type, key, targetEntityId],
        },
        elementCount,
      } = archetypes[j];

      for (let i = 0; i < elementCount; i++) {
        const [
          {
            [Components.Velocity]: velocities,
            [Components.Speed]: [speed],
          },
          entity,
        ] = this.getEntity(targetEntityId[i]);

        this.applyInputEvent(type[i], key[i], velocities, speed[entity], entity);
      }
    }
  }

  destroy(): void {}

  private applyInputEvent = (
    type: INPUT_EVENT_TYPE,
    key: INPUT_KEY,
    [dx, dy, dz]: SOA,
    speed: number,
    entity: number
  ) => {
    switch (key) {
      case INPUT_KEY.A:
        if (type === INPUT_EVENT_TYPE.keyup && dx[entity] < 0) {
          dx[entity] = 0;
          break;
        }

        if (type === INPUT_EVENT_TYPE.keydown) dx[entity] = -speed;
        break;
      case INPUT_KEY.D:
        if (type === INPUT_EVENT_TYPE.keyup && 0 < dx[entity]) {
          dx[entity] = 0;
          break;
        }

        if (type === INPUT_EVENT_TYPE.keydown) dx[entity] = speed;
        break;
      case INPUT_KEY.W:
        if (type === INPUT_EVENT_TYPE.keyup && dy[entity] < 0) {
          dy[entity] = 0;
          break;
        }

        if (type === INPUT_EVENT_TYPE.keydown) dy[entity] = -speed;
        break;
      case INPUT_KEY.S:
        if (type === INPUT_EVENT_TYPE.keyup && 0 < dy[entity]) {
          dy[entity] = 0;
          break;
        }

        if (type === INPUT_EVENT_TYPE.keydown) dy[entity] = speed;
        break;
    }
  };
}

export default MovementController;
