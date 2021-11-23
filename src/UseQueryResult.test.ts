import { UseQueryResult } from "react-query";
import { pipe } from "fp-ts/lib/function";
import { number } from "fp-ts";

import "./jest.extend";

import * as UQR from "./UseQueryResult";

describe("UseQueryResult", () => {
  const Eq = UQR.getEq(number.Eq);
  describe("Functor", () => {
    it("map success", () => {
      expect(UQR.Functor.map(UQR.of(10), (x: number) => x * 2)).toEq(
        UQR.of(20),
        Eq
      );
    });

    it("map idle", () => {
      expect(UQR.Functor.map(UQR.idle<number>(), (x: number) => x * 2)).toEq(
        UQR.idle<number>(),
        Eq
      );
    });

    it("lift", () => {
      const f = (x: number) => x + 5;
      const liftedF = UQR.map(f);
      expect(liftedF(UQR.success(10))).toEq(UQR.success(15), Eq);
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
      expect(UQR.Apply.ap(fab, fa)).toEq(fb, Eq);
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
      expect(UQR.Monad.chain(fa, fab)).toEq(fb, Eq);
    });

    describe("monad law", () => {
      type F<T> = UseQueryResult<T>;
      const kleisli =
        <A, B, C>(fab: (a: A) => F<B>) =>
        (fbc: (b: B) => F<C>): ((a: A) => F<C>) => {
          return (a: A) => UQR.chain(fbc)(fab(a));
        };

      const funcs: ((a: number) => F<number>)[] = [
        (a) => UQR.of(a + 5),
        (a) => UQR.of(a * 2),
        (a) => {
          if (a < 0) return UQR.error();
          if (a === 0) return UQR.idle();
          return UQR.success(a);
        },
        UQR.success,
        UQR.loading,
        UQR.idle,
        UQR.error,
      ];
      const values = [-10, -5 - 3, 0, 1, 5];

      describe("left identity", () => {
        describe.each(funcs)("funcs[%#]", (f) => {
          it.each(values)("%d", (v) => {
            expect(kleisli(UQR.of)(f)(v)).toEq(f(v), Eq);
          });
        });
      });

      describe("right identity", () => {
        describe.each(funcs)("funcs[%#]", (f) => {
          it.each(values)("%d", (v) => {
            expect(kleisli(f)(UQR.of)(v)).toEq(f(v), Eq);
          });
        });
      });

      describe("associativity", () => {
        describe.each(funcs)("f = funcs[%#]", (f) => {
          describe.each(funcs)("g = funcs[%#]", (g) => {
            describe.each(funcs)("h = funcs[%#]", (h) => {
              it.each(values)("%d", (v) => {
                expect(
                  kleisli(kleisli<number, number, number>(f)(g))(h)(v)
                ).toEq(
                  kleisli<number, number, number>(f)(
                    kleisli<number, number, number>(g)(h)
                  )(v),
                  Eq
                );
              });
            });
          });
        });
      });
    });
  });

  describe("Do", () => {
    it("bind two successful results", () => {
      const result = pipe(
        UQR.Do,
        UQR.bind("a", () => UQR.of(1)),
        UQR.bind("b", () => UQR.of(2)),
        UQR.map(({ a, b }) => a + b)
      );

      expect(result).toEq(UQR.of(3), Eq);
    });

    it("bind success and loading", () => {
      const result = pipe(
        UQR.Do,
        UQR.bind("a", () => UQR.of(1)),
        UQR.bind("b", () => UQR.loading<number>()),
        UQR.map(({ a, b }) => a + b)
      );

      expect(result).toEq(UQR.loading<number>(), Eq);
    });

    it("bind success and refetchError", () => {
      const result = pipe(
        UQR.Do,
        UQR.bind("a", () => UQR.of(1)),
        UQR.bind("b", () => UQR.refetchError(10)),
        UQR.map(({ a, b }) => a + b)
      );

      expect(result).toEq(UQR.refetchError(11), Eq);
    });
  });
});
