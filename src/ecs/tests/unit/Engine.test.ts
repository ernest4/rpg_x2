import { context } from "../../../../tests/jestHelpers";
import { Vector2f, f32, i32, Vector2i } from "../../Component";
// import Component from "../../Component";
import Engine from "../../Engine";
import System from "../../System";
import { benchmark, benchmarkSubject } from "../../utils/benchmark";
import SparseSet from "../../utils/SparseSet";
import NumberComponent from "../helpers/components/NumberComponent";
import StrictNumberComponent from "../helpers/components/StrictNumberComponent";
import StringComponent from "../helpers/components/StringComponent";

const createMaskFromComponentIds = (...componentIds: number[]) => {
  const newMask = [];
  for (let i = 0, l = componentIds.length; i < l; i++) {
    const componentId = componentIds[i];
    newMask[~~(componentId / 32)] ^= 1 << componentId % 32;
  }
  return newMask;
};

const enum Components {
  component0,
  component1,
  component2,
  component3,
}

let component0 = Vector2f;
let component1 = [f32("dx"), f32("dy")];
let component2 = [f32("u"), i32("v"), i32("t")];
let component3 = [i32("t")];

let schema = {
  [Components.component0]: component0,
  [Components.component1]: component1,
  // [Components.component2]: component2,
  // [Components.component3]: component3,
};

class TestySystem extends System {
  // TODO: ...
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {
    // TODO: add some entities for testing...

    throw new Error("Method not implemented.");
  }
  update(): void {
    throw new Error("Method not implemented.");
  }
  destroy(): void {
    throw new Error("Method not implemented.");
  }
}

class QuerySystem extends System {
  constructor(engine: Engine) {
    super(engine);
  }

  start(): void {}
  update(): void {
    const archetypes = this.view(Components.component0, Components.component1);
    for (let j = 0, l = archetypes.length; j < l; j++) {
      const {
        components: {
          [Components.component0]: [x, y],
          [Components.component1]: [dx, dy],
        },
        elementCount,
      } = archetypes[j];

      for (let i = 0; i < elementCount; i++) {
        x[i] += dx[i];
        y[i] += dy[i];
      }
    }
  }
  destroy(): void {}
}

// class TestySystem2 extends System {
//
// }

// class TestySystem3 extends System {
//
// }

