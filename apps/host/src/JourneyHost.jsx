import { lazy, Suspense, useMemo } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  LoaderCircle,
  Route as RouteIcon,
  Search,
  WalletCards
} from "lucide-react";
import {
  useAgentContext,
  useCopilotKit,
  useFrontendTool
} from "@copilotkit/react-core/v2";
import { RemoteBoundary } from "./RemoteBoundary.jsx";

/** @typedef {import("../../../packages/copilot-bridge/CopilotBridge").CopilotBridge} CopilotBridge */

const ProfileAdapter = lazy(() => import("profile_ui/ProfileAdapter"));
const ProductFeature = lazy(() => import("product_ui/ProductFeature"));
const ChatbotPanel = lazy(() => import("chatbot_ui/ChatbotPanel"));

const pageIds = ["financial-profile", "product-search"];
const pageMeta = {
  "financial-profile": {
    route: "/financial-profile",
    title: "Financial Profile",
    shortTitle: "Profile",
    icon: WalletCards
  },
  "product-search": {
    route: "/product-search",
    title: "Product Search",
    shortTitle: "Products",
    icon: Search
  }
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { copilotkit } = useCopilotKit();
  const currentPage =
    pageIds.find((page) => location.pathname.startsWith(pageMeta[page].route)) ??
    "financial-profile";

  /** @type {CopilotBridge} */
  const productCopilotBridge = useMemo(
    () => ({
      registerContext(input) {
        const value =
          typeof input.value === "string" ? input.value : JSON.stringify(input.value);

        if (value === undefined) {
          throw new TypeError("Copilot context values must be JSON-serializable.");
        }

        const id = copilotkit.addContext({
          ...input,
          value
        });

        return () => copilotkit.removeContext(id);
      },

      registerTool(input) {
        copilotkit.addTool({
          ...input,
          // Remote side effects publish fresh context on their next effect.
          followUp: false,
          handler: (args, context) =>
            input.handler(args, {
              signal: context?.signal,
              agent: context?.agent
            })
        });

        return () => copilotkit.removeTool(input.name, input.agentId);
      }
    }),
    [copilotkit]
  );

  const shellContext = useMemo(
    () => ({
      currentRoute: location.pathname,
      currentPage,
      currentPageTitle: pageMeta[currentPage].title
    }),
    [currentPage, location.pathname]
  );

  useAgentContext({
    description:
      "Host-owned shell context. Use it to know the active route and page. Feature remotes register their own domain context.",
    value: JSON.stringify(shellContext, null, 2)
  });

  useFrontendTool({
    name: "navigate_journey_page",
    description: "Navigate the journey shell to the requested feature page.",
    parameters: z.object({
      page: z.enum(pageIds).describe("The destination page.")
    }),
    handler: ({ page }) => {
      navigate(pageMeta[page].route);
      return `Navigated to ${pageMeta[page].title}.`;
    },
    followUp: false
  }, [navigate]);

  return (
    <div className="app-shell">
      <main className="journey-pane">
        <header className="app-header">
          <div>
            <div className="eyebrow">
              <RouteIcon size={15} />
              Journey UI
            </div>
            <h1>Investment Onboarding</h1>
          </div>
          <nav className="page-nav" aria-label="Journey pages">
            {pageIds.map((page) => {
              const meta = pageMeta[page];
              const Icon = meta.icon;

              return (
                <NavLink key={page} to={meta.route} className="nav-button">
                  <Icon size={17} />
                  {meta.shortTitle}
                </NavLink>
              );
            })}
          </nav>
        </header>

        <div hidden={currentPage !== "financial-profile"}>
          <RemoteBoundary name="Profile adapter">
            <Suspense fallback={<RemoteLoading label="Loading Profile UI" />}>
              <ProfileAdapter onNavigate={navigate} />
            </Suspense>
          </RemoteBoundary>
        </div>

        <div hidden={currentPage !== "product-search"}>
          <RemoteBoundary name="Product UI">
            <Suspense fallback={<RemoteLoading label="Loading Product UI" />}>
              <ProductFeature
                copilotBridge={productCopilotBridge}
                onNavigate={navigate}
              />
            </Suspense>
          </RemoteBoundary>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/financial-profile" replace />} />
          <Route path="/financial-profile" element={null} />
          <Route path="/product-search" element={null} />
          <Route path="*" element={<Navigate to="/financial-profile" replace />} />
        </Routes>
      </main>

      <RemoteBoundary name="Chatbot UI" compact>
        <Suspense fallback={<RemoteLoading label="Loading Chatbot UI" compact />}>
          <ChatbotPanel currentPage={currentPage} agentId="default" />
        </Suspense>
      </RemoteBoundary>
    </div>
  );
}

function RemoteLoading({ label, compact = false }) {
  return (
    <div className={`remote-loading ${compact ? "remote-loading-chat" : ""}`} role="status">
      <LoaderCircle className="spin-icon" size={18} />
      <span>{label}</span>
    </div>
  );
}

export default App;
