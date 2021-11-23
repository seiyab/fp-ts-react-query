"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bind = exports.bindTo = exports.Do = exports.flatten = exports.apSecond = exports.apFirst = exports.flap = exports.Monad = exports.Chain = exports.chain = exports.Applicative = exports.Apply = exports.ap = exports.Functor = exports.map = exports.getEq = exports.URI = exports.fromOption = exports.of = exports.success = exports.refetchError = exports.error = exports.loading = exports.idle = void 0;
const O = __importStar(require("fp-ts/lib/Option"));
const Functor_1 = require("fp-ts/lib/Functor");
const Apply_1 = require("fp-ts/lib/Apply");
const function_1 = require("fp-ts/lib/function");
const Chain_1 = require("fp-ts/lib/Chain");
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
};
const idle = () => (Object.assign(Object.assign({}, template), { status: "idle", isIdle: true, refetch: () => Promise.resolve((0, exports.idle)()) }));
exports.idle = idle;
const loading = () => (Object.assign(Object.assign({}, template), { status: "loading", isLoading: true, refetch: () => Promise.resolve((0, exports.loading)()) }));
exports.loading = loading;
const error = () => (Object.assign(Object.assign({}, template), { status: "error", isError: true, isLoadingError: true, refetch: () => Promise.resolve((0, exports.loading)()) }));
exports.error = error;
const refetchError = (a) => (Object.assign(Object.assign({}, template), { status: "error", isError: true, isRefetchError: true, data: a, refetch: () => Promise.resolve((0, exports.loading)()) }));
exports.refetchError = refetchError;
const success = (a) => (Object.assign(Object.assign({}, template), { status: "success", isSuccess: true, isFetched: true, isPlaceholderData: true, data: a, refetch: () => Promise.resolve((0, exports.success)(a)) }));
exports.success = success;
exports.of = exports.success;
const fromOption = (o) => O.isNone(o) ? (0, exports.idle)() : (0, exports.of)(o.value);
exports.fromOption = fromOption;
// -------------------- non-pipables --------------------
const _map = (fa, f) => (0, function_1.pipe)(fa, (0, exports.map)(f));
const _ap = (fa, fab) => (0, function_1.pipe)(fa, (0, exports.ap)(fab));
const _chain = (fa, fab) => (0, function_1.pipe)(fa, (0, exports.chain)(fab));
// -------------------- instances --------------------
exports.URI = "fp-ts-react-query/UseQueryResult";
const getEq = (E) => ({
    equals: (x, y) => {
        if (x.isSuccess || y.isSuccess)
            return x.isSuccess && y.isSuccess && E.equals(x.data, y.data);
        if (x.isRefetchError || y.isRefetchError)
            return x.isRefetchError && y.isRefetchError && E.equals(x.data, y.data);
        return x.status === y.status;
    },
});
exports.getEq = getEq;
const map = (f) => (fa) => {
    const refetch = (options) => fa.refetch(options).then((0, exports.map)(f));
    if (fa.isSuccess || fa.isRefetchError) {
        return Object.assign(Object.assign({}, fa), { data: f(fa.data), refetch });
    }
    return Object.assign(Object.assign({}, fa), { refetch });
};
exports.map = map;
exports.Functor = {
    URI: exports.URI,
    map: _map,
};
const ap = (fa) => (fab) => {
    const refetch = (options) => Promise.all([fab.refetch(options), fa.refetch(options)]).then(([fabr, far]) => (0, exports.ap)(far)(fabr));
    return pseudoChain(fab, (f) => _map(fa, f), refetch);
};
exports.ap = ap;
exports.Apply = Object.assign(Object.assign({}, exports.Functor), { ap: _ap });
exports.Applicative = Object.assign(Object.assign({}, exports.Apply), { of: exports.of });
const chain = (fab) => (fa) => {
    const refetch = (options) => fa.refetch(options).then((0, exports.chain)(fab));
    return pseudoChain(fa, fab, refetch);
};
exports.chain = chain;
exports.Chain = Object.assign(Object.assign({}, exports.Apply), { chain: _chain });
exports.Monad = Object.assign(Object.assign({}, exports.Applicative), { chain: _chain });
// -------------------- combinators --------------------
exports.flap = (0, Functor_1.flap)(exports.Functor);
exports.apFirst = (0, Apply_1.apFirst)(exports.Apply);
exports.apSecond = (0, Apply_1.apSecond)(exports.Apply);
exports.flatten = (0, exports.chain)((a) => a);
// -------------------- Do --------------------
// eslint-disable-next-line @typescript-eslint/ban-types
exports.Do = (0, exports.of)({});
exports.bindTo = (0, Functor_1.bindTo)(exports.Functor);
exports.bind = (0, Chain_1.bind)(exports.Chain);
// -------------------- utilities --------------------
const pseudoChain = (fa, fab, refetch) => {
    if (fa.isSuccess || fa.isRefetchError) {
        const fb = fab(fa.data);
        if (fb.isSuccess)
            return Object.assign(Object.assign({}, fa), { data: fb.data, refetch });
        return Object.assign(Object.assign({}, fb), { refetch });
    }
    return Object.assign(Object.assign({}, fa), { refetch });
};
