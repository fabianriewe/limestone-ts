import pkg from "./package.json";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "limestone.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    "url",
  ],
  plugins: [
    typescript({
      typescript: require("typescript"),
    }),
    {
      name: "string",
    },
  ],
};
