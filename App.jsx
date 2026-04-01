import { useState, useRef, useCallback, createContext, useContext } from "react";
import "./App.css";

// ─── Shared action bus (pure React, no LLM needed) ────────────────────────────
// Components register handlers here; other components call them directly.
const ActionBus = createContext(null);

function ActionBusProvider({ children }) {
  const registry = useRef({});

  const register = useCallback((name, handler) => {
    registry.current[name] = handler;
    return () => delete registry.current[name]; // returns cleanup fn
  }, []);

  const trigger = useCallback((name, args) => {
    const fn = registry.current[name];
    if (fn) fn(args);
    else console.warn(`[ActionBus] No handler registered for "${name}"`);
  }, []);

  return <ActionBus.Provider value={{ register, trigger }}>{children}</ActionBus.Provider>;
}

// ─── Panel B: Receiver — registers action handlers on mount ──────────────────
function PanelB() {
  const { register } = useContext(ActionBus);
  const [log, setLog] = useState([]);
  const [color, setColor] = useState("#1a1a2e");
  const [count, setCount] = useState(0);

  const addLog = (msg) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));

  // Register each action handler once on mount
  useState(() => {
    const cleanups = [
      register("incrementCounter", ({ amount }) => {
        setCount((c) => c + amount);
        addLog(`incrementCounter(${amount})`);
      }),
      register("changeColor", ({ color: c }) => {
        setColor(c);
        addLog(`changeColor("${c}")`);
      }),
      register("showAlert", ({ message }) => {
        addLog(`showAlert("${message}")`);
      }),
    ];
    return () => cleanups.forEach((fn) => fn());
  });

  return (
    <div className="panel panel-b" style={{ backgroundColor: color }}>
      <h2>Panel B — Receiver</h2>
      <p className="hint">
        Handlers registered in <code>ActionBus</code> via <code>register(name, fn)</code>
      </p>

      <div className="counter-box">
        <span className="counter-label">Counter</span>
        <span className="counter-value">{count}</span>
      </div>

      <div className="log-box">
        <div className="log-title">Action Log</div>
        {log.length === 0 ? (
          <div className="log-empty">No actions triggered yet...</div>
        ) : (
          log.map((entry, i) => (
            <div key={i} className="log-entry">{entry}</div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Panel A: Sender — calls Panel B's handlers via the bus ──────────────────
function PanelA() {
  const { trigger } = useContext(ActionBus);

  const buttons = [
    { label: "Increment by 1",  onClick: () => trigger("incrementCounter", { amount: 1 }),           bg: "#4caf50" },
    { label: "Increment by 5",  onClick: () => trigger("incrementCounter", { amount: 5 }),           bg: "#2196f3" },
    { label: "Turn Blue",       onClick: () => trigger("changeColor", { color: "#0d1b2a" }),          bg: "#1565c0" },
    { label: "Turn Purple",     onClick: () => trigger("changeColor", { color: "#1a0033" }),          bg: "#7b1fa2" },
    { label: "Turn Dark Green", onClick: () => trigger("changeColor", { color: "#0a1f0f" }),          bg: "#2e7d32" },
    { label: 'Alert "Hello!"',  onClick: () => trigger("showAlert",  { message: "Hello from A!" }),  bg: "#f57c00" },
  ];

  return (
    <div className="panel panel-a">
      <h2>Panel A — Sender</h2>
      <p className="hint">
        Calls Panel B's handlers via <code>trigger(name, args)</code> — no LLM, no API key
      </p>

      <div className="button-grid">
        {buttons.map((btn, i) => (
          <button key={i} className="action-btn" style={{ background: btn.bg }} onClick={btn.onClick}>
            {btn.label}
          </button>
        ))}
      </div>

      <div className="code-box">
        <pre>{`// How it works — pure React, no backend needed:

const { trigger } = useContext(ActionBus);
trigger("incrementCounter", { amount: 1 });

// To add LLM support later, register the same
// handlers with CopilotKit's useCopilotAction:
//
// useCopilotAction({
//   name: "incrementCounter",
//   handler: ({ amount }) => trigger("incrementCounter", { amount }),
// });`}</pre>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ActionBusProvider>
      <div className="app-layout">
        <PanelA />
        <PanelB />
      </div>
    </ActionBusProvider>
  );
}
