import { context } from "../../../../tests/jestHelpers";
import Archetype from "../../Archetype";
import { Vector2f, f32, i32 } from "../../Component";

const createMaskForComponents = (mask: number[], ...componentIds: number[]) => {
  componentIds.forEach(id => (mask = createMaskForComponent(mask, id)));
  return mask;
};

const createMaskForComponent = (mask: number[], componentId) => {
  const newMask = [...mask];
  // NOTE: when component bit is missing, this will add it
  // when it's already there, it will take it away
  // Therefore can call this function to both add new bit and remove existing
  newMask[~~(componentId / 32)] ^= 1 << componentId % 32;
  return newMask;
};

const enum Components {
  component0,
  component1,
  component2,
  component3,
}

describe(Archetype, () => {
  let maxEntities = 1e6;

  let component0 = Vector2f;
  let component1 = [f32("dx"), f32("dy")];
  let component2 = [f32("u"), i32("v"), i32("t")];
  let component3 = [i32("t")];

  let schema = {
    [Components.component0]: component0,
    [Components.component1]: component1,
    [Components.component2]: component2,
    [Components.component3]: component3,
  };

  let mask = [];
  let componentIds = [Components.component0, Components.component1, Components.component2];
  let generatedMask = createMaskForComponents(mask, ...componentIds);

  let subject: Archetype;

  beforeEach(() => {
    subject = new Archetype(generatedMask, schema, maxEntities, ...componentIds);
  });

  describe("constructor", () => {
    it("creates components object", () => {
      expect(Object.keys(subject.components)).toEqual(
        [Components.component0, Components.component1, Components.component2].map(i => i.toString())
      );
      const [x, y] = subject.components[Components.component0];
      expect(x).toBeInstanceOf(Float32Array);
      expect(x.length).toEqual(maxEntities);
      expect(y).toBeInstanceOf(Float32Array);

      const [u, v, t] = subject.components[Components.component2];
      expect(u).toBeInstanceOf(Float32Array);
      expect(v).toBeInstanceOf(Int32Array);
      expect(t).toBeInstanceOf(Int32Array);
    });

    it("creates dataStreamTemplate", () => {
      expect(subject.dataStreamTemplate).toEqual([
        Components.component0,
        component0.length,
        new Float32Array(1e6),
        new Float32Array(1e6),
        Components.component1,
        component1.length,
        new Float32Array(1e6),
        new Float32Array(1e6),
        Components.component2,
        component2.length,
        new Float32Array(1e6),
        new Int32Array(1e6),
        new Int32Array(1e6),
      ]);
    });

    it("stores componentIds", () => {
      expect(subject.componentIds).toEqual(componentIds);
    });

    context("when componentIds out of order", () => {
      beforeEach(() => {
        componentIds = [Components.component2, Components.component0, Components.component1];
      });

      it("stores sorted componentIds", () => {
        expect(subject.componentIds).toEqual(componentIds.sort());
      });
    });

    it("stores mask", () => {
      expect(subject.mask).toEqual(generatedMask);
    });
  });

  describe("#maskMatches", () => {
    context("when archetype's mask matches given mask", () => {
      it("returns true", () => {
        expect(subject.maskMatches(generatedMask)).toBeTrue();
      });
    });

    context("when archetype's mask does not match given mask", () => {
      it("returns false", () => {
        expect(subject.maskMatches([])).toBeFalse();
      });
    });
  });

  describe("#maskContains", () => {
    context("when archetype's mask contains given subMask", () => {
      it("returns true", () => {
        expect(
          subject.maskContains(
            createMaskForComponents([], Components.component1, Components.component2)
          )
        ).toBeTrue();
      });
    });

    context("when archetype's mask does not contain given subMask", () => {
      it("returns false", () => {
        expect(
          subject.maskContains(createMaskForComponents([], Components.component3))
        ).toBeFalse();
      });
    });
  });

  describe("#hasComponents", () => {
    context("when archetype's mask contains given component", () => {
      it("returns true", () => {
        expect(subject.hasComponents(Components.component1, Components.component2)).toBeTrue();
      });
    });

    context("when archetype's mask does not contain given components", () => {
      it("returns false", () => {
        expect(subject.hasComponents(Components.component3)).toBeFalse();
      });
    });
  });

  describe("#hasEntity", () => {
    let entityId = 123;

    beforeEach(() => {
      subject.add(entityId, []);
    });

    context("when archetype has given entityId", () => {
      it("returns true", () => {
        expect(subject.hasEntity(entityId)).toBeTrue();
      });
    });

    context("when archetype does not have given entityId", () => {
      it("returns false", () => {
        expect(subject.hasEntity(entityId + 1)).toBeFalse();
      });
    });
  });

  describe("#componentIdsWithout", () => {
    it("returns componentIds without given componentId", () => {
      expect(subject.componentIdsWithout(Components.component1)).toEqual([
        Components.component0,
        Components.component2,
      ]);
    });

    context("when archetype doesn't have that componentId", () => {
      it("returns all componentIds", () => {
        expect(subject.componentIdsWithout(Components.component3)).toEqual([
          Components.component0,
          Components.component1,
          Components.component2,
        ]);
      });
    });
  });

  describe("#add", () => {
    let entityId = 123;
    let entityId2 = 456;
    let previousElementCount: number;

    beforeEach(() => {
      previousElementCount = subject.elementCount;
    });

    context("when archetype does not have the entity", () => {
      it("adds the entity", () => {
        expect(subject.hasEntity(entityId)).toBeFalse();
        subject.add(entityId, []);
        expect(subject.hasEntity(entityId)).toBeTrue();

        expect(subject.hasEntity(entityId2)).toBeFalse();
        subject.add(entityId2, []);
        expect(subject.hasEntity(entityId2)).toBeTrue();
      });

      it("increases elementCount", () => {
        subject.add(entityId, []);
        expect(subject.elementCount).toEqual(previousElementCount + 1);

        subject.add(entityId2, []);
        expect(subject.elementCount).toEqual(previousElementCount + 2);
      });

      it("adds entity components", () => {
        subject.add(entityId, [
          Components.component0,
          component0.length,
          111,
          222,
          Components.component1,
          component1.length,
          333,
          444,
          Components.component2,
          component2.length,
          777,
          888,
          999,
        ]);
        const [x, y] = subject.components[Components.component0];
        const [dx, dy] = subject.components[Components.component1];
        const [u, v, t] = subject.components[Components.component2];
        const lastEntity = subject.elementCount - 1;
        expect(x[lastEntity]).toEqual(111);
        expect(y[lastEntity]).toEqual(222);
        expect(dx[lastEntity]).toEqual(333);
        expect(dy[lastEntity]).toEqual(444);
        expect(u[lastEntity]).toEqual(777);
        expect(v[lastEntity]).toEqual(888);
        expect(t[lastEntity]).toEqual(999);
      });

      context("when passing in new component data", () => {
        it("adds entity components", () => {
          subject.add(
            entityId,
            [
              Components.component0,
              component0.length,
              111,
              222,
              Components.component1,
              component1.length,
              333,
              444,
            ],
            Components.component2,
            [777, 888, 999]
          );
          const [x, y] = subject.components[Components.component0];
          const [dx, dy] = subject.components[Components.component1];
          const [u, v, t] = subject.components[Components.component2];
          const lastEntity = subject.elementCount - 1;
          expect(x[lastEntity]).toEqual(111);
          expect(y[lastEntity]).toEqual(222);
          expect(dx[lastEntity]).toEqual(333);
          expect(dy[lastEntity]).toEqual(444);
          expect(u[lastEntity]).toEqual(777);
          expect(v[lastEntity]).toEqual(888);
          expect(t[lastEntity]).toEqual(999);
        });
      });
    });

    // context("when item already exists", () => {
    //   it("return and does not replace component", () => {
    //     subject.add(sparseSetItem3);
    //     expect(subject.get(Components.sparseSetItem3)).toBe(sparseSetItem3);
    //   });

    //   it("returns null", () => {
    //     addResult = subject.add(sparseSetItem3);
    //     expect(addResult).toEqual(null);
    //   });

    //   it("does not increase size", () => {
    //     subject.add(sparseSetItem3);
    //     expect(subject.size).toEqual(previousSizeAfterAdd);
    //   });
    // });
  });

  // describe("#get", () => {
  //   let getComponentForEntity: SparseSetItem | null;

  //   beforeEach(() => (getComponentForEntity = subject.get(entityId1)));

  //   context("when entity has the component", () => {
  //     it("returns the component", () => {
  //       expect(getComponentForEntity).toBe(sparseSetItem1);
  //       expect(getComponentForEntityComponents.?).toEqual(entityId1);
  //     });
  //   });

  //   context("when entity does not have the component", () => {
  //     beforeEach(() => (subject = new SparseSet()));

  //     context("when component never existed", () => {
  //       it("returns null", () => {
  //         expect(subject.get(entityId1)).toEqual(null);
  //       });
  //     });

  //     context("when component was added", () => {
  //       beforeEach(() => {
  //         sparseSetItem1 = new SparseSetItem(entityId1);
  //         sparseSetItem2 = new SparseSetItem(entityId2);

  //         subject.add(sparseSetItem1);
  //         subject.add(sparseSetItem2);
  //       });

  //       context("when component was removed", () => {
  //         beforeEach(() => subject.remove(sparseSetItem1));

  //         it("returns null", () => {
  //           expect(subject.get(entityId1)).toEqual(null);
  //         });
  //       });

  //       context("when all components were cleared", () => {
  //         beforeEach(() => subject.clear());

  //         it("returns null", () => {
  //           expect(subject.get(entityId1)).toEqual(null);
  //         });
  //       });
  //     });
  //   });
  // });

  describe("#remove", () => {
    context("when archetype has the entity", () => {
      let entityId = 123;
      let entityId2 = 456;
      let previousElementCount: number;

      beforeEach(() => {
        subject.add(entityId, [
          Components.component0,
          component0.length,
          111,
          222,
          Components.component1,
          component1.length,
          333,
          444,
          Components.component2,
          component2.length,
          777,
          888,
          999,
        ]);
        subject.add(entityId2, [
          Components.component0,
          component0.length,
          111,
          222,
          Components.component1,
          component1.length,
          333,
          444,
          Components.component2,
          component2.length,
          777,
          888,
          666,
        ]);
        previousElementCount = subject.elementCount;
      });

      it("removes the entity", () => {
        expect(subject.hasEntity(entityId)).toBeTrue();
        subject.remove(entityId);
        expect(subject.hasEntity(entityId)).toBeFalse();

        expect(subject.hasEntity(entityId2)).toBeTrue();
        subject.remove(entityId2);
        expect(subject.hasEntity(entityId2)).toBeFalse();
      });

      it("reduces elementCount", () => {
        subject.remove(entityId);
        expect(subject.elementCount).toEqual(previousElementCount - 1);

        subject.remove(entityId2);
        expect(subject.elementCount).toEqual(previousElementCount - 2);
      });

      it("returns component data", () => {
        expect(subject.remove(entityId)).toEqual([
          Components.component0,
          component0.length,
          111,
          222,
          Components.component1,
          component1.length,
          333,
          444,
          Components.component2,
          component2.length,
          777,
          888,
          999,
        ]);
      });
    });

    // context("when entity does not have the component", () => {
    //   beforeEach(() => {
    //     subject = new SparseSet();
    //     sparseSetItem1 = new SparseSetItem(entityId1);
    //   });

    //   context("when component never existed", () => {
    //     it("returns null", () => {
    //       expect(subject.remove(sparseSetItem1)).toEqual(null);
    //     });
    //   });

    //   context("when component was added", () => {
    //     beforeEach(() => {
    //       sparseSetItem1 = new SparseSetItem(entityId1);
    //       sparseSetItem2 = new SparseSetItem(entityId2);

    //       subject.add(sparseSetItem1);
    //       subject.add(sparseSetItem2);
    //     });

    //     context("when component was removed", () => {
    //       beforeEach(() => subject.remove(sparseSetItem1));

    //       context("when removing it again", () => {
    //         it("returns null", () => {
    //           expect(subject.remove(sparseSetItem1)).toEqual(null);
    //         });
    //       });

    //       context("when removing a component with same entityId (before it was even added)", () => {
    //         it("returns null", () => {
    //           expect(subject.remove(new SparseSetItem(entityId1))).toEqual(null);
    //         });
    //       });
    //     });

    //     context("when all components were cleared", () => {
    //       beforeEach(() => subject.clear());

    //       it("returns null", () => {
    //         expect(subject.remove(sparseSetItem1)).toEqual(null);
    //       });
    //     });
    //   });
    // });
  });

  describe("#destroy", () => {
    context("when archetype has the entity", () => {
      let entityId = 123;
      let entityId2 = 456;
      let previousElementCount: number;

      beforeEach(() => {
        subject.add(entityId, [
          Components.component0,
          component0.length,
          111,
          222,
          Components.component1,
          component1.length,
          333,
          444,
          Components.component2,
          component2.length,
          777,
          888,
          999,
        ]);
        subject.add(entityId2, [
          Components.component0,
          component0.length,
          111,
          222,
          Components.component1,
          component1.length,
          333,
          444,
          Components.component2,
          component2.length,
          777,
          888,
          666,
        ]);
        previousElementCount = subject.elementCount;
      });

      it("removes the entity", () => {
        expect(subject.hasEntity(entityId)).toBeTrue();
        subject.destroy(entityId);
        expect(subject.hasEntity(entityId)).toBeFalse();

        expect(subject.hasEntity(entityId2)).toBeTrue();
        subject.destroy(entityId2);
        expect(subject.hasEntity(entityId2)).toBeFalse();
      });

      it("reduces elementCount", () => {
        subject.destroy(entityId);
        expect(subject.elementCount).toEqual(previousElementCount - 1);

        subject.destroy(entityId2);
        expect(subject.elementCount).toEqual(previousElementCount - 2);
      });
    });

    // context("when entity does not have the component", () => {
    //   beforeEach(() => {
    //     subject = new SparseSet();
    //     sparseSetItem1 = new SparseSetItem(entityId1);
    //   });

    //   context("when component never existed", () => {
    //     it("returns null", () => {
    //       expect(subject.remove(sparseSetItem1)).toEqual(null);
    //     });
    //   });

    //   context("when component was added", () => {
    //     beforeEach(() => {
    //       sparseSetItem1 = new SparseSetItem(entityId1);
    //       sparseSetItem2 = new SparseSetItem(entityId2);

    //       subject.add(sparseSetItem1);
    //       subject.add(sparseSetItem2);
    //     });

    //     context("when component was removed", () => {
    //       beforeEach(() => subject.remove(sparseSetItem1));

    //       context("when removing it again", () => {
    //         it("returns null", () => {
    //           expect(subject.remove(sparseSetItem1)).toEqual(null);
    //         });
    //       });

    //       context("when removing a component with same entityId (before it was even added)", () => {
    //         it("returns null", () => {
    //           expect(subject.remove(new SparseSetItem(entityId1))).toEqual(null);
    //         });
    //       });
    //     });

    //     context("when all components were cleared", () => {
    //       beforeEach(() => subject.clear());

    //       it("returns null", () => {
    //         expect(subject.remove(sparseSetItem1)).toEqual(null);
    //       });
    //     });
    //   });
    // });
  });

  // describe("#clear", () => {
  //   beforeEach(() => subject.clear());

  //   it("sets the size to 0", () => {
  //     expect(subject.size).toEqual(0);
  //   });

  //   it("makes existing components inaccessible", () => {
  //     expect(subject.get(entityId1)).toEqual(null);
  //     expect(subject.get(entityId2)).toEqual(null);
  //   });
  // });

  // describe("#size", () => {
  //   it("returns the number of components in the list", () => {
  //     expect(subject.size).toEqual(2);

  //     subject.add(sparseSetItem3);
  //     expect(subject.size).toEqual(3);

  //     subject.remove(sparseSetItem1);
  //     expect(subject.size).toEqual(2);

  //     subject.remove(sparseSetItem2);
  //     expect(subject.size).toEqual(1);

  //     subject.remove(sparseSetItem3);
  //     expect(subject.size).toEqual(0);
  //   });
  // });

  // describe("#stream", () => {
  //   beforeEach(() => subject.add(sparseSetItem3));

  //   it("streams all the items", () => {
  //     let items: any[] = [];

  //     subject.stream((item: any) => items.push(item));
  //     expect(items).toEqual([sparseSetItem1, sparseSetItem2, sparseSetItem3]);

  //     subject.remove(sparseSetItem2);

  //     items = [];
  //     subject.stream((item: any) => items.push(item));
  //     expect(items).toEqual([sparseSetItem1, sparseSetItem3]);
  //   });
  // });
});
