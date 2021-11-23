import { number } from "fp-ts";
import { UseQueryResult } from "react-query";

import "./jest.extend";

import * as UQR from "./lib/UseQueryResult";

describe("toEq", () => {
  type TestCase<A> = [UseQueryResult<A>, UseQueryResult<A>];

  it.each<TestCase<number>>([
    [UQR.of(1), UQR.of(1)],
    [UQR.of(2), UQR.of(2)],
    [UQR.idle(), UQR.idle()],
  ])("should be equal", (a, b) => {
    expect(a).toEq(b, UQR.getEq(number.Eq));
  });

  it.each<TestCase<number>>([
    [UQR.of(1), UQR.of(2)],
    [UQR.idle(), UQR.of(0)],
    [UQR.of(0), UQR.idle()],
    [UQR.success(0), UQR.refetchError(0)],
    [UQR.error(), UQR.refetchError(0)],
  ])("should not be equal", (a, b) => {
    expect(a).not.toEq(b, UQR.getEq(number.Eq));
  });
});
