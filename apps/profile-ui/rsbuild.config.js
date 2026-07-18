import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const profileRoot = dirname(fileURLToPath(import.meta.url));
const rootNodeModules = resolve(profileRoot, "../../node_modules");
const legacyRemote =
  process.env.PROFILE_UI_LEGACY_REMOTE_URL ||
  "http://127.0.0.1:3004/mf-manifest.json";

const shared = {
  react: { singleton: true, requiredVersion: false },
  "react-dom": { singleton: true, requiredVersion: false },
  "react-dom/client": { singleton: true, requiredVersion: false },
  "@copilotkit/react-core/v2": { singleton: true, requiredVersion: false }
};

export default defineConfig({
  resolve: {
    // This compilation is the direct-mode adapter. Its fallbacks must resolve
    // to React 19 even though the profile workspace pins React 18 for the
    // separately compiled legacy bridge.
    alias: {
      react: resolve(rootNodeModules, "react"),
      "react-dom": resolve(rootNodeModules, "react-dom")
    }
  },
  source: {
    entry: {
      index: "./apps/profile-ui/src/adapter/main.jsx"
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
    },
    proxy: {
      "/api/copilotkit": {
        target: "http://127.0.0.1:4000"
      }
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
      remotes: {
        profile_ui_legacy: `profile_ui_legacy@${legacyRemote}`
      },
      exposes: {
        "./ProfileAdapter": "./apps/profile-ui/src/adapter/ProfileAdapter.jsx"
      },
      manifest: true,
      dts: false,
      bridge: {
        enableBridgeRouter: false
      },
      shared
    })
  ]
});
