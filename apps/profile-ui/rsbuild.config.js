import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const profileRoot = dirname(fileURLToPath(import.meta.url));
const profileNodeModules = resolve(profileRoot, "node_modules");

export default defineConfig({
  resolve: {
    // The bridge creates a separate React root. Pin every React import in this
    // build (including imports inside bridge-react and lucide-react) to the
    // profile workspace's React 18 installation.
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
    port: 3001,
    host: "127.0.0.1",
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  output: {
    assetPrefix: "auto",
    distPath: {
      root: "dist/profile-ui"
    }
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "profile_ui",
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
