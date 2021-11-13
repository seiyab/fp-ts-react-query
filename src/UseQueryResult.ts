import {
  RefetchOptions,
  RefetchQueryFilters,
  UseQueryResult,
} from "react-query";
import * as O from "fp-ts/lib/Option";
import { Functor1 } from "fp-ts/lib/Functor";
import { Apply1 } from "fp-ts/lib/Apply";

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

const e = <T>(): UseQueryResult<T> => ({
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
  refetch: () => Promise.resolve(e()),
  remove: () => null,
});

export const fromOption = <A>(o: O.Option<A>): UseQueryResult<A> =>
  O.isNone(o) ? e() : of(o.value);

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
    const mapped = map_(fa, fab.data);
    if (mapped.isSuccess)
      return {
        ...fab,
        data: mapped.data,
        refetch,
      };
    return {
      ...map_(fa, fab.data),
      refetch,
    };
  }
  return {
    ...fab,
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
