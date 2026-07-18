import React from "react";
import ReactDOM from "react-dom/client";
import { CopilotKit } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import ProfileAdapter from "./ProfileAdapter.jsx";

const runtimeUrl = import.meta.env.PUBLIC_COPILOT_RUNTIME_URL || "/api/copilotkit";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CopilotKit runtimeUrl={runtimeUrl} useSingleEndpoint={false}>
      <main className="remote-preview">
        <ProfileAdapter />
      </main>
    </CopilotKit>
  </React.StrictMode>
);
