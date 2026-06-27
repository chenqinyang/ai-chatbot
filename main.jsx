import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CopilotKit } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import App from "./App.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      useSingleEndpoint={false}
      showDevConsole="auto"
      onError={({ code, error, context }) => {
        console.error("[copilotkit]", code, error, context);
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CopilotKit>
  </React.StrictMode>
);
