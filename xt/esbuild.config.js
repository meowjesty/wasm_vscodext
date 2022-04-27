// https://github.com/evanw/esbuild/issues/408#issuecomment-757555771
let wasmPlugin = {
  name: "wasm",
  setup(build) {
    console.log("Starting build ...");
    let path = require("path");
    let fs = require("fs");

    // Resolve ".wasm" files to a path with a namespace
    build.onResolve({ filter: /\.wasm$/ }, (args) => {
      // If this is the import inside the stub module, import the
      // binary itself. Put the path in the "wasm-binary" namespace
      // to tell our binary load callback to load the binary file.
      if (args.resolveDir === "") {
        console.error("Could not resolve ", args.resolveDir);
        return;
      }

      console.log("Resolving dir ", args.resolveDir, " with path ", args.path);
      return {
        path: path.isAbsolute(args.path)
          ? args.path
          : path.join(args.resolveDir, args.path),
        namespace: "wasm-binary",
      };
    });

    // Virtual modules in the "wasm-stub" namespace are filled with
    // the JavaScript code for compiling the WebAssembly binary. The
    // binary itself is imported from a second virtual module.
    build.onLoad({ filter: /.*/, namespace: "wasm-binary" }, async (args) => {
      console.log("Loading wasm-binary ", args.path);
      return {
        contents: await fs.promises.readFile(args.path),
        loader: "binary",
      };
    });
  },
};

require("esbuild")
  .build({
    entryPoints: ["./src/extension.ts"],
    minify: false,
    bundle: true,
    outfile: "./dist/extension.js",
    sourcemap: "external",
    external: ["vscode"],
    format: "cjs",
    platform: "node",
    plugins: [wasmPlugin],
  })
  .catch((err) => {
    process.stderr.write(err.stderr);
    process.exit(1);
  });
