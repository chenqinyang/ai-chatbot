import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

const profileRemote =
  process.env.PROFILE_UI_REMOTE_URL || "http://127.0.0.1:3001/mf-manifest.json";
const productRemote =
  process.env.PRODUCT_UI_REMOTE_URL || "http://127.0.0.1:3002/mf-manifest.json";
const chatbotRemote =
  process.env.CHATBOT_UI_REMOTE_URL || "http://127.0.0.1:3003/mf-manifest.json";

const shared = {
  react: { singleton: true, requiredVersion: false },
  "react-dom": { singleton: true, requiredVersion: false },
  "react-dom/client": { singleton: true, requiredVersion: false },
  "@copilotkit/react-core/v2": { singleton: true, requiredVersion: false }
};

export default defineConfig({
  source: {
    entry: {
      index: "./apps/host/src/main.jsx"
    }
  },
  html: {
    template: "./apps/host/index.html"
  },
  server: {
    port: 3000,
    host: "127.0.0.1",
    strictPort: true,
    proxy: {
      "/api/copilotkit": {
        target: "http://127.0.0.1:4000"
      }
    }
  },
  output: {
    distPath: {
      root: "dist/host"
    }
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "host_ui",
      remotes: {
        profile_ui: `profile_ui@${profileRemote}`,
        product_ui: `product_ui@${productRemote}`,
        chatbot_ui: `chatbot_ui@${chatbotRemote}`
      },
      shared,
      bridge: {
        enableBridgeRouter: false
      },
      dts: false
    })
  ]
});
