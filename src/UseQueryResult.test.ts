import { UseQueryResult } from "react-query";

import * as UQR from "./UseQueryResult";
import { omit } from "./testing.test";

describe("UseQueryResult", () => {
  const omitFunc = <A>(a: UseQueryResult<A>) => omit(a, ["refetch", "remove"]);
  describe("Functor", () => {
    it("map success", () => {
      expect(
        omitFunc(UQR.Functor.map(UQR.of(10), (x: number) => x * 2))
      ).toEqual(omitFunc(UQR.of(20)));
    });

    it("map idle", () => {
      expect(
        omitFunc(UQR.Functor.map(UQR.idle<number>(), (x: number) => x * 2))
      ).toEqual(omitFunc(UQR.idle()));
    });
  });

  describe("Apply", () => {
    type TestCase = {
      fab: UseQueryResult<(a: number) => number>;
      fa: UseQueryResult<number>;
      fb: UseQueryResult<number>;
    };

    it.each<TestCase>([
      {
        fab: UQR.of((x) => x + 1),
        fa: UQR.of(3),
        fb: UQR.of(4),
      },
      {
        fab: UQR.of((x) => x + 1),
        fa: UQR.idle(),
        fb: UQR.idle(),
      },
    ])("%#", ({ fab, fa, fb }) => {
      expect(omitFunc(UQR.Apply.ap(fab, fa))).toEqual(omitFunc(fb));
    });
  });

  describe("Monad", () => {
    type TestCase = {
      fab: (a: number) => UseQueryResult<number>;
      fa: UseQueryResult<number>;
      fb: UseQueryResult<number>;
    };

    it.each<TestCase>([
      {
        fab: (x) => UQR.of(x + 1),
        fa: UQR.of(3),
        fb: UQR.of(4),
      },
      {
        fab: () => UQR.idle(),
        fa: UQR.of(3),
        fb: UQR.idle(),
      },
      {
        fab: (x) => UQR.of(x + 1),
        fa: UQR.idle(),
        fb: UQR.idle(),
      },
      {
        fab: () => UQR.idle(),
        fa: UQR.idle(),
        fb: UQR.idle(),
      },
    ])("%#", ({ fab, fa, fb }) => {
      expect(omitFunc(UQR.Monad.chain(fa, fab))).toEqual(omitFunc(fb));
    });
  });
});
