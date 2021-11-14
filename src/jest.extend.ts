import { Eq } from "fp-ts/lib/Eq";

expect.extend({
  toEq<A>(received: A, expected: A, eq: Eq<A>) {
    const pass = eq.equals(received, expected);
    if (pass)
      return {
        message: () =>
          `expected eq.equals(${received}, ${expected}) to be false`,
        pass: true,
      };
    return {
      message: () => `expected eq.equals(${received}, ${expected}) to be true`,
      pass: false,
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toEq<T>(a: T, eq: Eq<T>): R;
    }
  }
}
