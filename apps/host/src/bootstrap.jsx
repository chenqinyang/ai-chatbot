import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CopilotKit } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import "../../../packages/theme/journey.css";
import JourneyHost from "./JourneyHost.jsx";

const runtimeUrl = import.meta.env.PUBLIC_COPILOT_RUNTIME_URL || "/api/copilotkit";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CopilotKit
      runtimeUrl={runtimeUrl}
      useSingleEndpoint={false}
      showDevConsole="auto"
      onError={({ code, error, context }) => {
        console.error("[copilotkit]", code, error, context);
      }}
    >
      <BrowserRouter>
        <JourneyHost />
      </BrowserRouter>
    </CopilotKit>
  </React.StrictMode>
);
