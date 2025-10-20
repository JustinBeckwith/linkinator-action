import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['undici'],
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs({
      ignoreDynamicRequires: true,
    }),
  ],
  onwarn(warning, warn) {
    // Suppress warnings about 'this' being rewritten in dependencies
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    // Suppress circular dependency warnings in node_modules
    if (
      warning.code === 'CIRCULAR_DEPENDENCY' &&
      warning.ids.some((id) => id.includes('node_modules'))
    )
      return;
    // Show all other warnings
    warn(warning);
  },
};
