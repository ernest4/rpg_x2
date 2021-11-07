import { context } from "../../../../tests/jestHelpers";
import Transform from "../../components/Transform";
import PhysicsBody from "../../components/PhysicsBody";
import Movement from "../Movement";
import { Engine } from "../../../ecs";

describe(Movement, () => {
  it("", () => {});

  // let engine: Engine;
  // let described_class: Movement;

  // let entityId = 0;

  // let deltaTime = 1000;

  // beforeEach(() => {
  //   engine = new Engine();
  //   described_class = new Movement(engine);
  //   engine.addSystem(described_class);
  // });

  // describe("#addSystem", () => {
  //   beforeEach(() => {
  //     let entityId = engine.newEntityId();
  //     let transform = new Transform(entityId, { x: 5, y: 6, z: 0 });
  //     let physicsBody = new PhysicsBody(entityId, { x: 100, y: 100, z: 0 }, { x: 0, y: 0, z: 100 });
  //     engine.addComponents(transform, physicsBody);
  //     engine.update(deltaTime);
  //   });

  //   it("updates transforms based on physicsBody", () => {
  //     const transform = engine.getComponentById(entityId, Transform);
  //     expect(transform.position.x).toEqual(105);
  //     expect(transform.position.y).toEqual(106);
  //     expect(transform.rotation.z).toEqual(100);

  //     deltaTime = 2000;
  //     engine.update(deltaTime);

  //     expect(transform.position.x).toEqual(305);
  //     expect(transform.position.y).toEqual(306);
  //     expect(transform.rotation.z).toEqual(300);
  //   });
  // });
});
