//@ts-check

"use strict";

// eslint-disable-next-line @typescript-eslint/naming-convention
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

// TODO(alex) [mid] 2022-04-27: Have this build copy the `.wasm` file to `dist/`.
/**@type {import('webpack').Configuration}*/
const config = {
  mode: "none",
  target: "node", // vscode extensions run in webworker context for VS Code web 📖 -> https://webpack.js.org/configuration/target/#target
  experiments: {
    asyncWebAssembly: true,
  },
  stats: {
    errorDetails: true,
  },

  entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    mainFields: ["browser", "module", "main"], // look for `browser` entry point in imported node modules
    extensions: [".ts", ".js", ".wasm"],
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser", // provide a shim for the global `process` variable
    }),
    // NOTE(alex): We need the rust created `.wasm` file in the `dist` folder next to the
    // "executable" (`extension.js`).
    // TODO(alex) [low] 2022-04-27: These paths are kinda wonky looking, maybe I could resolve them
    // in some other way.
    new CopyPlugin({
      patterns: [
        {
          from: "*.wasm",
          to: "../dist/",
          // NOTE(alex): Prevents copying the whole folder structure, if not present, we end up with
          // `dist/xt-wasm/pkg/[file].wasm`.
          context: "../xt-wasm/pkg/",
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
};
module.exports = config;
