import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

export default defineConfig({
  source: {
    entry: {
      index: "./apps/product-ui/src/main.jsx"
    }
  },
  html: {
    template: "./apps/product-ui/index.html"
  },
  server: {
    port: 3002,
    host: "127.0.0.1",
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  output: {
    assetPrefix: "auto",
    distPath: {
      root: "dist/product-ui"
    }
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "product_ui",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductFeature": "./apps/product-ui/src/ProductFeature.jsx"
      },
      manifest: true,
      dts: false,
      bridge: {
        enableBridgeRouter: false
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        "react-dom": { singleton: true, requiredVersion: false },
        "react-dom/client": { singleton: true, requiredVersion: false }
      }
    })
  ]
});
