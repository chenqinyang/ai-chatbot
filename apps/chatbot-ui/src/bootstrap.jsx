import React from "react";
import ReactDOM from "react-dom/client";
import { MessageSquare } from "lucide-react";
import "../../../packages/theme/journey.css";

function ChatbotPreview() {
  return (
    <main className="remote-standalone">
      <MessageSquare size={28} />
      <p className="section-kicker">Chatbot UI remote</p>
      <h1>Loaded and ready for the host</h1>
      <p>
        This remote intentionally does not create its own CopilotKit provider. Open the Host UI on
        port 3000 to test the shared chat experience.
      </p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatbotPreview />
  </React.StrictMode>
);
