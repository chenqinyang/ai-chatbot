import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const profileRoot = dirname(fileURLToPath(import.meta.url));
const profileNodeModules = resolve(profileRoot, "node_modules");

export default defineConfig({
  resolve: {
    // Keep the bridged feature and all of its dependencies on a private
    // React 18 runtime. Nothing from this compilation enters the host share
    // scope.
    alias: {
      react: resolve(profileNodeModules, "react"),
      "react-dom": resolve(profileNodeModules, "react-dom")
    }
  },
  source: {
    entry: {
      index: "./apps/profile-ui/src/main.jsx"
    }
  },
  html: {
    template: "./apps/profile-ui/index.html"
  },
  server: {
    port: 3004,
    host: "127.0.0.1",
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  output: {
    assetPrefix: "auto",
    distPath: {
      root: "dist/profile-ui-legacy"
    }
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "profile_ui_legacy",
      filename: "remoteEntry.js",
      exposes: {
        "./ProfileFeature": "./apps/profile-ui/src/ProfileFeature.bridge.jsx"
      },
      manifest: true,
      dts: false,
      bridge: {
        enableBridgeRouter: false
      }
    })
  ]
});
