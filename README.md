# CopilotKit AG-UI Demo — React 19

A split-layout page where an AI chatbot (right) controls the content area (left) in real-time using CopilotKit AG-UI.

## How it works

| What you type | What happens |
|---|---|
| `Update content to Hello World` | Updates the **title** |
| `Change the title to My New Title` | Updates the **title** |
| `Update the subtitle to something cool` | Updates the **subtitle** |
| `Set the body to Lorem ipsum...` | Updates the **body** text |
| `Change the tag to Breaking News` | Updates the **tag/badge** |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get a CopilotKit API key

Sign up free at [cloud.copilotkit.ai](https://cloud.copilotkit.ai) and create a project.

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env and paste your key:
# VITE_COPILOT_PUBLIC_API_KEY=ck_pub_xxxx
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Self-hosted runtime (optional)

If you prefer to run your own backend (e.g., to keep your OpenAI key server-side):

```bash
# In a separate backend project:
npm install @copilotkit/runtime

# server.js (Express example)
import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
const runtime = new CopilotRuntime();
app.post("/api/copilotkit", runtime.asExpressEndpoint(new OpenAIAdapter()));
```

Then in `App.jsx`, replace `publicApiKey` with:
```jsx
<CopilotKit runtimeUrl="http://localhost:4000/api/copilotkit">
```

## Key concepts

| API | Purpose |
|---|---|
| `useCopilotAction` | Registers a callable tool the AI can invoke |
| `useCopilotReadable` | Shares state context with the AI |
| `CopilotChat` | Drop-in chat UI widget |
| `CopilotKit` (provider) | Wraps the app, connects to the runtime |
