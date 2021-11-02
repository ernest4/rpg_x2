import { Engine } from "../../ecs";
import System from "../../ecs/System";
import PhysicsBody from "../components/PhysicsBody";
import { Components } from "../components/queryTags";
import Position from "../components/Transform";

//
// class Transform extends Component {
//   constructor() {
//     super();
//     // TODO: will auto create componentTypeId...
//     this.x; // flat params only ?!?
//     this.y;
//     // this.position.x // <= indirection too expensive, split into subcomponent?
//   }
// }

// class Position extends Component { // TODO: will auto create componentTypeId...
//   constructor() {
//     super();
//     this.x; // flat params only ?!?
//     this.y;
//   }
// }
// class LinearVelocity extends Component {}

// what archetype looks like under the hood...?
// class Archetype {
//   constructor(...component: []){
//     this.mask ...

//     // for each component create key with arrays for values
//     // this.positions = {x: [], y: [], z: []} ...
//   }
// }

// class Testy<T> {
//   constructor(params: T) {}
//   add = (params: T) => {};
// }

// new Testy({ x: 0, y: "s", z: new Object() }).add({ x: 5, y: "h", z: {} });

class Movement extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    // this.Transforms = this.components[Components.Transform];
    // this.PhysicsBodies = this.components[Components.PhysicsBody];
    // const [positions, linearVelocities] = this.getArchetype(Position, LinearVelocity);
    // this.positions = positions;
    // this.linearVelocities = linearVelocities;

    // this.components[Components.Transform].x.add(entityId, 5)

    // components will have signature ids (NOT ENTITY IDS!)
    // const Transform = {id: componentID, x: 123, y: 123, z:123} // auto generated ID
    const schema = { x: 123, y: 123, z: 123 }; // auto generated ID
    this.engine.defineComponent({ Position: schema });

    // this.engine.components[POSITION]

    // auto generated ID
    this.engine.defineComponents(new Position({ x: 123, y: 123, z: 123 }));
    this.engine.defineComponents(new Position("x,y,z"));

    const LinearVelocities = { dx: 123, dy: 123, dz: 123 }; // auto generated ID
    this.engine.defineComponents(LinearVelocities);

    // true for full owning
    this.engine.defineQueryGroup(true, Position, LinearVelocities);

    // full owning sub group
    this.engine.defineQueryGroup(true, Position, LinearVelocities, Sprite);

    // partial owning group (slower, avoid)
    this.engine.defineQueryGroup(false, Position, Sprites);

    // how add/remove ? look like
    // this.engine.addComponent(Position, { entityId: 123, x: 1, y: 2, z: 3 });
    // // OR
    // this.engine.addComponent(Position.new({ x: 1, y: 2, z: 3 }));
    // OR
    this.engine.Positions.add({ entityId: 123, x: 1, y: 2, z: 3 });
    // OR
    this.engine.Positions.add(entityId, { x: 1, y: 2, z: 3 });
    this.engine.Positions.remove(entityId);
    const { x, y, z } = this.engine.Positions.get(entityId);
    const x = this.engine.Positions.get(entityId, "x");
    this.engine.Positions.set(entityId, { x: 1 });

    // starting to look like DB table :D
    // const { x, y, z, dx, dy, dz } = this.engine.Positions.joins(this.engine.LinearVelocities).get(
    //   entityId
    // );
  }

  update(): void {
    // this.benchmarkSubject("queryTwoInOrderUnchecked", () => {
    //   this.engine.queryTwoInOrderUnchecked(this.updateTransforms, PHYSICS_BODY, TRANSFORM);
    // });
    // this.benchmarkSubject("raw query", () => {
    // });
    const seconds = this.deltaTime / 1000;

    // query gets the archetype matching component signatures
    // const [positions, linearVelocities] = this.query(Position, LinearVelocity);
    const [{ x, y, z }, { dx, dy, dz }, count] = this.queryGroup(Position, LinearVelocity);
    // archetype based?
    // const [transforms, physicsBodies] = this.query();
    for (let i = 0; i < count; i++) {
      // const tranform = transforms[i];
      // const physicsBody = physicsBodies[i];
      // this.Position.x[entityId] += this.Velocity.x[entityId];
      // this.Position.y[entityId] += this.Velocity.y[entityId];

      x[i] += dx[i] * seconds;
      y[i] += dy[i] * seconds;
      z[i] += dz[i] * seconds;

      // const newRotationZ = rotation.z + angularVelocity.z * seconds;
      // rotation.z = 360 < newRotationZ ? newRotationZ - 360 : newRotationZ;
    }

    // regular query

    const [{ x, y, z }, { dx, dy, dz }, count] = this.query(Position, LinearVelocity);
    // archetype based?
    // const [transforms, physicsBodies] = this.query();
    for (let i = 0; i < count; i++) {
      // const tranform = transforms[i];
      // const physicsBody = physicsBodies[i];
      // this.Position.x[entityId] += this.Velocity.x[entityId];
      // this.Position.y[entityId] += this.Velocity.y[entityId];

      x[i] += dx[i] * seconds;
      y[i] += dy[i] * seconds;
      z[i] += dz[i] * seconds;

      // const newRotationZ = rotation.z + angularVelocity.z * seconds;
      // rotation.z = 360 < newRotationZ ? newRotationZ - 360 : newRotationZ;
    }
  }

  // update(): void {
  //   // this.benchmarkSubject("queryTwoInOrderUnchecked", () => {
  //   //   this.engine.queryTwoInOrderUnchecked(this.updateTransforms, PHYSICS_BODY, TRANSFORM);
  //   // });
  //   // this.benchmarkSubject("raw query", () => {
  //   // });
  //   // this.engine.queryTwoInOrderUnchecked(this.updateTransforms, PHYSICS_BODY, TRANSFORM);
  //   const pbComponentList = this.engine._componentLists[PHYSICS_BODY];
  //   const tComponentList = this.engine._componentLists[TRANSFORM];
  //   if (!pbComponentList) return;
  //   const elementCount = pbComponentList._elementCount;
  //   const denseList = pbComponentList._denseList;
  //   // let pbLinearVelocity;
  //   for (let i = 0; i < elementCount; i++) {
  //     // pbLinearVelocity = (<PhysicsBody>denseList[i]).linearVelocity;
  //     // pbLinearVelocity.x = i;
  //     // pbLinearVelocity.y = i;
  //     // pbLinearVelocity.z = i;
  //     this.updateTransforms(<PhysicsBody>denseList[i], <Transform>tComponentList.getUnchecked(i));
  //   }
  // }

  destroy(): void {}

  // private updateTransforms = (
  //   { linearVelocity, angularVelocity }: PhysicsBody,
  //   { position, rotation }: Transform
  // ) => {
  //   const seconds = this.deltaTime / 1000;

  //   position.x = position.x + linearVelocity.x * seconds;
  //   position.y = position.y + linearVelocity.y * seconds;
  //   position.z = position.z + linearVelocity.z * seconds;

  //   const newRotationZ = rotation.z + angularVelocity.z * seconds;
  //   rotation.z = 360 < newRotationZ ? newRotationZ - 360 : newRotationZ;
  // };
}

export default Movement;
