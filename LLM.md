# Connecting CopilotKit to an LLM

## Two ways to connect

### Option A — CopilotKit Cloud (easiest, no backend)

**Where the API key goes:** a `.env` file in the project root.

```
# .env  (copy from .env.example, never commit this file)
VITE_COPILOT_PUBLIC_API_KEY=ck_pub_xxxx
```

Get a free key at https://cloud.copilotkit.ai. CopilotKit Cloud proxies the LLM call for you — your OpenAI/Anthropic key lives on their servers, not in your frontend.

**Code change — wrap the app in `CopilotKit` in `main.jsx`:**

```jsx
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

createRoot(document.getElementById("root")).render(
  <CopilotKit publicApiKey={import.meta.env.VITE_COPILOT_PUBLIC_API_KEY}>
    <App />
  </CopilotKit>
);
```

---

### Option B — Self-hosted runtime (you control the LLM key)

You run a small Node/Express backend that holds your OpenAI/Anthropic key. The frontend only talks to your own server.

**Backend** (new file, e.g. `server/index.mjs`):

```js
import express from "express";
import {
  CopilotRuntime,
  OpenAIAdapter,           // or AnthropicAdapter
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // key lives here

app.use("/api/copilotkit", (req, res) =>
  copilotRuntimeNodeHttpEndpoint({
    endpoint: "/api/copilotkit",
    runtime: new CopilotRuntime(),
    serviceAdapter: new OpenAIAdapter({ openai }),
  })(req, res)
);

app.listen(4000);
```

**Frontend `.env`:**

```
VITE_COPILOT_RUNTIME_URL=http://localhost:4000/api/copilotkit
```

**Code change — wrap with `runtimeUrl` instead:**

```jsx
<CopilotKit runtimeUrl={import.meta.env.VITE_COPILOT_RUNTIME_URL}>
  <App />
</CopilotKit>
```

---

## Wire up the existing actions

Once the provider is in place, activate the commented-out code in `App.jsx`. In `PanelA`, import `useCopilotAction` and register each action:

```jsx
import { useCopilotAction } from "@copilotkit/react-core";

// inside PanelA():
useCopilotAction({
  name: "incrementCounter",
  description: "Increment the counter in Panel B",
  parameters: [{ name: "amount", type: "number", description: "How much to add" }],
  handler: ({ amount }) => trigger("incrementCounter", { amount }),
});

useCopilotAction({
  name: "changeColor",
  description: "Change Panel B background color",
  parameters: [{ name: "color", type: "string", description: "Hex color string" }],
  handler: ({ color }) => trigger("changeColor", { color }),
});
```

## Add the chat UI (optional but useful)

```jsx
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

// inside App() return:
<ActionBusProvider>
  <div className="app-layout">…</div>
  <CopilotPopup />
</ActionBusProvider>
```

---

## Summary: where each key lives

| Approach | Key location | What it holds |
|---|---|---|
| CopilotKit Cloud | `.env` → `VITE_COPILOT_PUBLIC_API_KEY` | CopilotKit public key |
| Self-hosted | `server/.env` → `OPENAI_API_KEY` (never in frontend) | Your OpenAI/Anthropic key |

The `localStorage` key stored by the "Set LLM API Key" button in the UI can feed either approach dynamically:

```jsx
<CopilotKit publicApiKey={localStorage.getItem("llm_api_key")}>
```
