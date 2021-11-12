import {
  RefetchOptions,
  RefetchQueryFilters,
  UseQueryResult,
} from "react-query";
import * as O from "fp-ts/lib/Option";
import { Functor1 } from "fp-ts/lib/Functor";

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

export const URI = "fp-ts-react-query/UseQueryResult";
export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    readonly [URI]: UseQueryResult<A>;
  }
}

export const Functor: Functor1<URI> = {
  URI,
  map: <A, B>(fa: UseQueryResult<A>, f: (x: A) => B): UseQueryResult<B> => {
    const refetch = <TPageData>(
      options?: RefetchOptions & RefetchQueryFilters<TPageData>
    ) => fa.refetch(options).then((x) => Functor.map(x, f));
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
  },
};
