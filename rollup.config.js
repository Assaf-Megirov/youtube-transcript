const typescript = require('@rollup/plugin-typescript');
const dts = require('rollup-plugin-dts').default;

const baseConfig = {
  input: 'src/index.ts',
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist/types'
    })
  ],
  external: ['phin'],
};

const buildFormats = [];

// ES Module build
const esConfig = {
  ...baseConfig,
  output: {
    file: 'dist/youtube-transcript.esm.js',
    format: 'esm',
  },
};
buildFormats.push(esConfig);

// CommonJS build
const cjsConfig = {
  ...baseConfig,
  output: {
    compact: true,
    file: 'dist/youtube-transcript.common.js',
    format: 'cjs',
    name: 'YoutubeTranscript',
    exports: 'named',
  },
};
buildFormats.push(cjsConfig);

// Declaration file bundle
const dtsConfig = {
  input: './dist/types/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts({

  })]
};
buildFormats.push(dtsConfig);

module.exports = buildFormats;