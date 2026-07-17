# Federated Investment Copilot

The original single Vite application is now four independently built Rsbuild frontend applications connected with Module Federation.

## Architecture

```text
Host UI :3000
├── owns BrowserRouter and shell route state
├── owns the CopilotKit provider and its single browser-side core
├── creates one framework-free CopilotBridge adapter
├── keeps profile_ui/ProfileFeature mounted through one React Bridge
├── keeps product_ui/ProductFeature mounted as a normal React 19 remote
└── loads chatbot_ui/ChatbotPanel

Profile UI :3001 (React 18)
└── owns its state, calculations, page, context, and update tool in one Bridge root

Product UI :3002 (React 19)
└── owns its criteria, catalog, search, results, page, context, and three tools

Chatbot UI :3003 (React 19)
└── exposes the CopilotChat drawer and consumes the host provider

Copilot runtime :4000
└── owns the DeepSeek-backed CopilotKit runtime endpoint
```

The Host, Product UI, and Chatbot UI use React 19. React and React DOM remain shared singletons for the normal React 19 remotes. The Chatbot UI also consumes the same CopilotKit context instance created by the Host UI.

Profile UI is intentionally different. Its workspace pins React and React DOM to 18.3.1, its Rsbuild config keeps dependencies out of the federation share scope, and its `ProfileFeature` exposure uses `@module-federation/bridge-react/v18`. The Host loads that exposure with `createRemoteAppComponent`, which mounts one isolated React 18 root.

The Host is the only caller of `useCopilotKit()`. It wraps the returned CopilotKit core in a stable, plain JavaScript `CopilotBridge` whose two methods call `addContext()`/`removeContext()` and `addTool()`/`removeTool()`. The Host passes that same narrow bridge and a generic navigation callback to both feature remotes.

React provider trees cannot cross a React-version boundary, so the Profile remote never consumes or re-provides the Host's React 19 context. Inside its isolated root, `ProfileFeature` owns the financial state and calculations, renders `ProfilePage`, and mounts `ProfileCopilotRegistration`. Ordinary React 18 `useEffect()` calls register its context and `update_financial_profile` tool through the plain bridge. Each bridge call returns the cleanup function used by the effect.

Product UI shares React 19 with the Host, but it follows the same ownership contract instead of reaching into the provider. `ProductFeature` owns the criteria, fund catalog, filtering logic, results, and page. `ProductCopilotRegistration` registers Product context plus `update_product_search_criteria`, `run_product_search`, and `replace_fund_results` through React effects and the same plain bridge. Product UI does not import a CopilotKit hook or expose its domain callbacks to the Host.

A remote tool call therefore runs the handler defined beside the state it mutates. The owning feature rerenders its own page and re-registers its latest context. No Profile or Product data model, tool name, schema, or mutation handler lives in `JourneyHost.jsx`; no CopilotKit hook, React context, React element, or render function crosses the React 18 boundary.

The Host keeps both feature roots mounted while hiding the inactive route. Their state and Copilot registrations therefore remain available across journey navigation. The Host retains only platform concerns: route metadata, remote loading/error boundaries, the provider/core, the generic bridge adapter, and generic navigation.

Each application starts through an asynchronous bootstrap module. This lets the federation runtime initialize shared React and CopilotKit modules before application code consumes them.

## Run locally

1. Copy `.env.example` to `.env` and add your DeepSeek API key.
2. Install dependencies with `npm install`.
3. Start the runtime and all four frontend applications:

```bash
npm run dev
```

Open `http://127.0.0.1:3000`. The Profile, Product, and Chatbot remote development surfaces are available at ports `3001`, `3002`, and `3003`.

If port `4000` is already serving a healthy instance of this CopilotKit runtime, the development command reuses it. If another kind of service owns the port, stop that service or change `PORT` in `.env`.

## Build

```bash
npm run build
```

The build creates:

- `dist/host`
- `dist/profile-ui`
- `dist/product-ui`
- `dist/chatbot-ui`

The remotes emit both `remoteEntry.js` and `mf-manifest.json`. The host uses the manifests by default.

## Production configuration

Deploy each frontend output independently, then set these values when building the host:

```dotenv
PROFILE_UI_REMOTE_URL=https://profile.example.com/mf-manifest.json
PRODUCT_UI_REMOTE_URL=https://product.example.com/mf-manifest.json
CHATBOT_UI_REMOTE_URL=https://chat.example.com/mf-manifest.json
PUBLIC_COPILOT_RUNTIME_URL=https://api.example.com/api/copilotkit
```

Remote origins must allow the host to fetch their manifests, JavaScript, and CSS assets. The included development servers already send the required CORS header.

## Ownership contract

- Host UI: route composition, the CopilotKit provider/core, the generic `CopilotBridge` adapter, remote loading boundaries, and the runtime URL. It knows feature routes and remote entry points, not their domain state, schemas, tool names, or handlers.
- Profile UI: React 18 financial state, calculations, presentation, agent context, `update_financial_profile` schema, and handler. It exposes one persistent `ProfileFeature` Bridge application and registers through the plain bridge prop.
- Product UI: React 19 Product Search criteria, fund catalog, filtering, results, presentation, agent context, and all Product tool schemas and handlers. It exposes one persistent `ProductFeature` and registers through the same plain bridge prop.
- Chatbot UI: chat presentation and collapse state. It receives the active page and agent id from the host.
- Runtime server: model/provider credentials and CopilotKit runtime handler.

The host wraps each remote in a loading state and an error boundary so one unavailable remote does not produce a blank application.
