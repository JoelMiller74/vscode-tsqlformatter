"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        include: ['src/test/**/*.vitest.ts'],
        environment: 'node',
        reporters: ['default'],
        coverage: {
            reporter: ['text', 'html'],
        },
    },
});
//# sourceMappingURL=vitest.config.js.map