describe(Engine, () => {
  // let component0.id = 0;
  // let component1.id = 1;
  // let componentId2 = 2;
  // let componentId3 = 3; // NOTE: not in schema by default

  // let schema = {
  //   [component0.id]: ["x", "y"],
  //   [component1.id]: ["dx", "dy"],
  //   [componentId2]: ["u", "v", "t"],
  // };

  let engine: Engine;
  let querySystem1: System;
  // let testySystem1: System;
  // let testySystem2: System;
  // let testySystem3: System;

  // let entityId = 0;
  // let entityId2 = 1;
  // let entityId3 = 2;

  // let queryCallBackFunction: jest.Mock<any, any>;
  // let queryCallBackFunction2: jest.Mock<any, any>;

  // let component: Component;
  // let component2: Component;
  // let component3: Component;

  beforeEach(() => {
    engine = new Engine(schema);

    querySystem1 = new QuerySystem(engine);
    engine.addSystem(querySystem1);

    // testySystem1 = new TestySystem(engine);
    // testySystem1.start = jest.fn();
    // testySystem1.update = jest.fn();

    // testySystem2 = new TestySystem(engine);
    // testySystem2.start = jest.fn();
    // testySystem2.update = jest.fn();

    // testySystem3 = new TestySystem(engine);
    // testySystem3.start = jest.fn();
    // testySystem3.update = jest.fn();

    // queryCallBackFunction = jest.fn();
    // queryCallBackFunction2 = jest.fn();
  });

  it("placeholder", () => {});

  describe("benchmarks", () => {
    // it("benchmarks add/remove", () => {
    //   for (let i = 0; i < 4000; i++) {
    //     const entityId = engine.newEntityId();
    //     engine.addComponent(entityId, component0.id, schema[component0.id], [i, i + 1]);
    //     engine.addComponent(entityId, component1.id, schema[component1.id], [i + 2, i + 3]);
    //     engine.removeComponent(component0.id, entityId);
    //   }
    // });

    const queryIterations = 10000;
    it("benchmarks query", () => {
      console.log(
        benchmarkSubject("setup", () => {
          for (let i = 0; i < 40000; i++) {
            const entityId = engine.newEntityId();
            engine.addComponent(Components.component0, entityId, schema[Components.component0], [
              i,
              i + 1,
            ]);
            engine.addComponent(Components.component1, entityId, schema[Components.component1], [
              i + 2,
              i + 3,
            ]);
          }
        })
      );

      // const queryId = engine.registerQuery(component0.id, component1.id);
      // const archetypes = engine.queries[queryId];

      let totalTimes = 0;
      // const queryString = engine.registerQuery(component1.id, component0.id);
      const archetypes = engine.view(Components.component1, Components.component0);
      for (let i = 0; i < queryIterations; i++) {
        totalTimes += benchmark(() => {
          // const archetypes = engine.query(queryString);
          // const archetypes = engine.query(queryId);
          // const archetypes = engine.queries[queryId];
          // const archetypes = engine.query(component1.id, component0.id, 6, 4, 3, 7);
          for (let j = 0, l = archetypes.length; j < l; j++) {
            const {
              components: {
                [Components.component0]: [x, y],
                [Components.component1]: [dx, dy],
              },
              elementCount,
            } = archetypes[j];

            // console.log(JSON.stringify([archetypes[j].components, elementCount]));

            for (let i = 0; i < elementCount; i++) {
              x[i] += dx[i];
              y[i] += dy[i];
            }
          }
        });
      }

      const time = totalTimes / queryIterations;
      console.log(`query: ${time}`);
    });

    it("baseline", () => {
      const x = [];
      const y = [];
      const dx = [];
      const dy = [];
      const elementCount = 40000;

      console.log(
        benchmarkSubject("baseline setup", () => {
          for (let i = 0; i < elementCount; i++) {
            x.push(i);
            y.push(i + 1);
            dx.push(i + 2);
            dy.push(i + 3);
          }
        })
      );

      let totalTimes = 0;
      for (let i = 0; i < queryIterations; i++) {
        totalTimes += benchmark(() => {
          for (let i = 0; i < elementCount; i++) {
            x[i] += dx[i];
            y[i] += dy[i];
          }
        });
      }

      const time = totalTimes / queryIterations;
      console.log(`baseline query: ${time}`);
    });
  });

  // describe("#addSystem", () => {
  //   beforeEach(() => {
  //     engine.addSystem(testySystem1);
  //     engine.addSystem(testySystem2);
  //     engine.addSystem(testySystem3);
  //   });

  //   it("calls start() on the system", () => {
  //     expect(testySystem1.start).toBeCalledTimes(1);
  //     expect(testySystem2.start).toBeCalledTimes(1);
  //     expect(testySystem3.start).toBeCalledTimes(1);
  //   });
  // });

  // describe("#addComponent", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     component = new NumberComponent(entityId);
  //   });

  //   context("when component doesn't exist", () => {
  //     beforeEach(() => {
  //       engine.addComponent(component);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("adds the component", () => {
  //       expect(queryCallBackFunction).toBeCalledTimes(1);
  //       expect(queryCallBackFunction).toBeCalledWith([component]);
  //     });
  //   });

  //   context("when component does exist", () => {
  //     beforeEach(() => {
  //       engine.addComponent(component);
  //       engine.addComponent(component);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("adds the component once", () => {
  //       expect(queryCallBackFunction).toBeCalledTimes(1);
  //       expect(queryCallBackFunction).toBeCalledWith([component]);
  //     });
  //   });
  // });

  // describe("#addComponents", () => {
  //   beforeEach(() => {
  //     component = new NumberComponent(entityId);
  //     component2 = new NumberComponent(entityId2);
  //     component3 = new StringComponent(entityId3);
  //   });

  //   context("when components dont exist", () => {
  //     beforeEach(() => {
  //       engine.addComponents(component, component2, component3);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //       engine.query(queryCallBackFunction2, StringComponent);
  //     });

  //     it("adds the component", () => {
  //       expect(queryCallBackFunction).toBeCalledTimes(2);
  //       // NOTE: format: array of array of args (where in case of query arg is also an array!)
  //       // expect(mockFn.mock.calls).toEqual([
  //       //   [arg1, arg2, ...], // First call
  //       //   [arg1, arg2, ...]  // Second call
  //       // ]);
  //       expect(queryCallBackFunction.mock.calls).toEqual([[[component]], [[component2]]]);
  //       expect(queryCallBackFunction2).toBeCalledTimes(1);
  //       expect(queryCallBackFunction2).toBeCalledWith([component3]);
  //     });
  //   });

  //   context("when component does exist", () => {
  //     beforeEach(() => {
  //       engine.addComponents(component, component);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("adds the component once", () => {
  //       expect(queryCallBackFunction).toBeCalledTimes(1);
  //       expect(queryCallBackFunction).toBeCalledWith([component]);
  //     });
  //   });
  // });

  // describe("#removeComponent", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     component = new NumberComponent(entityId);
  //   });

  //   context("when component doesn't exist", () => {
  //     beforeEach(() => {
  //       engine.removeComponent(component);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("does nothing", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });
  //   });

  //   context("when component exists", () => {
  //     beforeEach(() => {
  //       engine.addComponent(component);
  //       engine.removeComponent(component);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("removes the component", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });

  //     context("when no other component has the same entity Id", () => {
  //       it("reclaims the id", () => {
  //         expect(engine.newEntityId()).toEqual(component.id);
  //       });
  //     });

  //     context("when another component has the same entity Id", () => {
  //       beforeEach(() => {
  //         engine.newEntityId();
  //         engine.newEntityId();
  //         engine.newEntityId();
  //         entityId = engine.newEntityId();
  //         component = new NumberComponent(entityId);
  //         engine.addComponent(component);
  //         engine.addComponent(new StringComponent(component.id));
  //         engine.removeComponent(component);
  //       });

  //       it("does not reclaim the id", () => {
  //         expect(engine.newEntityId()).not.toEqual(component.id);
  //       });
  //     });
  //   });
  // });

  // describe("#removeComponents", () => {
  //   beforeEach(() => {
  //     component = new NumberComponent(entityId);
  //     component2 = new NumberComponent(entityId2);
  //     component3 = new StringComponent(entityId3);
  //   });

  //   context("when components dont exist", () => {
  //     beforeEach(() => {
  //       engine.removeComponents(component, component2, component3);

  //       engine.query(queryCallBackFunction, NumberComponent);
  //       engine.query(queryCallBackFunction2, StringComponent);
  //     });

  //     it("does nothing", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //       expect(queryCallBackFunction2).not.toBeCalled();
  //     });
  //   });

  //   context("when components exist", () => {
  //     beforeEach(() => {
  //       engine.addComponent(component);
  //       engine.addComponent(component2);
  //       engine.addComponent(component3);

  //       engine.removeComponentsOfClasses(NumberComponent, StringComponent);

  //       engine.query(queryCallBackFunction, NumberComponent);
  //       engine.query(queryCallBackFunction2, StringComponent);
  //     });

  //     it("removes the components", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //       expect(queryCallBackFunction2).not.toBeCalled();
  //     });
  //   });
  // });

  // describe("#removeComponentsOfClass", () => {
  //   context("when components dont exist", () => {
  //     beforeEach(() => {
  //       engine.removeComponentsOfClass(NumberComponent);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("does nothing", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });
  //   });

  //   context("when components exist", () => {
  //     beforeEach(() => {
  //       component = new NumberComponent(entityId);
  //       engine.addComponent(component);
  //       component2 = new NumberComponent(entityId2);
  //       engine.addComponent(component2);
  //       engine.removeComponentsOfClass(NumberComponent);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("removes the components", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });
  //   });
  // });

  // describe("#removeComponentsOfClasses", () => {
  //   context("when components dont exist", () => {
  //     beforeEach(() => {
  //       engine.removeComponentsOfClasses(NumberComponent, StringComponent);

  //       engine.query(queryCallBackFunction, NumberComponent);
  //       engine.query(queryCallBackFunction2, StringComponent);
  //     });

  //     it("does nothing", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //       expect(queryCallBackFunction2).not.toBeCalled();
  //     });
  //   });

  //   context("when components exist", () => {
  //     beforeEach(() => {
  //       component = new NumberComponent(entityId);
  //       engine.addComponent(component);
  //       component2 = new NumberComponent(entityId2);
  //       engine.addComponent(component2);
  //       component3 = new StringComponent(entityId3);
  //       engine.addComponent(component3);

  //       engine.removeComponentsOfClasses(NumberComponent, StringComponent);

  //       engine.query(queryCallBackFunction, NumberComponent);
  //       engine.query(queryCallBackFunction2, StringComponent);
  //     });

  //     it("removes the components", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //       expect(queryCallBackFunction2).not.toBeCalled();
  //     });
  //   });
  // });

  // describe("#removeComponentById", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     component = new NumberComponent(entityId);
  //   });

  //   context("when component doesn't exist", () => {
  //     beforeEach(() => {
  //       engine.removeComponentById(component.id, NumberComponent);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("does nothing", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });
  //   });

  //   context("when component exists", () => {
  //     beforeEach(() => {
  //       engine.addComponent(component);
  //       engine.removeComponentById(component.id, NumberComponent);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("removes the component", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });

  //     context("when no other component has the same entity Id", () => {
  //       it("reclaims the id", () => {
  //         expect(engine.newEntityId()).toEqual(component.id);
  //       });
  //     });

  //     context("when another component has the same entity Id", () => {
  //       beforeEach(() => {
  //         engine.newEntityId();
  //         engine.newEntityId();
  //         engine.newEntityId();
  //         entityId = engine.newEntityId();
  //         component = new NumberComponent(entityId);
  //         engine.addComponent(component);
  //         engine.addComponent(new StringComponent(component.id));
  //         engine.removeComponentById(component.id, NumberComponent);
  //       });

  //       it("does not reclaim the id", () => {
  //         expect(engine.newEntityId()).not.toEqual(component.id);
  //       });
  //     });
  //   });
  // });

  // describe("#removeComponentsById", () => {
  //   beforeEach(() => {
  //     component = new NumberComponent(entityId);
  //     component2 = new NumberComponent(entityId2);
  //     component3 = new StringComponent(entityId2);
  //     engine.addComponents(component, component2, component3);
  //   });

  //   context("when components dont exist", () => {
  //     beforeEach(() => {
  //       engine.removeComponentsById(entityId, StringComponent);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //       engine.query(queryCallBackFunction2, StringComponent);
  //     });

  //     it("does nothing", () => {
  //       expect(queryCallBackFunction).toBeCalled();
  //       expect(queryCallBackFunction2).toBeCalled();
  //     });
  //   });

  //   context("when components exist", () => {
  //     beforeEach(() => {
  //       engine.removeComponentsById(entityId2, NumberComponent, StringComponent);
  //       engine.query(queryCallBackFunction, NumberComponent);
  //       engine.query(queryCallBackFunction2, StringComponent);
  //     });

  //     it("removes the component", () => {
  //       expect(queryCallBackFunction).toBeCalledTimes(1);
  //       expect(queryCallBackFunction).toBeCalledWith([component]);
  //       expect(queryCallBackFunction2).not.toBeCalled();
  //     });
  //   });
  // });

  // describe("#getComponentById", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     component = new NumberComponent(entityId);
  //     engine.addComponent(component);
  //   });

  //   context("when entity has component", () => {
  //     it("returns component", () => {
  //       expect(engine.getComponentById(entityId, NumberComponent)).toEqual(component);
  //     });
  //   });

  //   context("when entity does not have the component", () => {
  //     beforeEach(() => {
  //       engine.removeComponent(component);
  //     });

  //     it("returns null", () => {
  //       expect(engine.getComponentById(entityId, NumberComponent)).toEqual(null);
  //     });
  //   });

  //   context("when no component of that type exists at all", () => {
  //     it("returns null", () => {
  //       expect(engine.getComponentById(entityId, StringComponent)).not.toBeDefined();
  //     });
  //   });
  // });

  // describe("#withComponent", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     component = new NumberComponent(entityId);
  //     engine.addComponent(component);
  //   });

  //   context("when entity has component", () => {
  //     it("returns component", () => {
  //       engine.withComponent(
  //         presentComponent => expect(presentComponent).toEqual(component),
  //         entityId,
  //         NumberComponent
  //       );
  //     });
  //   });

  //   context("when entity does not have the component", () => {
  //     beforeEach(() => {
  //       engine.withComponent(queryCallBackFunction, entityId, StringComponent);
  //     });

  //     it("doesn't call back", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });
  //   });
  // });

  // describe("#getComponentsById", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     component = new NumberComponent(entityId);
  //     component2 = new StringComponent(entityId);
  //     engine.addComponents(component, component2);
  //   });

  //   context("when entity has component", () => {
  //     it("returns component", () => {
  //       expect(engine.getComponentsById(entityId, NumberComponent, StringComponent)).toEqual([
  //         component,
  //         component2,
  //       ]);
  //     });
  //   });

  //   context("when entity does not a the component", () => {
  //     beforeEach(() => {
  //       engine.removeComponent(component);
  //     });

  //     it("returns null for that component and the rest of components", () => {
  //       expect(engine.getComponentsById(entityId, NumberComponent, StringComponent)).toEqual([
  //         null,
  //         component2,
  //       ]);
  //     });
  //   });

  //   context("when no components exists at all", () => {
  //     beforeEach(() => {
  //       engine.removeComponents(component, component2);
  //     });

  //     it("returns null array", () => {
  //       expect(engine.getComponentsById(entityId, NumberComponent, StringComponent)).toEqual([
  //         null,
  //         null,
  //       ]);
  //     });
  //   });
  // });

  // describe("#withComponents", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     component = new NumberComponent(entityId);
  //     component2 = new StringComponent(entityId);
  //     engine.addComponents(component, component2);
  //   });

  //   context("when entity has all components", () => {
  //     it("returns components", () => {
  //       engine.withComponents(
  //         ([presentComponent1, presentComponent2]) => {
  //           expect(presentComponent1).toEqual(component);
  //           expect(presentComponent2).toEqual(component2);
  //         },
  //         entityId,
  //         NumberComponent,
  //         StringComponent
  //       );
  //     });
  //   });

  //   context("when entity does not have one or more components", () => {
  //     beforeEach(() => {
  //       entityId2 = engine.newEntityId();
  //       component3 = new StringComponent(entityId2);
  //       engine.addComponent(component3);
  //       engine.withComponents(queryCallBackFunction, entityId2, NumberComponent, StringComponent);
  //     });

  //     it("doesn't call back", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });
  //   });
  // });

  // describe("#getAllComponentsOfId", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     component = new NumberComponent(entityId);
  //     engine.addComponent(component);
  //     component2 = new StringComponent(entityId);
  //     engine.addComponent(component2);
  //   });

  //   context("when entity has all possible components", () => {
  //     it("returns array of components for given entityId", () => {
  //       expect(engine.getAllComponentsOfId(entityId)).toEqual([component, component2]);
  //     });
  //   });

  //   context("when entity has only some of the possible components", () => {
  //     beforeEach(() => {
  //       engine.removeComponent(component);
  //     });

  //     it("returns array of components for given entityId", () => {
  //       expect(engine.getAllComponentsOfId(entityId)).toEqual([component2]);
  //     });
  //   });
  // });

  // describe("#newEntityId", () => {
  //   it("returns entityId", () => {
  //     expect(engine.newEntityId()).toBeNumber();
  //   });
  // });

  // describe("#newEntityIdWithAlias", () => {
  //   let aliasId = 123456;

  //   context("when alias id is non zero", () => {
  //     beforeEach(() => {
  //       entityId = engine.newEntityIdWithAlias(aliasId);
  //     });

  //     it("returns entityId", () => {
  //       expect(entityId).toBeNumber();
  //       expect(entityId).not.toEqual(aliasId);
  //     });

  //     it("adds alias to entityId", () => {
  //       expect(engine.getEntityIdByAlias(aliasId)).toEqual(entityId);
  //     });

  //     context("when alias already exists", () => {
  //       it("returns null", () => {
  //         expect(engine.newEntityIdWithAlias(aliasId)).toBeNull();
  //       });

  //       it("reclaims entity id", () => {
  //         expect(engine.entityIdPool.serialize().reclaimedEntityIdPool).toEqual([]);
  //         expect(engine.entityIdPool.serialize().reclaimedEntityIdPoolSize).toEqual(0);
  //         engine.newEntityIdWithAlias(aliasId);
  //         expect(engine.entityIdPool.serialize().reclaimedEntityIdPool).toEqual([1]);
  //         expect(engine.entityIdPool.serialize().reclaimedEntityIdPoolSize).toEqual(1);
  //       });
  //     });
  //   });

  //   context("when alias id is 0", () => {
  //     beforeEach(() => {
  //       aliasId = 0;
  //       entityId = engine.newEntityIdWithAlias(aliasId);
  //     });

  //     it("adds alias to entityId", () => {
  //       expect(engine.getEntityIdByAlias(aliasId)).toEqual(entityId);
  //     });
  //   });
  // });

  // // also tests #getEntityIdByAlias
  // describe("#addEntityIdAlias", () => {
  //   const aliasId = 123;
  //   let addResult;

  //   beforeEach(() => {
  //     addResult = engine.addEntityIdAlias(entityId, aliasId);
  //   });

  //   it("adds alias to entityId", () => {
  //     expect(engine.getEntityIdByAlias(aliasId)).toEqual(entityId);
  //   });

  //   it("returns added alias", () => {
  //     expect(addResult).toEqual(aliasId);
  //   });

  //   context("when alias exists", () => {
  //     it("does not add alias to entityId", () => {
  //       expect(engine.getEntityIdByAlias(aliasId)).toEqual(entityId);
  //       engine.addEntityIdAlias(12345678, aliasId);
  //       expect(engine.getEntityIdByAlias(aliasId)).toEqual(entityId);
  //     });

  //     it("returns null", () => {
  //       addResult = engine.addEntityIdAlias(entityId, aliasId);
  //       expect(addResult).toEqual(null);
  //     });
  //   });
  // });

  // describe("#getOrCreateEntityIdByAlias", () => {
  //   const aliasId = 123456;

  //   beforeEach(() => {
  //     entityId = engine.getOrCreateEntityIdByAlias(aliasId);
  //   });

  //   context("when alias does not yet exist", () => {
  //     it("returns entityId", () => {
  //       expect(entityId).toBeNumber();
  //       expect(entityId).not.toEqual(aliasId);
  //     });

  //     it("adds alias to entityId", () => {
  //       expect(engine.getEntityIdByAlias(aliasId)).toEqual(entityId);
  //     });
  //   });

  //   context("when alias already exists", () => {
  //     it("returns existing entityId", () => {
  //       expect(engine.getOrCreateEntityIdByAlias(aliasId)).toEqual(entityId);
  //     });
  //   });
  // });

  // describe("#getOrCreateNullComponentById", () => {
  //   beforeEach(() => {
  //     component = engine.getOrCreateNullComponentById(entityId, NumberComponent);
  //     component2 = engine.getOrCreateNullComponentById(entityId, StrictNumberComponent);
  //   });

  //   context("when component does not yet exist", () => {
  //     it("returns null component", () => {
  //       expect(component).toBeInstanceOf(NumberComponent);
  //       expect((<any>component).testNumber).toEqual(5); // NumberComponent default

  //       expect(component2).toBeInstanceOf(StrictNumberComponent);
  //       expect((<any>component2).testNumber).toEqual(undefined);
  //       expect((<any>component2).sparseSet).toBeInstanceOf(SparseSet);
  //       expect((<any>component2).sparseSet.size).toEqual(0);
  //     });
  //   });

  //   context("when component already exists", () => {
  //     it("returns existing component", () => {
  //       expect(engine.getOrCreateNullComponentById(entityId, NumberComponent)).toEqual(component);
  //     });
  //   });
  // });

  // describe("#getOrAddNullComponentById", () => {
  //   beforeEach(() => {
  //     component = engine.getOrAddNullComponentById(entityId, NumberComponent);
  //   });

  //   context("when component does not yet exist", () => {
  //     it("returns null component", () => {
  //       expect(component).toBeInstanceOf(NumberComponent);
  //       expect((<any>component).testNumber).toEqual(5); // NumberComponent default
  //     });

  //     it("adds the component", () => {
  //       expect(engine.getComponentById(entityId, NumberComponent)).toEqual(component);
  //     });
  //   });

  //   context("when component already exists", () => {
  //     it("returns existing component", () => {
  //       expect(engine.getOrAddNullComponentById(entityId, NumberComponent)).toEqual(component);
  //     });
  //   });
  // });

  // describe("#removeEntity", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();

  //     engine.addComponent(new NumberComponent(entityId));
  //     engine.addComponent(new StringComponent(entityId));

  //     engine.removeEntity(entityId);
  //   });

  //   it("removes all components associated with the entityId", () => {
  //     engine.query(queryCallBackFunction, NumberComponent);
  //     expect(queryCallBackFunction).not.toBeCalled();

  //     engine.query(queryCallBackFunction, StringComponent);
  //     expect(queryCallBackFunction).not.toBeCalled();
  //   });

  //   it("makes returns the entityId again when generating new entityId", () => {
  //     expect(engine.newEntityId()).toEqual(entityId);
  //   });
  // });

  // describe("#removeAllEntities", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     entityId2 = engine.newEntityId();

  //     engine.addComponent(new NumberComponent(entityId));
  //     engine.addComponent(new StringComponent(entityId));

  //     engine.addComponent(new NumberComponent(entityId2));
  //     engine.addComponent(new StringComponent(entityId2));

  //     engine.removeAllComponents();
  //   });

  //   it("removes all components associated with the entityId", () => {
  //     engine.query(queryCallBackFunction, NumberComponent);
  //     expect(queryCallBackFunction).not.toBeCalled();

  //     engine.query(queryCallBackFunction, StringComponent);
  //     expect(queryCallBackFunction).not.toBeCalled();
  //   });

  //   it("starts entityId count from zero", () => {
  //     expect(engine.newEntityId()).toEqual(0);
  //   });
  // });

  // describe("#update", () => {
  //   let deltaTime = 123;

  //   beforeEach(() => {
  //     engine.addSystem(testySystem1);
  //     engine.addSystem(testySystem2);
  //     engine.addSystem(testySystem3);

  //     engine.update(deltaTime);
  //   });

  //   it("calls update() on all added systems", () => {
  //     expect(testySystem1.update).toBeCalledTimes(1);
  //     expect(testySystem2.update).toBeCalledTimes(1);
  //     expect(testySystem3.update).toBeCalledTimes(1);
  //   });

  //   it("calls update() on all added systems in sequence of addition", () => {
  //     expect(testySystem2.update).toHaveBeenCalledAfter(testySystem1.update as any);
  //     expect(testySystem3.update).toHaveBeenCalledAfter(testySystem2.update as any);
  //   });

  //   it("returns deltaTime of the engine", () => {
  //     expect(testySystem1.deltaTime).toEqual(deltaTime);
  //     expect(testySystem2.deltaTime).toEqual(deltaTime);
  //     expect(testySystem3.deltaTime).toEqual(deltaTime);
  //   });
  // });

  // // TODO: ... more cases ??
  // describe("#query", () => {
  //   beforeEach(() => {
  //     entityId = engine.newEntityId();
  //     entityId2 = engine.newEntityId();
  //     entityId3 = engine.newEntityId();
  //   });

  //   context("when there are no components", () => {
  //     beforeEach(() => {
  //       engine.query(queryCallBackFunction, NumberComponent);
  //     });

  //     it("doesn't call back", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });
  //   });

  //   context("when no components exist in one of the lists", () => {
  //     beforeEach(() => {
  //       engine.addComponent(new NumberComponent(entityId));
  //       engine.query(queryCallBackFunction, NumberComponent, StringComponent);
  //     });

  //     it("doesn't call back", () => {
  //       expect(queryCallBackFunction).not.toBeCalled();
  //     });
  //   });

  //   context("when more than one entity exists", () => {
  //     let numberComponent = new NumberComponent(entityId);
  //     let numberComponent2 = new NumberComponent(entityId2);
  //     let numberComponent3 = new NumberComponent(entityId3);

  //     let stringComponent = new StringComponent(entityId);
  //     let stringComponent2 = new StringComponent(entityId2);

  //     beforeEach(() => {
  //       engine.addComponent(numberComponent);
  //       engine.addComponent(numberComponent2);
  //       engine.addComponent(numberComponent3);

  //       engine.addComponent(stringComponent);
  //       engine.addComponent(stringComponent2);

  //       engine.query(queryCallBackFunction, NumberComponent, StringComponent);
  //     });

  //     it("only returns entities that have all the components in the query", () => {
  //       expect(queryCallBackFunction).toBeCalledTimes(2);
  //       // NOTE: the array order in the toBeCalledWith is enforced by Jest (thats good!)
  //       expect(queryCallBackFunction).toBeCalledWith([numberComponent, stringComponent]);
  //       expect(queryCallBackFunction).toBeCalledWith([numberComponent2, stringComponent2]);
  //     });
  //   });

  //   context("when component lists are different lengths", () => {
  //     beforeEach(() => {
  //       engine.addComponent(new NumberComponent(entityId));
  //       engine.addComponent(new NumberComponent(entityId2));
  //       engine.addComponent(new NumberComponent(entityId3));

  //       engine.addComponent(new StringComponent(entityId));
  //       engine.addComponent(new StringComponent(entityId2));

  //       engine.query(queryCallBackFunction, NumberComponent, StringComponent);
  //     });

  //     it("iterates as far as the shortest list only", () => {
  //       expect(queryCallBackFunction).toBeCalledTimes(2);
  //     });
  //   });
  // });

  // describe("#deltaTime", () => {
  //   let deltaTime = 123;

  //   beforeEach(() => {
  //     engine.update(deltaTime);
  //   });

  //   it("calls returns deltaTime", () => {
  //     expect(engine.deltaTime).toEqual(deltaTime);
  //   });
  // });
});
