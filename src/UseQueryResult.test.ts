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
});
