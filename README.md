# Federated Investment Copilot

The original single Vite application is now a set of independently built Rsbuild frontends connected with Module Federation. The Profile application has two build layers so its React 18 feature can run behind a React 19 adapter.

## Architecture

```text
Host UI :3000
├── owns BrowserRouter and shell route state
├── owns the CopilotKit provider and its single browser-side core
├── creates a framework-free CopilotBridge for Product UI
├── direct-loads profile_ui/ProfileAdapter as a React 19 remote
├── mounts only the active Profile or Product feature
├── shows the live CopilotKit context and frontend-tool registry counts
└── loads chatbot_ui/ChatbotPanel

Profile Adapter :3001 (React 19)
├── consumes the Host's shared CopilotKit provider directly
├── owns Profile context and tool registration
└── bridge-loads profile_ui_legacy/ProfileFeature

Profile UI Legacy :3004 (React 18)
├── owns its financial state, calculations, page, and mutation handler
└── publishes a plain { context, handler } integration callback

Product UI :3002 (React 19)
└── owns its criteria, catalog, search, results, page, context, and three tools

Chatbot UI :3003 (React 19)
└── exposes the CopilotChat drawer and consumes the host provider

Copilot runtime :4000
└── owns the DeepSeek-backed CopilotKit runtime endpoint
```

The Host, Profile Adapter, Product UI, and Chatbot UI use React 19. React and React DOM remain shared singletons for these direct-mode remotes. The Profile Adapter and Chatbot UI also consume the same CopilotKit context instance created by the Host UI.

The Host direct-loads `profile_ui/ProfileAdapter` with `React.lazy`. Because the adapter renders in the Host's React 19 tree and shares `@copilotkit/react-core/v2`, it can call `useAgentContext` and `useFrontendTool` under the existing provider without receiving any CopilotKit prop from the Host.

The adapter owns the second federation boundary. It loads `profile_ui_legacy/ProfileFeature` with `createRemoteAppComponent`, which mounts the Profile feature in an isolated React 18 root. The legacy build pins React and React DOM to 18.3.1, keeps them out of the Host's share scope, and exposes its application with `@module-federation/bridge-react/v18`.

React provider trees cannot cross the version boundary. Instead, the React 18 `ProfileFeature` publishes one plain `{ context, handler }` value through `onProfileIntegrationChange`. The context contains the current financial profile and calculated summary; the handler is the feature-owned `updateFinancialProfile` callback. The React 19 adapter stores the current context and latest handler, registers `update_financial_profile` with CopilotKit, and forwards tool calls to that handler. No React context, hook, element, or render function crosses the bridge.

Product UI keeps the original framework-free bridge design. The Host calls `useCopilotKit()`, wraps its core in a stable `CopilotBridge`, and passes that bridge only to `ProductFeature`. `ProductFeature` owns the criteria, catalog, filtering, results, and page. `ProductCopilotRegistration` registers Product context plus `update_product_search_criteria`, `run_product_search`, and `replace_fund_results` through the plain bridge.

A Profile tool call therefore runs in the React 19 adapter, invokes the latest handler owned by the React 18 feature, and causes the feature to publish fresh context after its state changes. Product tool calls continue to execute their remote-owned handlers through the Host's plain bridge. No Profile or Product data model, schema, or mutation handler lives in `JourneyHost.jsx`.

The Host conditionally mounts only the active feature route. Navigating away unmounts that feature, runs its context and tool cleanup, and destroys the nested React 18 root when leaving Profile. Returning to a route creates fresh feature state and registrations. A compact registry board reads the Host-owned CopilotKit core and displays the current context and frontend-tool totals, making the cleanup visible during navigation.

Each application starts through an asynchronous bootstrap module. This lets the federation runtime initialize shared React and CopilotKit modules before application code consumes them.

## Run locally

1. Copy `.env.example` to `.env` and add your DeepSeek API key.
2. Install dependencies with `npm install`.
3. Start the runtime and all frontend layers:

```bash
npm run dev
```

Open `http://127.0.0.1:3000`. The Profile React 19 adapter, Product UI, Chatbot UI, and React 18 Profile legacy remote are available at ports `3001`, `3002`, `3003`, and `3004`, respectively.

If port `4000` is already serving a healthy instance of this CopilotKit runtime, the development command reuses it. If another kind of service owns the port, stop that service or change `PORT` in `.env`.

## Build

```bash
npm run build
```

The build creates:

- `dist/host`
- `dist/profile-ui`
- `dist/profile-ui-legacy`
- `dist/product-ui`
- `dist/chatbot-ui`

The remotes emit both `remoteEntry.js` and `mf-manifest.json`. The Host uses the Profile Adapter, Product, and Chatbot manifests. The Profile Adapter uses the Profile legacy manifest.

## Production configuration

Deploy each frontend output independently, then set these values when building the host:

```dotenv
PROFILE_UI_REMOTE_URL=https://profile.example.com/mf-manifest.json
PROFILE_UI_LEGACY_REMOTE_URL=https://profile-legacy.example.com/mf-manifest.json
PRODUCT_UI_REMOTE_URL=https://product.example.com/mf-manifest.json
CHATBOT_UI_REMOTE_URL=https://chat.example.com/mf-manifest.json
PUBLIC_COPILOT_RUNTIME_URL=https://api.example.com/api/copilotkit
```

`PROFILE_UI_REMOTE_URL` is read by the Host build and points to the React 19 adapter. `PROFILE_UI_LEGACY_REMOTE_URL` is read by the adapter build and points to the isolated React 18 remote. Remote origins must allow their consumers to fetch manifests, JavaScript, and CSS assets. The included development servers already send the required CORS header.

## Ownership contract

- Host UI: route composition, the CopilotKit provider/core, the Product-only `CopilotBridge`, direct remote composition, loading boundaries, and the runtime URL. It knows feature routes and remote entry points, not their domain state, schemas, tool names, or handlers.
- Profile Adapter: React 19 direct remote exposed as `profile_ui/ProfileAdapter`. It consumes the Host provider, owns Profile CopilotKit hooks and the `update_financial_profile` schema, keeps the latest legacy context and handler, and owns the nested React bridge loading and fallback.
- Profile UI Legacy: React 18 financial state, calculations, presentation, and mutation handler. It exposes `profile_ui_legacy/ProfileFeature` as a Bridge application and publishes only the plain `{ context, handler }` integration value to the adapter.
- Product UI: React 19 Product Search criteria, fund catalog, filtering, results, presentation, agent context, and all Product tool schemas and handlers. It exposes `ProductFeature` and registers through the Host's plain bridge prop while its route is mounted.
- Chatbot UI: chat presentation and collapse state. It receives the active page and agent id from the host.
- Runtime server: model/provider credentials and CopilotKit runtime handler.

The Host wraps direct remotes in loading states and error boundaries. The Profile Adapter separately wraps the nested React 18 remote, so an unavailable legacy layer does not blank the Host.
