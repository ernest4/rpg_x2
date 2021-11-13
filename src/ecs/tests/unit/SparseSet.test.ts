import { context } from "../../../../tests/jestHelpers";
import SparseSet from "../../utils/SparseSet";

describe(SparseSet, () => {
  const entityId1 = 123;
  const entityId2 = 456;
  const entityId3 = 789;

  let sparseSetItem1: number;
  let sparseSetItem2: number;
  let sparseSetItem3: number;

  let subject: SparseSet<number>;

  beforeEach(() => {
    subject = new SparseSet();

    sparseSetItem1 = 0;
    sparseSetItem2 = 1;
    sparseSetItem3 = 2;

    subject.add(entityId1, sparseSetItem1);
    subject.add(entityId2, sparseSetItem2);
  });

  describe("#add", () => {
    let previousSizeBeforeAdd: number;
    let previousSizeAfterAdd: number;
    let addResult;

    beforeEach(() => {
      previousSizeBeforeAdd = subject._elementCount;
      addResult = subject.add(entityId3, sparseSetItem3);
      previousSizeAfterAdd = subject._elementCount;
    });

    context("when item doesn't already exist", () => {
      it("adds the component", () => {
        expect(subject.getItem(entityId3)).toBe(sparseSetItem3);
      });

      it("returns the added item", () => {
        expect(addResult).toEqual(sparseSetItem3);
      });

      it("increases size", () => {
        expect(subject._elementCount).toEqual(previousSizeBeforeAdd + 1);
      });
    });

    context("when item already exists", () => {
      it("return and does not replace component", () => {
        subject.add(entityId3, sparseSetItem3);
        expect(subject.getItem(entityId3)).toBe(sparseSetItem3);
      });

      it("returns null", () => {
        addResult = subject.add(entityId3, sparseSetItem3);
        expect(addResult).toEqual(null);
      });

      it("does not increase size", () => {
        subject.add(entityId3, sparseSetItem3);
        expect(subject._elementCount).toEqual(previousSizeAfterAdd);
      });
    });
  });

  describe("#get", () => {
    let getComponentForEntity: number | null;

    beforeEach(() => (getComponentForEntity = subject.getItem(entityId1)));

    context("when entity has the component", () => {
      it("returns the component", () => {
        expect(getComponentForEntity).toBe(sparseSetItem1);
      });
    });

    context("when entity does not have the component", () => {
      beforeEach(() => (subject = new SparseSet()));

      context("when component never existed", () => {
        it("returns null", () => {
          expect(subject.getItem(entityId1)).toEqual(null);
        });
      });

      context("when component was added", () => {
        beforeEach(() => {
          sparseSetItem1 = 1;
          sparseSetItem2 = 2;

          subject.add(entityId1, sparseSetItem1);
          subject.add(entityId2, sparseSetItem2);
        });

        context("when component was removed", () => {
          beforeEach(() => subject.remove(entityId1));

          it("returns null", () => {
            expect(subject.getItem(entityId1)).toEqual(null);
          });
        });

        context("when all components were cleared", () => {
          beforeEach(() => subject.clear());

          it("returns null", () => {
            expect(subject.getItem(entityId1)).toEqual(null);
          });
        });
      });
    });
  });

  describe("#remove", () => {
    context("when entity has the component", () => {
      let previousSize: number;

      beforeEach(() => (previousSize = subject._elementCount));

      it("allows you to remove component by id", () => {
        expect(subject.remove(entityId1)).toEqual(sparseSetItem1);
      });

      it("reduces list size", () => {
        subject.remove(entityId1);
        expect(subject._elementCount).toEqual(previousSize - 1);
      });
    });

    context("when entity does not have the component", () => {
      beforeEach(() => {
        subject = new SparseSet();
        sparseSetItem1 = 1;
      });

      context("when component never existed", () => {
        it("returns null", () => {
          expect(subject.remove(entityId1)).toEqual(null);
        });
      });

      context("when component was added", () => {
        beforeEach(() => {
          sparseSetItem1 = 1;
          sparseSetItem2 = 2;

          subject.add(entityId1, sparseSetItem1);
          subject.add(entityId2, sparseSetItem2);
        });

        context("when component was removed", () => {
          beforeEach(() => subject.remove(entityId1));

          context("when removing it again", () => {
            it("returns null", () => {
              expect(subject.remove(entityId1)).toEqual(null);
            });
          });

          context("when removing a component with same entityId (before it was even added)", () => {
            it("returns null", () => {
              expect(subject.remove(entityId1)).toEqual(null);
            });
          });
        });

        context("when all components were cleared", () => {
          beforeEach(() => subject.clear());

          it("returns null", () => {
            expect(subject.remove(entityId1)).toEqual(null);
          });
        });
      });
    });
  });

  describe("#clear", () => {
    beforeEach(() => subject.clear());

    it("sets the size to 0", () => {
      expect(subject._elementCount).toEqual(0);
    });

    it("makes existing components inaccessible", () => {
      expect(subject.getItem(entityId1)).toEqual(null);
      expect(subject.getItem(entityId2)).toEqual(null);
    });
  });

  describe("#_elementCount", () => {
    it("returns the number of components in the list", () => {
      expect(subject._elementCount).toEqual(2);

      subject.add(entityId3, sparseSetItem3);
      expect(subject._elementCount).toEqual(3);

      subject.remove(entityId1);
      expect(subject._elementCount).toEqual(2);

      subject.remove(entityId2);
      expect(subject._elementCount).toEqual(1);

      subject.remove(entityId3);
      expect(subject._elementCount).toEqual(0);
    });
  });

  // describe("#stream", () => {
  //   beforeEach(() => subject.add(entityId3, sparseSetItem3));

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
