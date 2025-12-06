"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        include: ['src/test/**/*.vitest.ts'],
        environment: 'node',
        reporters: ['junit'],
        coverage: {
            reporter: ['text', 'html', 'json'],
        },
        outputFile: 'test-report.junit.xml',
    },
});
//# sourceMappingURL=vitest.config.js.map
