import {
  RefetchOptions,
  RefetchQueryFilters,
  UseQueryResult,
} from "react-query";
import * as O from "fp-ts/lib/Option";
import { Functor1 } from "fp-ts/lib/Functor";
import { Apply1 } from "fp-ts/lib/Apply";
import { Applicative1 } from "fp-ts/lib/Applicative";
import { Monad1 } from "fp-ts/lib/Monad";

export const of = <A>(a: A): UseQueryResult<A> => ({
  status: "success",
  isLoading: false,
  isSuccess: true,
  isError: false,
  isIdle: false,
  data: a,
  dataUpdatedAt: 0,
  error: null,
  errorUpdatedAt: 0,
  failureCount: 0,
  isFetched: true,
  isFetchedAfterMount: false,
  isFetching: false,
  isRefetching: false,
  isLoadingError: false,
  isPlaceholderData: true,
  isPreviousData: false,
  isRefetchError: false,
  isStale: false,
  refetch: () => Promise.resolve(of(a)),
  remove: () => null,
});

export const idle = <T>(): UseQueryResult<T> => ({
  status: "idle",
  isLoading: false,
  isSuccess: false,
  isError: false,
  isIdle: true,
  data: undefined,
  dataUpdatedAt: 0,
  error: null,
  errorUpdatedAt: 0,
  failureCount: 0,
  isFetched: true,
  isFetchedAfterMount: false,
  isFetching: false,
  isRefetching: false,
  isLoadingError: false,
  isPlaceholderData: false,
  isPreviousData: false,
  isRefetchError: false,
  isStale: false,
  refetch: () => Promise.resolve(idle()),
  remove: () => null,
});

export const fromOption = <A>(o: O.Option<A>): UseQueryResult<A> =>
  O.isNone(o) ? idle() : of(o.value);

// -------------------- instances --------------------

const map_: Functor1<URI>["map"] = <A, B>(
  fa: UseQueryResult<A>,
  f: (x: A) => B
): UseQueryResult<B> => {
  const refetch = <TPageData>(
    options?: RefetchOptions & RefetchQueryFilters<TPageData>
  ) => fa.refetch(options).then((x) => map_(x, f));
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

const ap_: Apply1<URI>["ap"] = <A, B>(
  fab: UseQueryResult<(a: A) => B>,
  fa: UseQueryResult<A>
): UseQueryResult<B> => {
  const refetch = <TPageData>(
    options?: RefetchOptions & RefetchQueryFilters<TPageData>
  ) =>
    Promise.all([fab.refetch(options), fa.refetch(options)]).then(
      ([fabr, far]) => ap_(fabr, far)
    );
  if (fab.isSuccess || fab.isRefetchError) {
    const fb = map_(fa, fab.data);
    if (fb.isSuccess)
      return {
        ...fab,
        data: fb.data,
        refetch,
      };
    return {
      ...fb,
      refetch,
    };
  }
  return {
    ...fab,
    refetch,
  };
};

const chain_: Monad1<URI>["chain"] = <A, B>(
  fa: UseQueryResult<A>,
  fab: (a: A) => UseQueryResult<B>
): UseQueryResult<B> => {
  const refetch = <TPageData>(
    options?: RefetchOptions & RefetchQueryFilters<TPageData>
  ) => fa.refetch(options).then((x) => chain_(x, fab));
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

export const URI = "fp-ts-react-query/UseQueryResult";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    readonly [URI]: UseQueryResult<A>;
  }
}

export const Functor: Functor1<URI> = {
  URI,
  map: map_,
};

export const Apply: Apply1<URI> = {
  ...Functor,
  ap: ap_,
};

export const Applicative: Applicative1<URI> = {
  ...Apply,
  of,
};

export const Monad: Monad1<URI> = {
  ...Applicative,
  chain: chain_,
};
