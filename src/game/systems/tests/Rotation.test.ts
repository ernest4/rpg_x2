import { context } from "../../../../tests/jestHelpers";
import { Engine } from "../../../ecs";
import { Components, SCHEMA } from "../../components";
import Rotation from "../Rotation";

describe(Rotation, () => {
  let engine: Engine;
  let described_class: Rotation;

  let entityId = 0;

  let deltaTime = 1000;

  beforeEach(() => {
    engine = new Engine(SCHEMA);
    described_class = new Rotation(engine);
    engine.addSystem(described_class);
  });

  describe("#addSystem", () => {
    beforeEach(() => {
      let entityId = engine.newEntityId();
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
          [Components.Rotation]: [rz],
          [Components.AngularVelocity]: [az],
        },
        entity,
      ] = engine.getEntity(entityId);

      expect(rz[entity]).toEqual(200);

      deltaTime = 2000;
      engine.update(deltaTime);

      expect(rz[entity]).toEqual(240);
    });
  });
});
