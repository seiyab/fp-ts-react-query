import { UseQueryResult } from "react-query";

import * as UQR from "./UseQueryResult";
import { omit } from "./testing.test";

describe("UseQueryResult", () => {
  const omitFunc = <A>(a: UseQueryResult<A>) => omit(a, ["refetch", "remove"]);
  describe("Functor", () => {
    expect(omitFunc(UQR.Functor.map(UQR.of(10), (x: number) => x * 2))).toEqual(
      omitFunc(UQR.of(20))
    );
  });

  describe("Apply", () => {
    const fab = UQR.of((x: number) => x + 1);
    const fa = UQR.of(3);
    expect(omitFunc(UQR.Apply.ap(fab, fa))).toEqual(omitFunc(UQR.of(4)));
  });
});
