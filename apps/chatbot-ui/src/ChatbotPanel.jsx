import { useState } from "react";
import {
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Search,
  WalletCards
} from "lucide-react";
import { CopilotChat } from "@copilotkit/react-core/v2";
import "../../../packages/theme/journey.css";

const pageMeta = {
  "financial-profile": {
    title: "Financial Profile",
    tone: "profile",
    icon: WalletCards,
    chatTitle: "Profile Copilot",
    initial:
      "I can see this financial profile page. Ask me to update income, liabilities, savings, expenses, or summarize the profile.",
    placeholder: "Update income to 180000..."
  },
  "product-search": {
    title: "Product Search",
    tone: "search",
    icon: Search,
    chatTitle: "Product Copilot",
    initial:
      "I can see the product search page. Ask me to change criteria, run a fund search, or rewrite the result table.",
    placeholder: "Find moderate USD income funds..."
  }
};

export default function ChatbotPanel({ currentPage = "financial-profile", agentId = "default" }) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = pageMeta[currentPage] || pageMeta["financial-profile"];
  const Icon = meta.icon;

  return (
    <aside className={`chat-drawer ${meta.tone} ${collapsed ? "is-collapsed" : ""}`}>
      <button
        className="drawer-toggle"
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? "Expand chat" : "Collapse chat"}
        title={collapsed ? "Expand chat" : "Collapse chat"}
      >
        {collapsed ? <PanelRightOpen size={19} /> : <PanelRightClose size={19} />}
      </button>

      {collapsed ? (
        <div className="collapsed-rail" aria-hidden="true">
          <MessageSquare size={21} />
          <span>Chat</span>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <div className="chat-page-icon">
              <Icon size={18} />
            </div>
            <div>
              <p>{meta.chatTitle}</p>
              <span>{meta.title} · Chatbot UI remote</span>
            </div>
          </div>
          <div className="chat-frame">
            <CopilotChat
              agentId={agentId}
              className="copilot-chat"
              onError={(errorEvent) => {
                console.error("[copilotkit-chat]", errorEvent);
              }}
              labels={{
                title: meta.chatTitle,
                welcomeMessageText: meta.initial,
                chatInputPlaceholder: meta.placeholder
              }}
            />
          </div>
        </>
      )}
    </aside>
  );
}
