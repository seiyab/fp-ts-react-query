import { Eq } from "fp-ts/lib/Eq";
declare global {
    namespace jest {
        interface Matchers<R> {
            toEq<T>(a: T, eq: Eq<T>): R;
        }
    }
}
