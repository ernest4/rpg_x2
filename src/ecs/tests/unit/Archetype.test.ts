import { context } from "../../../../tests/jestHelpers";
import Archetype from "../../Archetype";
import Component, { Vector2f, Vector3f, _f32, _i32 } from "../../Component";

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

  let component0 = new Component(Components.component0, Vector2f);
  let component1 = new Component(Components.component1, { dx: _f32(), dy: _f32() });
  let component2 = new Component(Components.component2, { u: _f32(), v: _i32(), t: _i32() });
  let component3 = new Component(Components.component3, { t: _i32() });

  let schema = {
    [component0.id]: component0,
    [component1.id]: component1,
    [component2.id]: component2,
    [component3.id]: component3,
  };

  let mask = [];
  let componentIds = [component0.id, component1.id, component2.id];
  let generatedMask = createMaskForComponents(mask, ...componentIds);

  let subject: Archetype;

  beforeEach(() => {
    subject = new Archetype(generatedMask, schema, maxEntities, ...componentIds);
  });

  describe("constructor", () => {
    it("creates components object", () => {
      expect(Object.keys(subject.components)).toEqual(
        [component0.id, component1.id, component2.id].map(i => i.toString())
      );
      expect(subject.components[component0.id].x).toBeInstanceOf(Float32Array);
      expect(subject.components[component0.id].x.length).toEqual(maxEntities);
      expect(subject.components[component0.id].y).toBeInstanceOf(Float32Array);
      expect(subject.components[component2.id].u).toBeInstanceOf(Float32Array);
      expect(subject.components[component2.id].v).toBeInstanceOf(Int32Array);
      expect(subject.components[component2.id].t).toBeInstanceOf(Int32Array);
    });

    it("stores componentIds", () => {
      expect(subject.componentIds).toEqual(componentIds);
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
          subject.maskContains(createMaskForComponents([], component1.id, component2.id))
        ).toBeTrue();
      });
    });

    context("when archetype's mask does not contain given subMask", () => {
      it("returns false", () => {
        expect(subject.maskContains(createMaskForComponents([], component3.id))).toBeFalse();
      });
    });
  });

  describe("#hasComponents", () => {
    context("when archetype's mask contains given component", () => {
      it("returns true", () => {
        expect(subject.hasComponents(component1.id, component2.id)).toBeTrue();
      });
    });

    context("when archetype's mask does not contain given components", () => {
      it("returns false", () => {
        expect(subject.hasComponents(component3.id)).toBeFalse();
      });
    });
  });

  describe("#hasEntity", () => {
    let entityId = 123;

    beforeEach(() => {
      subject.add(entityId, [], [], []);
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

  // describe("#add", () => {
  //   let previousSizeBeforeAdd: number;
  //   let previousSizeAfterAdd: number;
  //   let addResult;

  //   beforeEach(() => {
  //     previousSizeBeforeAdd = subject.size;
  //     addResult = subject.add(sparseSetItem3);
  //     previousSizeAfterAdd = subject.size;
  //   });

  //   context("when item doesn't already exist", () => {
  //     it("adds the component", () => {
  //       expect(subject.get(sparseSetItem3.id)).toBe(sparseSetItem3);
  //     });

  //     it("returns the added item", () => {
  //       expect(addResult).toEqual(sparseSetItem3);
  //     });

  //     it("increases size", () => {
  //       expect(subject.size).toEqual(previousSizeBeforeAdd + 1);
  //     });
  //   });

  //   context("when item already exists", () => {
  //     it("return and does not replace component", () => {
  //       subject.add(sparseSetItem3);
  //       expect(subject.get(sparseSetItem3.id)).toBe(sparseSetItem3);
  //     });

  //     it("returns null", () => {
  //       addResult = subject.add(sparseSetItem3);
  //       expect(addResult).toEqual(null);
  //     });

  //     it("does not increase size", () => {
  //       subject.add(sparseSetItem3);
  //       expect(subject.size).toEqual(previousSizeAfterAdd);
  //     });
  //   });
  // });

  // describe("#get", () => {
  //   let getComponentForEntity: SparseSetItem | null;

  //   beforeEach(() => (getComponentForEntity = subject.get(entityId1)));

  //   context("when entity has the component", () => {
  //     it("returns the component", () => {
  //       expect(getComponentForEntity).toBe(sparseSetItem1);
  //       expect(getComponentForEntity?.id).toEqual(entityId1);
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

  // describe("#remove", () => {
  //   context("when entity has the component", () => {
  //     let previousSize: number;

  //     beforeEach(() => (previousSize = subject.size));

  //     it("returns removed component's original entityId", () => {
  //       expect(subject.remove(sparseSetItem1)).toEqual(entityId1);
  //     });

  //     it("allows you to remove component by id", () => {
  //       expect(subject.remove(entityId1)).toEqual(entityId1);
  //     });

  //     it("reduces list size", () => {
  //       subject.remove(sparseSetItem1);
  //       expect(subject.size).toEqual(previousSize - 1);
  //     });
  //   });

  //   context("when entity does not have the component", () => {
  //     beforeEach(() => {
  //       subject = new SparseSet();
  //       sparseSetItem1 = new SparseSetItem(entityId1);
  //     });

  //     context("when component never existed", () => {
  //       it("returns null", () => {
  //         expect(subject.remove(sparseSetItem1)).toEqual(null);
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

  //         context("when removing it again", () => {
  //           it("returns null", () => {
  //             expect(subject.remove(sparseSetItem1)).toEqual(null);
  //           });
  //         });

  //         context("when removing a component with same entityId (before it was even added)", () => {
  //           it("returns null", () => {
  //             expect(subject.remove(new SparseSetItem(entityId1))).toEqual(null);
  //           });
  //         });
  //       });

  //       context("when all components were cleared", () => {
  //         beforeEach(() => subject.clear());

  //         it("returns null", () => {
  //           expect(subject.remove(sparseSetItem1)).toEqual(null);
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
        subject.add(
          entityId,
          [
            component0.id,
            component0.id,
            component1.id,
            component1.id,
            component2.id,
            component2.id,
            component2.id,
          ],
          ["x", "y", "dx", "dy", "u", "v", "t"],
          [1, 2, 3, 4, 0, 1, 1]
        );
        subject.add(
          entityId2,
          [
            component0.id,
            component0.id,
            component1.id,
            component1.id,
            component2.id,
            component2.id,
            component2.id,
          ],
          ["x", "y", "dx", "dy", "u", "v", "t"],
          [1, 2, 3, 4, 0, 0, 0]
        );
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
          [
            component0.id,
            component0.id,
            component1.id,
            component1.id,
            component2.id,
            component2.id,
            component2.id,
          ],
          ["x", "y", "dx", "dy", "u", "v", "t"],
          [1, 2, 3, 4, 0, 1, 1],
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
        subject.add(
          entityId,
          [
            component0.id,
            component0.id,
            component1.id,
            component1.id,
            component2.id,
            component2.id,
            component2.id,
          ],
          ["x", "y", "dx", "dy", "u", "v", "t"],
          [1, 2, 3, 4, 0, 0, 0]
        );
        subject.add(
          entityId2,
          [
            component0.id,
            component0.id,
            component1.id,
            component1.id,
            component2.id,
            component2.id,
            component2.id,
          ],
          ["x", "y", "dx", "dy", "u", "v", "t"],
          [1, 2, 3, 4, 0, 0, 0]
        );
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
