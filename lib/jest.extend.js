"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
expect.extend({
    toEq(received, expected, eq) {
        const pass = eq.equals(received, expected);
        if (pass)
            return {
                message: () => `expected eq.equals(${received}, ${expected}) to be false`,
                pass: true,
            };
        return {
            message: () => `expected eq.equals(${received}, ${expected}) to be true`,
            pass: false,
        };
    },
});
