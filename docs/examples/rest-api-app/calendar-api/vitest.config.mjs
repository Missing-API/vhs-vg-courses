import path from 'path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'cobertura'],
            exclude: ['node_modules/**', '.next/**', '**/*.mock.ts', '**/*.types.ts', 'src/test/**'],
            reportsDirectory: './reports/coverage',
        },
        deps: {
            interopDefault: true,
        },
        exclude: ['node_modules/**', '.next/**', '**/*.mock.ts', '**/*.types.ts', 'src/test/**'],
        outputFile: './reports/test-results.json',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});