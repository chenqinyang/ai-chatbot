import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";

export default defineConfig({
  source: {
    entry: {
      index: "./apps/chatbot-ui/src/main.jsx"
    }
  },
  html: {
    template: "./apps/chatbot-ui/index.html"
  },
  server: {
    port: 3003,
    host: "127.0.0.1",
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  output: {
    assetPrefix: "auto",
    distPath: {
      root: "dist/chatbot-ui"
    }
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "chatbot_ui",
      filename: "remoteEntry.js",
      exposes: {
        "./ChatbotPanel": "./apps/chatbot-ui/src/ChatbotPanel.jsx"
      },
      manifest: true,
      dts: false,
      bridge: {
        enableBridgeRouter: false
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        "react-dom": { singleton: true, requiredVersion: false },
        "react-dom/client": { singleton: true, requiredVersion: false },
        "@copilotkit/react-core/v2": { singleton: true, requiredVersion: false }
      }
    })
  ]
});
