const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const { default: dts } = require("rollup-plugin-dts");
const peerDepsExternal = require("rollup-plugin-peer-deps-external");
const terser = require("@rollup/plugin-terser");
const packageJson = require("./package.json");

module.exports = [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        declarationDir: undefined,
      }),
      terser(),
    ],
    external: [],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    external: [],
    plugins: [dts()],
  },
];
