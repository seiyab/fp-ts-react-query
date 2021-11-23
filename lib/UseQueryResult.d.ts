import { UseQueryResult } from "react-query";
import * as O from "fp-ts/lib/Option";
import { Functor1 } from "fp-ts/lib/Functor";
import { Apply1 } from "fp-ts/lib/Apply";
import { Applicative1 } from "fp-ts/lib/Applicative";
import { Monad1 } from "fp-ts/lib/Monad";
import { Chain1 } from "fp-ts/lib/Chain";
import { Eq } from "fp-ts/lib/Eq";
export declare const idle: <A>() => UseQueryResult<A, unknown>;
export declare const loading: <A>() => UseQueryResult<A, unknown>;
export declare const error: <A>() => UseQueryResult<A, unknown>;
export declare const refetchError: <A>(a: A) => UseQueryResult<A, unknown>;
export declare const success: <A>(a: A) => UseQueryResult<A, unknown>;
export declare const of: <A>(a: A) => UseQueryResult<A, unknown>;
export declare const fromOption: <A>(o: O.Option<A>) => UseQueryResult<A, unknown>;
export declare const URI = "fp-ts-react-query/UseQueryResult";
export declare type URI = typeof URI;
declare module "fp-ts/lib/HKT" {
    interface URItoKind<A> {
        readonly [URI]: UseQueryResult<A>;
    }
}
export declare const getEq: <A>(E: Eq<A>) => Eq<UseQueryResult<A, unknown>>;
export declare const map: <A, B>(f: (x: A) => B) => (fa: UseQueryResult<A>) => UseQueryResult<B>;
export declare const Functor: Functor1<URI>;
export declare const ap: <A, B>(fa: UseQueryResult<A, unknown>) => (fab: UseQueryResult<(a: A) => B, unknown>) => UseQueryResult<B, unknown>;
export declare const Apply: Apply1<URI>;
export declare const Applicative: Applicative1<URI>;
export declare const chain: <A, B>(fab: (a: A) => UseQueryResult<B, unknown>) => (fa: UseQueryResult<A, unknown>) => UseQueryResult<B, unknown>;
export declare const Chain: Chain1<URI>;
export declare const Monad: Monad1<URI>;
export declare const flap: <A>(a: A) => <B>(fab: UseQueryResult<(a: A) => B, unknown>) => UseQueryResult<B, unknown>;
export declare const apFirst: <B>(second: UseQueryResult<B, unknown>) => <A>(first: UseQueryResult<A, unknown>) => UseQueryResult<A, unknown>;
export declare const apSecond: <B>(second: UseQueryResult<B, unknown>) => <A>(first: UseQueryResult<A, unknown>) => UseQueryResult<B, unknown>;
export declare const flatten: <A>(fa: UseQueryResult<UseQueryResult<A, unknown>, unknown>) => UseQueryResult<A, unknown>;
export declare const Do: UseQueryResult<{}>;
export declare const bindTo: <N extends string>(name: N) => <A>(fa: UseQueryResult<A, unknown>) => UseQueryResult<{ readonly [K in N]: A; }, unknown>;
export declare const bind: <N extends string, A, B>(name: Exclude<N, keyof A>, f: (a: A) => UseQueryResult<B, unknown>) => (ma: UseQueryResult<A, unknown>) => UseQueryResult<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B; }, unknown>;
