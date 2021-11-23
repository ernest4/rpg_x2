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
      // let transform = new Transform(entityId, { x: 5, y: 6, z: 0 });
      // let physicsBody = new PhysicsBody(entityId, { x: 100, y: 100, z: 0 }, { x: 0, y: 0, z: 100 });
      // engine.addComponents(transform, physicsBody);
      engine.addComponent(Components.Position, entityId, SCHEMA[Components.Position], [5, 6, 0]);
      engine.addComponent(
        Components.Velocity,
        entityId,
        SCHEMA[Components.Velocity],
        [100, 100, 0]
      );
      engine.addComponent(Components.Rotation, entityId, SCHEMA[Components.Rotation], [0]);
      engine.addComponent(
        Components.AngularVelocity,
        entityId,
        SCHEMA[Components.AngularVelocity],
        [100]
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
      expect(z[entity]).toEqual(100);
      expect(rz[entity]).toEqual(0);

      deltaTime = 2000;
      engine.update(deltaTime);

      expect(x[entity]).toEqual(305);
      expect(y[entity]).toEqual(306);
      expect(z[entity]).toEqual(300);
      expect(rz[entity]).toEqual(200); // buggy? check the movement system..
    });
  });
});
