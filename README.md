# fp-ts-react-query
[fp-ts](https://github.com/gcanti/fp-ts) bindings for [React Query](https://github.com/tannerlinsley/react-query/)

Helps following
- Apply function to return of useQuery iff data exists
- Compose multiple query results

## Examples
### apply function iff data exists
```ts
import * as UQR from 'fp-ts-react-query/UseQueryResult';

const f = (x: number): string => `got ${x}`;
const liftedF = UQR.map(f)

const Component: React.FC = () => {
  const raw: UseQueryResult<number> = useQuery('query1', () => someQuery());
  const calculated: UseQueryResult<string> = liftedF(raw);
  // ...
};
```

raw | calculated
:- | :-
success(1) | success('got 1')
success(2) | success('got 2')
idle | idle
loading | loading
error | error

### compose two query results
```ts
import { pipe } from "fp-ts/lib/function";
import * as UQR from 'fp-ts-react-query/UseQueryResult';

const Component: React.FC = () => {
  const x: UseQueryResult<number> = useQuery('query1', () => someQuery1());
  const y: UseQueryResult<number> = useQuery('query2', () => someQuery2());
  const calculated: UseQueryResult<string> = pipe(
    UQR.Do,
    UQR.bind('a', () => x), // bind x as 'a'
    UQR.bind('b', () => y), // bind y as 'b'
    UQR.map({a, b} => a * 5 + b)
  );
  // ...
};
```

raw1 | raw2 | calculated
:- | :- | :-
success | success | success(x.data * 5 + y.data)
idle | success | idle
loading | success | loading
error | success | error
success | idle | idle
... | ... | ...

### compose many query results
```ts
import { pipe } from "fp-ts/lib/function";
import * as UQR from 'fp-ts-react-query/UseQueryResult';

const Component: React.FC = () => {
  const w = useQuery('query1', () => someQuery1());
  const x = useQuery('query2', () => someQuery2());
  const y = useQuery('query3', () => someQuery3());
  const z = useQuery('query4', () => someQuery4());
  const calculated = pipe(
    UQR.Do,
    UQR.bind('a', () => w),
    UQR.bind('b', () => x),
    UQR.bind('c', () => y),
    UQR.bind('d', () => z),
    UQR.map({a, b, c, d} => {
      // ... complex computation
    })
  );
  // ...
};
```

## Implemented instances
- `Monad`