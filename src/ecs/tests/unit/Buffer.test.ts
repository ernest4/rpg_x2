import { context } from "../../../../tests/jestHelpers";
import Buffer from "../../utils/Buffer";

describe(Buffer, () => {
  let bufferItem1: number;
  let bufferItem2: number;
  let bufferItem3: number;

  let subject: Buffer<number>;

  beforeEach(() => {
    subject = new Buffer();

    bufferItem1 = 0;
    bufferItem2 = 1;
    bufferItem3 = 2;
  });

  describe("#push", () => {
    it("pushes items to buffer", () => {
      subject.push(bufferItem1);
      expect(subject.last()).toEqual(bufferItem1);
      expect(subject.size()).toEqual(1);

      subject.push(bufferItem2);
      expect(subject.last()).toEqual(bufferItem2);
      expect(subject.size()).toEqual(2);

      subject.push(bufferItem3);
      expect(subject.last()).toEqual(bufferItem3);
      expect(subject.size()).toEqual(3);
    });
  });

  describe("#process", () => {
    beforeEach(() => {
      subject.push(bufferItem1);
      subject.push(bufferItem2);
      subject.push(bufferItem3);
    });

    it("swaps the buffer and iterates over items", () => {
      const items = [];
      subject.process(item => items.push(item));
      expect(items).toEqual([bufferItem1, bufferItem2, bufferItem3]);
      expect(subject.size()).toEqual(0);
    });
  });

  describe("#flushAll", () => {
    beforeEach(() => {
      subject.push(bufferItem1);
      subject.push(bufferItem2);
      subject.push(bufferItem3);
    });

    it("clears all the buffers", () => {
      expect(subject.size()).toEqual(3);
      subject.flushAll();
      expect(subject.size()).toEqual(0);

      const items = [];
      subject.process(item => items.push(item));
      expect(items).toEqual([]);
    });
  });

  describe("#last", () => {
    it("gets last item in buffer", () => {
      subject.push(bufferItem1);
      expect(subject.last()).toEqual(bufferItem1);

      subject.push(bufferItem2);
      expect(subject.last()).toEqual(bufferItem2);

      subject.push(bufferItem3);
      expect(subject.last()).toEqual(bufferItem3);
    });

    context("when buffer is empty", () => {
      it("returns null", () => {
        expect(subject.last()).toEqual(null);
      });
    });
  });
});
