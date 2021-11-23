import {
  RefetchOptions,
  RefetchQueryFilters,
  UseQueryResult,
} from "react-query";
import * as O from "fp-ts/lib/Option";
import { Functor1, bindTo as bindTo_, flap as flap_ } from "fp-ts/lib/Functor";
import {
  Apply1,
  apFirst as apFirst_,
  apSecond as apSecond_,
} from "fp-ts/lib/Apply";
import { Applicative1 } from "fp-ts/lib/Applicative";
import { Monad1 } from "fp-ts/lib/Monad";
import { pipe } from "fp-ts/lib/function";
import { Chain1, bind as bind_ } from "fp-ts/lib/Chain";
import { Eq } from "fp-ts/lib/Eq";

// -------------------- constructors --------------------

const template = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  isIdle: false,
  data: undefined,
  dataUpdatedAt: 0,
  error: null,
  errorUpdatedAt: 0,
  failureCount: 0,
  isFetched: false,
  isFetchedAfterMount: false,
  isFetching: false,
  isRefetching: false,
  isLoadingError: false,
  isPlaceholderData: true,
  isPreviousData: false,
  isRefetchError: false,
  isStale: false,
  remove: () => null,
} as const;

export const idle = <A>(): UseQueryResult<A> => ({
  ...template,
  status: "idle",
  isIdle: true,
  refetch: () => Promise.resolve(idle<A>()),
});

export const loading = <A>(): UseQueryResult<A> => ({
  ...template,
  status: "loading",
  isLoading: true,
  refetch: () => Promise.resolve(loading<A>()),
});

export const error = <A>(): UseQueryResult<A> => ({
  ...template,
  status: "error",
  isError: true,
  isLoadingError: true,
  refetch: () => Promise.resolve(loading<A>()),
});

export const refetchError = <A>(a: A): UseQueryResult<A> => ({
  ...template,
  status: "error",
  isError: true,
  isRefetchError: true,
  data: a,
  refetch: () => Promise.resolve(loading<A>()),
});

export const success = <A>(a: A): UseQueryResult<A> => ({
  ...template,
  status: "success",
  isSuccess: true,
  isFetched: true,
  isPlaceholderData: true,
  data: a,
  refetch: () => Promise.resolve(success(a)),
});

export const of = success;

export const fromOption = <A>(o: O.Option<A>): UseQueryResult<A> =>
  O.isNone(o) ? idle<A>() : of(o.value);

// -------------------- non-pipables --------------------

const _map: Functor1<URI>["map"] = (fa, f) => pipe(fa, map(f));

const _ap: Apply1<URI>["ap"] = (fa, fab) => pipe(fa, ap(fab));

const _chain: Monad1<URI>["chain"] = (fa, fab) => pipe(fa, chain(fab));

// -------------------- instances --------------------

export const URI = "fp-ts-react-query/UseQueryResult";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    readonly [URI]: UseQueryResult<A>;
  }
}

export const getEq = <A>(E: Eq<A>): Eq<UseQueryResult<A>> => ({
  equals: (x, y) => {
    if (x.isSuccess || y.isSuccess)
      return x.isSuccess && y.isSuccess && E.equals(x.data, y.data);
    if (x.isRefetchError || y.isRefetchError)
      return x.isRefetchError && y.isRefetchError && E.equals(x.data, y.data);
    return x.status === y.status;
  },
});

export const map: <A, B>(
  f: (x: A) => B
) => (fa: UseQueryResult<A>) => UseQueryResult<B> = (f) => (fa) => {
  const refetch = <TPageData>(
    options?: RefetchOptions & RefetchQueryFilters<TPageData>
  ) => fa.refetch(options).then(map(f));
  if (fa.isSuccess || fa.isRefetchError) {
    return {
      ...fa,
      data: f(fa.data),
      refetch,
    };
  }
  return {
    ...fa,
    refetch,
  };
};

export const Functor: Functor1<URI> = {
  URI,
  map: _map,
};

export const ap =
  <A, B>(fa: UseQueryResult<A>) =>
  (fab: UseQueryResult<(a: A) => B>): UseQueryResult<B> => {
    const refetch = <TPageData>(
      options?: RefetchOptions & RefetchQueryFilters<TPageData>
    ) =>
      Promise.all([fab.refetch(options), fa.refetch(options)]).then(
        ([fabr, far]) => ap<A, B>(far)(fabr)
      );
    return pseudoChain(fab, (f: (a: A) => B) => _map(fa, f), refetch);
  };

export const Apply: Apply1<URI> = {
  ...Functor,
  ap: _ap,
};

export const Applicative: Applicative1<URI> = {
  ...Apply,
  of,
};

export const chain =
  <A, B>(fab: (a: A) => UseQueryResult<B>) =>
  (fa: UseQueryResult<A>): UseQueryResult<B> => {
    const refetch = <TPageData>(
      options?: RefetchOptions & RefetchQueryFilters<TPageData>
    ) => fa.refetch(options).then(chain(fab));
    return pseudoChain(fa, fab, refetch);
  };

export const Chain: Chain1<URI> = {
  ...Apply,
  chain: _chain,
};

export const Monad: Monad1<URI> = {
  ...Applicative,
  chain: _chain,
};

// -------------------- combinators --------------------

export const flap = flap_(Functor);

export const apFirst = apFirst_(Apply);

export const apSecond = apSecond_(Apply);

export const flatten = chain(<A>(a: UseQueryResult<A>) => a);

// -------------------- Do --------------------

// eslint-disable-next-line @typescript-eslint/ban-types
export const Do: UseQueryResult<{}> = of({});

export const bindTo = bindTo_(Functor);

export const bind = bind_(Chain);

// -------------------- utilities --------------------

const pseudoChain = <A, B>(
  fa: UseQueryResult<A>,
  fab: (a: A) => UseQueryResult<B>,
  refetch: UseQueryResult<B>["refetch"]
): UseQueryResult<B> => {
  if (fa.isSuccess || fa.isRefetchError) {
    const fb = fab(fa.data);
    if (fb.isSuccess)
      return {
        ...fa,
        data: fb.data,
        refetch,
      };
    return {
      ...fb,
      refetch,
    };
  }
  return {
    ...fa,
    refetch,
  };
};
