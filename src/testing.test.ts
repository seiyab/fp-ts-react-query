import { UseQueryResult } from "react-query";

import * as UQR from "./UseQueryResult";

export const omit = <A, B extends keyof A>(a: A, keys: B[]): Omit<A, B> => {
  return Object.fromEntries(
    Object.entries(a).filter(([key]) => !(keys as string[]).includes(key))
  ) as Omit<A, B>;
};

describe("omit", () => {
  describe("UseQueryResult equality", () => {
    const omitFunc = <A>(a: UseQueryResult<A>) =>
      omit(a, ["refetch", "remove"]);
    it("equal", () => {
      expect(omitFunc(UQR.of(1))).toEqual(omitFunc(UQR.of(1)));
    });

    it("not equal", () => {
      expect(omitFunc(UQR.of(1))).not.toEqual(omitFunc(UQR.of(10)));
    });
  });
});
