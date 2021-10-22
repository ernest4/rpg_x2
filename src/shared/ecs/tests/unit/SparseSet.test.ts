import { context } from "../../../../../tests/jestHelpers";
import Component from "../../Component";
import SparseSet, { SparseSetItem } from "../../utils/SparseSet";
import NumberComponent from "../helpers/components/NumberComponent";

describe(SparseSet, () => {
  const entityId1 = 123;
  const entityId2 = 456;
  const entityId3 = 789;

  let numberComponent1: NumberComponent;
  let numberComponent2: NumberComponent;
  let numberComponent3: NumberComponent;

  let subject: SparseSet<Component>;

  beforeEach(() => {
    subject = new SparseSet();

    numberComponent1 = new NumberComponent(entityId1);
    numberComponent2 = new NumberComponent(entityId2);
    numberComponent3 = new NumberComponent(entityId3);

    subject.add(numberComponent1);
    subject.add(numberComponent2);
  });

  describe("#add", () => {
    let previousSizeBeforeAdd: number;
    let previousSizeAfterAdd: number;
    let addResult;

    beforeEach(() => {
      previousSizeBeforeAdd = subject.size;
      addResult = subject.add(numberComponent3);
      previousSizeAfterAdd = subject.size;
    });

    context("when item doesn't already exist", () => {
      it("adds the component", () => {
        expect(subject.get(numberComponent3.id)).toBe(numberComponent3);
      });

      it("returns the added item", () => {
        expect(addResult).toEqual(numberComponent3);
      });

      it("increases size", () => {
        expect(subject.size).toEqual(previousSizeBeforeAdd + 1);
      });
    });

    context("when item already exists", () => {
      it("return and does not replace component", () => {
        subject.add(numberComponent3);
        expect(subject.get(numberComponent3.id)).toBe(numberComponent3);
      });

      it("returns null", () => {
        addResult = subject.add(numberComponent3);
        expect(addResult).toEqual(null);
      });

      it("does not increase size", () => {
        subject.add(numberComponent3);
        expect(subject.size).toEqual(previousSizeAfterAdd);
      });
    });
  });

  describe("#get", () => {
    let getComponentForEntity: SparseSetItem | null;

    beforeEach(() => (getComponentForEntity = subject.get(entityId1)));

    context("when entity has the component", () => {
      it("returns the component", () => {
        expect(getComponentForEntity).toBe(numberComponent1);
        expect(getComponentForEntity?.id).toEqual(entityId1);
      });
    });

    context("when entity does not have the component", () => {
      beforeEach(() => (subject = new SparseSet()));

      context("when component never existed", () => {
        it("returns null", () => {
          expect(subject.get(entityId1)).toEqual(null);
        });
      });

      context("when component was added", () => {
        beforeEach(() => {
          numberComponent1 = new NumberComponent(entityId1);
          numberComponent2 = new NumberComponent(entityId2);

          subject.add(numberComponent1);
          subject.add(numberComponent2);
        });

        context("when component was removed", () => {
          beforeEach(() => subject.remove(numberComponent1));

          it("returns null", () => {
            expect(subject.get(entityId1)).toEqual(null);
          });
        });

        context("when all components were cleared", () => {
          beforeEach(() => subject.clear());

          it("returns null", () => {
            expect(subject.get(entityId1)).toEqual(null);
          });
        });
      });
    });
  });

  describe("#remove", () => {
    context("when entity has the component", () => {
      let previousSize: number;

      beforeEach(() => (previousSize = subject.size));

      it("returns removed component's original entityId", () => {
        expect(subject.remove(numberComponent1)).toEqual(entityId1);
      });

      it("allows you to remove component by id", () => {
        expect(subject.remove(entityId1)).toEqual(entityId1);
      });

      it("reduces list size", () => {
        subject.remove(numberComponent1);
        expect(subject.size).toEqual(previousSize - 1);
      });
    });

    context("when entity does not have the component", () => {
      beforeEach(() => {
        subject = new SparseSet();
        numberComponent1 = new NumberComponent(entityId1);
      });

      context("when component never existed", () => {
        it("returns null", () => {
          expect(subject.remove(numberComponent1)).toEqual(null);
        });
      });

      context("when component was added", () => {
        beforeEach(() => {
          numberComponent1 = new NumberComponent(entityId1);
          numberComponent2 = new NumberComponent(entityId2);

          subject.add(numberComponent1);
          subject.add(numberComponent2);
        });

        context("when component was removed", () => {
          beforeEach(() => subject.remove(numberComponent1));

          context("when removing it again", () => {
            it("returns null", () => {
              expect(subject.remove(numberComponent1)).toEqual(null);
            });
          });

          context("when removing a component with same entityId (before it was even added)", () => {
            it("returns null", () => {
              expect(subject.remove(new NumberComponent(entityId1))).toEqual(null);
            });
          });
        });

        context("when all components were cleared", () => {
          beforeEach(() => subject.clear());

          it("returns null", () => {
            expect(subject.remove(numberComponent1)).toEqual(null);
          });
        });
      });
    });
  });

  describe("#clear", () => {
    beforeEach(() => subject.clear());

    it("sets the size to 0", () => {
      expect(subject.size).toEqual(0);
    });

    it("makes existing components inaccessible", () => {
      expect(subject.get(entityId1)).toEqual(null);
      expect(subject.get(entityId2)).toEqual(null);
    });
  });

  describe("#size", () => {
    it("returns the number of components in the list", () => {
      expect(subject.size).toEqual(2);

      subject.add(numberComponent3);
      expect(subject.size).toEqual(3);

      subject.remove(numberComponent1);
      expect(subject.size).toEqual(2);

      subject.remove(numberComponent2);
      expect(subject.size).toEqual(1);

      subject.remove(numberComponent3);
      expect(subject.size).toEqual(0);
    });
  });

  describe("#stream", () => {
    beforeEach(() => subject.add(numberComponent3));

    it("streams all the items", () => {
      let items: any[] = [];

      subject.stream((item: any) => items.push(item));
      expect(items).toEqual([numberComponent1, numberComponent2, numberComponent3]);

      subject.remove(numberComponent2);

      items = [];
      subject.stream((item: any) => items.push(item));
      expect(items).toEqual([numberComponent1, numberComponent3]);
    });
  });
});
