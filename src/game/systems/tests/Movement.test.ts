import { context } from "../../../../tests/jestHelpers";
import { Engine } from "../../../ecs";
import { Components, SCHEMA } from "../../components";
import Movement from "../Movement";

describe(Movement, () => {
  let engine: Engine;
  let described_class: Movement;

  let entityId = 0;

  let deltaTime = 1000;

  beforeEach(() => {
    engine = new Engine(SCHEMA);
    described_class = new Movement(engine);
    engine.addSystem(described_class);
  });

  describe("#addSystem", () => {
    beforeEach(() => {
      let entityId = engine.newEntityId();
      engine.addComponent(Components.Position, entityId, SCHEMA[Components.Position], [5, 6, 1]);
      engine.addComponent(
        Components.Velocity,
        entityId,
        SCHEMA[Components.Velocity],
        [100, 100, 50]
      );
      engine.addComponent(Components.Rotation, entityId, SCHEMA[Components.Rotation], [0]);
      engine.addComponent(
        Components.AngularVelocity,
        entityId,
        SCHEMA[Components.AngularVelocity],
        [200]
      );
      engine.update(deltaTime);
    });

    it("updates transforms & rotation based on velocity & angularVelocity", () => {
      const [
        {
          [Components.Position]: [x, y, z],
          [Components.Velocity]: [dx, dy, dz],
          [Components.Rotation]: [rz],
          [Components.AngularVelocity]: [az],
        },
        entity,
      ] = engine.getEntity(entityId);

      expect(x[entity]).toEqual(105);
      expect(y[entity]).toEqual(106);
      expect(z[entity]).toEqual(51);
      expect(rz[entity]).toEqual(200);

      deltaTime = 2000;
      engine.update(deltaTime);

      expect(x[entity]).toEqual(305);
      expect(y[entity]).toEqual(306);
      expect(z[entity]).toEqual(151);
      expect(rz[entity]).toEqual(240);
    });
  });
});
