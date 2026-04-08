import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/lib.ts',
    plugins: [resolve({ browser: true }), commonjs(), typescript({ tsconfig: './tsconfig.build.json' })],
    output: [
        {
            file: 'dist/web/cpp-parser.js',
            format: 'iife',
            name: 'CppParser',
            sourcemap: true,
        },
        {
            file: 'dist/web/cpp-parser.min.js',
            format: 'iife',
            name: 'CppParser',
            sourcemap: true,
            plugins: [terser()],
        },
        {
            file: 'dist/esm/lib.js',
            format: 'esm',
            sourcemap: true,
        },
    ],
};
