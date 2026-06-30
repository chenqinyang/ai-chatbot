import { useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  Banknote,
  Bot,
  CircleDollarSign,
  LoaderCircle,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Route as RouteIcon,
  Search,
  SlidersHorizontal,
  TableProperties,
  TrendingUp,
  WalletCards
} from "lucide-react";
import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useAgentContext,
  useCopilotKit,
  useFrontendTool
} from "@copilotkit/react-core/v2";

const pageMeta = {
  "financial-profile": {
    route: "/financial-profile",
    title: "Financial Profile",
    shortTitle: "Profile",
    tone: "profile",
    icon: WalletCards,
    chatTitle: "Profile Copilot",
    initial:
      "I can see this financial profile page. Ask me to update income, liabilities, savings, expenses, or summarize the profile.",
    placeholder: "Update income to 180000..."
  },
  "product-search": {
    route: "/product-search",
    title: "Product Search",
    shortTitle: "Products",
    tone: "search",
    icon: Search,
    chatTitle: "Product Copilot",
    initial:
      "I can see the product search page. Ask me to change criteria, run a fund search, or rewrite the result table.",
    placeholder: "Find moderate USD income funds..."
  }
};

const financialFieldDefs = [
  { key: "annualIncome", label: "Annual Income", icon: Banknote },
  { key: "liquidSavings", label: "Liquid Savings", icon: WalletCards },
  { key: "investmentAssets", label: "Investment Assets", icon: TrendingUp },
  { key: "monthlyExpenses", label: "Monthly Expenses", icon: CircleDollarSign },
  { key: "liabilities", label: "Total Liabilities", icon: SlidersHorizontal },
  { key: "monthlyDebtPayments", label: "Monthly Debt Payments", icon: Banknote }
];

const initialFinancialProfile = {
  annualIncome: 145000,
  liquidSavings: 52000,
  investmentAssets: 180000,
  monthlyExpenses: 6200,
  liabilities: 72000,
  monthlyDebtPayments: 1350
};

const initialProductCriteria = {
  query: "global income",
  risk: "Moderate",
  assetClass: "Any",
  region: "Global",
  currency: "USD",
  minYield: 3.2,
  horizon: "3-5 years",
  esg: true
};

const profileToolDemoParameters = {
  annualIncome: 16800,
  liquidSavings: 68000,
  investmentAssets: 215000,
  monthlyExpenses: 5900,
  liabilities: 58000,
  monthlyDebtPayments: 980
};

const searchToolDemoParameters = {
  query: "bond income",
  risk: "Moderate",
  assetClass: "Fixed income",
  region: "Global",
  currency: "USD",
  minYield: 4,
  horizon: "1-3 years",
  esg: true
};

const fundUniverse = [
  [
    "Atlas Global Income Fund",
    "AGIF",
    "Multi-asset",
    "Global",
    "Medium",
    4.7,
    0.55,
    "USD",
    true,
    "A",
    "Balanced income mix with global bond and dividend equity exposure."
  ],
  [
    "Harbor Short Duration Bond",
    "HSDB",
    "Fixed income",
    "US",
    "Low",
    3.8,
    0.21,
    "USD",
    false,
    "A-",
    "Lower duration bond profile for conservative cash-flow needs."
  ],
  [
    "Northstar Asia Dividend",
    "NAD",
    "Equity income",
    "Asia",
    "High",
    5.4,
    0.74,
    "USD",
    true,
    "B+",
    "Asia dividend income with higher regional equity risk."
  ],
  [
    "Evergreen ESG Bond Plus",
    "EEBP",
    "Fixed income",
    "Global",
    "Medium",
    4.1,
    0.39,
    "USD",
    true,
    "A",
    "ESG-screened global credit exposure with moderate volatility."
  ],
  [
    "Cedar Balanced Allocation",
    "CBA",
    "Multi-asset",
    "US",
    "Medium",
    3.6,
    0.48,
    "USD",
    true,
    "A-",
    "Core US allocation blend with moderate income and growth."
  ],
  [
    "Summit European Credit",
    "SEC",
    "Fixed income",
    "Europe",
    "Medium",
    4.4,
    0.46,
    "EUR",
    false,
    "B+",
    "European corporate credit income with active duration control."
  ],
  [
    "Pioneer Growth Opportunities",
    "PGO",
    "Equity growth",
    "Global",
    "High",
    1.2,
    0.62,
    "USD",
    true,
    "B",
    "Global growth-focused fund with limited income contribution."
  ],
  [
    "Keystone Conservative Income",
    "KCI",
    "Multi-asset",
    "Global",
    "Low",
    3.4,
    0.34,
    "USD",
    true,
    "A",
    "Defensive global allocation for stable income and lower drawdown risk."
  ],
  [
    "Meridian US Treasury Ladder",
    "MUTL",
    "Fixed income",
    "US",
    "Low",
    3.2,
    0.18,
    "USD",
    true,
    "A",
    "US treasury ladder for capital preservation and predictable income."
  ],
  [
    "Bluewater Municipal Income",
    "BMI",
    "Fixed income",
    "US",
    "Low",
    3.5,
    0.25,
    "USD",
    false,
    "A-",
    "Tax-aware municipal bond income for conservative US investors."
  ],
  [
    "Oakridge US Dividend Leaders",
    "OUDL",
    "Equity income",
    "US",
    "Medium",
    3.9,
    0.41,
    "USD",
    true,
    "A-",
    "US large-cap dividend income with quality and ESG screens."
  ],
  [
    "Granite High Yield Credit",
    "GHYC",
    "Fixed income",
    "US",
    "High",
    6.2,
    0.69,
    "USD",
    false,
    "B",
    "High yield US credit income for aggressive risk budgets."
  ],
  [
    "Pacific Asia Bond Income",
    "PABI",
    "Fixed income",
    "Asia",
    "Medium",
    4.6,
    0.5,
    "USD",
    true,
    "B+",
    "Asia bond income across sovereign and investment-grade credit."
  ],
  [
    "Lotus Asia ESG Dividend",
    "LAED",
    "Equity income",
    "Asia",
    "Medium",
    4.8,
    0.66,
    "USD",
    true,
    "A-",
    "Asia dividend portfolio with ESG preference and income focus."
  ],
  [
    "Dragonfly China Growth Equity",
    "DCGE",
    "Equity growth",
    "Asia",
    "High",
    0.8,
    0.82,
    "USD",
    false,
    "B",
    "China and Asia growth exposure for high-volatility mandates."
  ],
  [
    "Sakura Balanced Income",
    "SBI",
    "Multi-asset",
    "Asia",
    "Medium",
    4.2,
    0.57,
    "USD",
    true,
    "A-",
    "Asia balanced income using bonds, dividends, and covered-call overlays."
  ],
  [
    "Alpine European Dividend",
    "AED",
    "Equity income",
    "Europe",
    "Medium",
    4.5,
    0.54,
    "EUR",
    true,
    "A-",
    "European dividend income with quality balance-sheet discipline."
  ],
  [
    "Rhine Investment Grade Bond",
    "RIGB",
    "Fixed income",
    "Europe",
    "Low",
    3.1,
    0.22,
    "EUR",
    true,
    "A",
    "Low-risk European investment grade bond exposure."
  ],
  [
    "Eurostar Strategic Credit",
    "ESC",
    "Fixed income",
    "Europe",
    "High",
    5.9,
    0.61,
    "EUR",
    false,
    "B",
    "Flexible European credit income with high yield allocations."
  ],
  [
    "Nordic Sustainable Allocation",
    "NSA",
    "Multi-asset",
    "Europe",
    "Low",
    2.9,
    0.33,
    "EUR",
    true,
    "A",
    "Sustainable European multi-asset allocation for defensive investors."
  ],
  [
    "Continental Growth Opportunities",
    "CGO",
    "Equity growth",
    "Europe",
    "High",
    1.1,
    0.72,
    "EUR",
    true,
    "B+",
    "European innovation and growth companies with ESG preference."
  ],
  [
    "Global Quality Dividend",
    "GQD",
    "Equity income",
    "Global",
    "Medium",
    4.0,
    0.44,
    "USD",
    true,
    "A",
    "Global quality dividend strategy for recurring equity income."
  ],
  [
    "Horizon Global ESG Growth",
    "HGEG",
    "Equity growth",
    "Global",
    "High",
    1.0,
    0.58,
    "USD",
    true,
    "B+",
    "Global ESG growth portfolio focused on durable revenue expansion."
  ],
  [
    "Compass Multi-Asset Income",
    "CMAI",
    "Multi-asset",
    "Global",
    "Medium",
    5.0,
    0.52,
    "USD",
    false,
    "B+",
    "Global income allocation with bonds, preferreds, and dividend equities."
  ],
  [
    "Anchor Conservative Allocation",
    "ACA",
    "Multi-asset",
    "Global",
    "Low",
    3.0,
    0.31,
    "USD",
    true,
    "A",
    "Capital preservation with global bonds and defensive income assets."
  ],
  [
    "Beacon Global Bond Fund",
    "BGBF",
    "Fixed income",
    "Global",
    "Low",
    3.7,
    0.28,
    "USD",
    true,
    "A",
    "Global bond exposure across government and investment-grade markets."
  ],
  [
    "Frontier Emerging Market Income",
    "FEMI",
    "Fixed income",
    "Global",
    "High",
    6.8,
    0.83,
    "USD",
    false,
    "B",
    "Emerging market bond income for aggressive yield seekers."
  ],
  [
    "Sequoia Global Infrastructure Income",
    "SGII",
    "Equity income",
    "Global",
    "Medium",
    4.3,
    0.59,
    "USD",
    true,
    "A-",
    "Global infrastructure dividend income with inflation-linked cash flows."
  ],
  [
    "Silvercrest Technology Growth",
    "STG",
    "Equity growth",
    "Global",
    "High",
    0.5,
    0.64,
    "USD",
    true,
    "B+",
    "Technology-led global equity growth with minimal current income."
  ],
  [
    "Harbor HKD Short Bond",
    "HKSB",
    "Fixed income",
    "Asia",
    "Low",
    2.8,
    0.2,
    "HKD",
    true,
    "A",
    "HKD short-duration bond fund for liquidity and capital stability."
  ],
  [
    "Bauhinia HKD Income Portfolio",
    "BHIP",
    "Multi-asset",
    "Asia",
    "Low",
    3.3,
    0.38,
    "HKD",
    true,
    "A-",
    "HKD multi-asset income portfolio with defensive Asia exposure."
  ],
  [
    "Pearl River Dividend Fund",
    "PRDF",
    "Equity income",
    "Asia",
    "Medium",
    4.6,
    0.62,
    "HKD",
    false,
    "B+",
    "Hong Kong and Asia dividend income with currency alignment."
  ],
  [
    "Lion Rock Asia Growth",
    "LRAG",
    "Equity growth",
    "Asia",
    "High",
    1.3,
    0.75,
    "HKD",
    true,
    "B",
    "HKD Asia equity growth strategy for aggressive investors."
  ],
  [
    "Victoria Harbour Credit",
    "VHC",
    "Fixed income",
    "Asia",
    "Medium",
    4.2,
    0.47,
    "HKD",
    false,
    "B+",
    "HKD corporate credit income with moderate duration risk."
  ],
  [
    "Capital Preserve Bond",
    "CPB",
    "Fixed income",
    "US",
    "Low",
    2.9,
    0.19,
    "USD",
    true,
    "A",
    "US short bond strategy for low-risk capital preservation."
  ],
  [
    "Liberty Core Balanced",
    "LCB",
    "Multi-asset",
    "US",
    "Low",
    3.1,
    0.36,
    "USD",
    true,
    "A-",
    "US core balanced allocation with stable income and modest growth."
  ],
  [
    "Redwood US Equity Income",
    "RUEI",
    "Equity income",
    "US",
    "Medium",
    4.2,
    0.43,
    "USD",
    true,
    "A-",
    "US dividend equity income with quality and low-volatility screens."
  ],
  [
    "Aspen US Growth Select",
    "AUGS",
    "Equity growth",
    "US",
    "High",
    0.7,
    0.57,
    "USD",
    true,
    "B+",
    "US growth equities across technology, healthcare, and consumer themes."
  ],
  [
    "Prairie High Income Allocation",
    "PHIA",
    "Multi-asset",
    "US",
    "High",
    5.8,
    0.71,
    "USD",
    false,
    "B",
    "High income US allocation using high yield bonds and equity income."
  ],
  [
    "Baltic Green Bond",
    "BGB",
    "Fixed income",
    "Europe",
    "Low",
    2.7,
    0.24,
    "EUR",
    true,
    "A",
    "European green bond fund with low credit and ESG risk."
  ],
  [
    "Iberia Income Opportunities",
    "IIO",
    "Multi-asset",
    "Europe",
    "Medium",
    4.1,
    0.49,
    "EUR",
    false,
    "B+",
    "European income allocation across credit and dividend equities."
  ],
  [
    "Danube Dividend Equity",
    "DDE",
    "Equity income",
    "Europe",
    "Medium",
    4.6,
    0.56,
    "EUR",
    true,
    "A-",
    "European dividend income tilted toward defensive sectors."
  ],
  [
    "Alps Small Cap Growth",
    "ASCG",
    "Equity growth",
    "Europe",
    "High",
    0.9,
    0.79,
    "EUR",
    false,
    "B",
    "European small-cap growth exposure with high volatility."
  ],
  [
    "Europa Defensive Multi Asset",
    "EDMA",
    "Multi-asset",
    "Europe",
    "Low",
    3.2,
    0.35,
    "EUR",
    true,
    "A",
    "Defensive European multi-asset income with ESG preference."
  ],
  [
    "Silk Road Balanced Income",
    "SRBI",
    "Multi-asset",
    "Asia",
    "Medium",
    4.9,
    0.6,
    "USD",
    true,
    "A-",
    "Asia balanced income fund with bonds, dividends, and alternatives."
  ],
  [
    "ASEAN Sustainable Bond",
    "ASB",
    "Fixed income",
    "Asia",
    "Low",
    3.6,
    0.32,
    "USD",
    true,
    "A-",
    "ASEAN sustainable bond exposure for lower-risk income."
  ],
  [
    "India Equity Growth",
    "IEG",
    "Equity growth",
    "Asia",
    "High",
    0.6,
    0.77,
    "USD",
    true,
    "B+",
    "India equity growth fund focused on domestic demand and technology."
  ],
  [
    "Korea Dividend Plus",
    "KDP",
    "Equity income",
    "Asia",
    "Medium",
    4.1,
    0.58,
    "USD",
    true,
    "B+",
    "Korea dividend income with shareholder-return improvement theme."
  ],
  [
    "Asia High Yield Income",
    "AHYI",
    "Fixed income",
    "Asia",
    "High",
    6.5,
    0.82,
    "USD",
    false,
    "B",
    "Asia high yield credit income for aggressive portfolios."
  ],
  [
    "World Balanced Opportunities",
    "WBO",
    "Multi-asset",
    "Global",
    "High",
    5.5,
    0.68,
    "USD",
    true,
    "B+",
    "Global multi-asset opportunities fund with higher income and growth risk."
  ]
].map(
  (
    [
      name,
      ticker,
      assetClass,
      region,
      risk,
      distributionYield,
      expenseRatio,
      currency,
      esg,
      rating,
      rationale
    ],
    index
  ) => ({
    id: `fund-${index + 1}`,
    name,
    ticker,
    assetClass,
    region,
    risk,
    distributionYield,
    expenseRatio,
    currency,
    esg,
    rating,
    rationale
  })
);

const riskRank = { Low: 1, Medium: 2, High: 3 };
const riskLimit = { Conservative: 1, Moderate: 2, Aggressive: 3 };

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { copilotkit } = useCopilotKit();
  const { agent } = useAgent({
    agentId: "default",
    updates: [UseAgentUpdate.OnMessagesChanged, UseAgentUpdate.OnRunStatusChanged]
  });
  const [financialProfile, setFinancialProfile] = useState(initialFinancialProfile);
  const [productCriteria, setProductCriteria] = useState(initialProductCriteria);
  const [fundResults, setFundResults] = useState(() => runLocalFundSearch(initialProductCriteria));
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [toolDemoRun, setToolDemoRun] = useState({
    target: null,
    status: "idle",
    message: "Ready"
  });

  const currentPage =
    location.pathname.includes("product-search") ? "product-search" : "financial-profile";
  const defaultAgentReady = Boolean(copilotkit.getAgent("default"));

  const profileSummary = useMemo(
    () => summarizeFinancialProfile(financialProfile),
    [financialProfile]
  );

  const agentContext = useMemo(
    () => ({
      currentRoute: location.pathname,
      currentPage,
      currentPageTitle: pageMeta[currentPage].title,
      chatStyleTone: pageMeta[currentPage].tone,
      financialProfile,
      profileSummary,
      productCriteria,
      fundResults
    }),
    [currentPage, financialProfile, fundResults, location.pathname, productCriteria, profileSummary]
  );

  useAgentContext({
    description:
      "Live journey UI state. The assistant should use this to know the active page, route, financial profile, product search criteria, and visible fund results.",
    value: JSON.stringify(agentContext, null, 2)
  });

  useFrontendTool({
    name: "navigate_journey_page",
    description: "Navigate the journey UI to the requested page.",
    parameters: z.object({
      page: z.enum(["financial-profile", "product-search"]).describe("The destination page.")
    }),
    handler: ({ page }) => {
      navigate(pageMeta[page].route);
      return `Navigated to ${pageMeta[page].title}.`;
    }
  }, [navigate]);

  useFrontendTool({
    name: "update_financial_profile",
    description:
      "Update one or more financial profile amount fields in the current journey UI. Amounts are numeric USD values.",
    parameters: z.object({
      annualIncome: z.number().optional().describe("Annual income amount."),
      liquidSavings: z.number().optional().describe("Liquid savings or cash amount."),
      investmentAssets: z.number().optional().describe("Current investment asset amount."),
      monthlyExpenses: z.number().optional().describe("Monthly expense amount."),
      liabilities: z.number().optional().describe("Total liability amount."),
      monthlyDebtPayments: z.number().optional().describe("Monthly debt payment amount.")
    }),
    handler: (updates) => {
      setFinancialProfile((current) => ({ ...current, ...definedNumbers(updates) }));
      return "Financial profile updated.";
    },
    followUp: false
  });

  useFrontendTool({
    name: "update_product_search_criteria",
    description:
      "Update product search criteria. Use this when the user asks to change risk, horizon, currency, yield, ESG preference, query, asset class, or region.",
    parameters: z.object({
      query: z.string().optional().describe("Search keywords."),
      risk: z.enum(["Conservative", "Moderate", "Aggressive"]).optional(),
      assetClass: z
        .enum(["Any", "Fixed income", "Multi-asset", "Equity income", "Equity growth"])
        .optional(),
      region: z.enum(["Global", "US", "Europe", "Asia"]).optional(),
      currency: z.enum(["USD", "EUR", "HKD"]).optional(),
      minYield: z.number().optional().describe("Minimum distribution yield percentage."),
      horizon: z.enum(["0-1 year", "1-3 years", "3-5 years", "5+ years"]).optional(),
      esg: z.boolean().optional().describe("Whether ESG preference is required.")
    }),
    handler: (updates) => {
      setProductCriteria((current) => ({ ...current, ...definedValues(updates) }));
      return "Product search criteria updated.";
    },
    followUp: false
  });

  useFrontendTool({
    name: "run_product_search",
    description:
      "Run the sample fund search with optional criteria updates, then update the visible result table.",
    parameters: z.object({
      query: z.string().optional(),
      risk: z.enum(["Conservative", "Moderate", "Aggressive"]).optional(),
      assetClass: z
        .enum(["Any", "Fixed income", "Multi-asset", "Equity income", "Equity growth"])
        .optional(),
      region: z.enum(["Global", "US", "Europe", "Asia"]).optional(),
      currency: z.enum(["USD", "EUR", "HKD"]).optional(),
      minYield: z.number().optional(),
      horizon: z.enum(["0-1 year", "1-3 years", "3-5 years", "5+ years"]).optional(),
      esg: z.boolean().optional()
    }),
    handler: (updates) => {
      const nextCriteria = { ...productCriteria, ...definedValues(updates) };
      const nextResults = runLocalFundSearch(nextCriteria);
      setProductCriteria(nextCriteria);
      setFundResults(nextResults);
      navigate(pageMeta["product-search"].route);
      return JSON.stringify(nextResults, null, 2);
    },
    followUp: false
  }, [navigate, productCriteria]);

  useFrontendTool({
    name: "replace_fund_results",
    description:
      "Replace the fund search result table with curated results. Use realistic demo fund rows only.",
    parameters: z.object({
      results: z.array(
        z.object({
          name: z.string(),
          ticker: z.string().optional(),
          assetClass: z.string(),
          region: z.string(),
          risk: z.enum(["Low", "Medium", "High"]),
          distributionYield: z.number(),
          expenseRatio: z.number(),
          currency: z.string(),
          esg: z.boolean().optional(),
          rating: z.string().optional(),
          rationale: z.string()
        })
      )
    }),
    handler: ({ results }) => {
      const nextResults = results.map((result, index) => ({
        id: `${result.ticker || result.name}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        esg: Boolean(result.esg),
        rating: result.rating || "B+",
        ticker: result.ticker || "DEMO",
        ...result
      }));
      setFundResults(nextResults);
      navigate(pageMeta["product-search"].route);
      return "Fund results replaced.";
    },
    followUp: false
  }, [navigate]);

  const getToolDemoState = (target) => {
    const runningThisTarget = toolDemoRun.status === "running" && toolDemoRun.target === target;
    const runningOtherTarget = toolDemoRun.status === "running" && toolDemoRun.target !== target;
    const disabled = !defaultAgentReady || agent.isRunning || toolDemoRun.status === "running";

    return {
      disabled,
      busy: runningThisTarget,
      status: !defaultAgentReady
        ? "loading"
        : runningOtherTarget
          ? "running"
          : toolDemoRun.target === target
            ? toolDemoRun.status
            : "idle",
      message: !defaultAgentReady
        ? "Agent loading"
        : agent.isRunning
          ? "Agent busy"
          : runningOtherTarget
            ? "Tool running"
            : toolDemoRun.target === target
              ? toolDemoRun.message
              : "Ready"
    };
  };

  const runAgentToolDemo = async (target) => {
    if (!defaultAgentReady) {
      setToolDemoRun({
        target,
        status: "error",
        message: "Agent not ready"
      });
      return;
    }

    const runConfig =
      target === "profile"
        ? {
            name: "update_financial_profile",
            parameters: profileToolDemoParameters,
            successMessage: "Profile updated"
          }
        : {
            name: "run_product_search",
            parameters: searchToolDemoParameters,
            successMessage: "Search refreshed"
          };

    setToolDemoRun({
      target,
      status: "running",
      message: "Running tool"
    });

    try {
      await copilotkit.runTool({
        name: runConfig.name,
        parameters: runConfig.parameters,
        followUp: false
      });

      const liveAgent = copilotkit.getAgent("default");
      liveAgent?.setMessages([...liveAgent.messages]);

      setToolDemoRun({
        target,
        status: "success",
        message: runConfig.successMessage
      });
    } catch (error) {
      setToolDemoRun({
        target,
        status: "error",
        message: error instanceof Error ? error.message : "Tool run failed"
      });
    }
  };

  const updateFinancialField = (key, value) => {
    setFinancialProfile((current) => ({
      ...current,
      [key]: parseAmount(value)
    }));
  };

  const updateCriteria = (key, value) => {
    setProductCriteria((current) => ({
      ...current,
      [key]: key === "minYield" ? parseAmount(value) : value
    }));
  };

  const runSearchFromUi = () => {
    setFundResults(runLocalFundSearch(productCriteria));
  };

  return (
    <div className={`app-shell chat-${chatCollapsed ? "collapsed" : "expanded"}`}>
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
            {Object.entries(pageMeta).map(([page, meta]) => {
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

        <Routes>
          <Route path="/" element={<Navigate to="/financial-profile" replace />} />
          <Route
            path="/financial-profile"
            element={
              <FinancialProfilePage
                profile={financialProfile}
                summary={profileSummary}
                onChange={updateFinancialField}
                onNext={() => navigate(pageMeta["product-search"].route)}
                toolDemo={getToolDemoState("profile")}
                onRunToolDemo={() => runAgentToolDemo("profile")}
              />
            }
          />
          <Route
            path="/product-search"
            element={
              <ProductSearchPage
                criteria={productCriteria}
                results={fundResults}
                onCriteriaChange={updateCriteria}
                onSearch={runSearchFromUi}
                onBack={() => navigate(pageMeta["financial-profile"].route)}
                toolDemo={getToolDemoState("search")}
                onRunToolDemo={() => runAgentToolDemo("search")}
              />
            }
          />
          <Route path="*" element={<Navigate to="/financial-profile" replace />} />
        </Routes>
      </main>

      <ChatDrawer
        collapsed={chatCollapsed}
        currentPage={currentPage}
        onToggle={() => setChatCollapsed((value) => !value)}
      />
    </div>
  );
}

function FinancialProfilePage({ profile, summary, onChange, onNext, toolDemo, onRunToolDemo }) {
  return (
    <section className="page-grid">
      <div className="page-main">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Step 1</p>
            <h2>Financial Profile</h2>
          </div>
          <button className="primary-button" type="button" onClick={onNext}>
            Product Search
          </button>
        </div>

        <div className="form-grid">
          {financialFieldDefs.map(({ key, label, icon: Icon }) => (
            <label className="amount-field" key={key}>
              <span>
                <Icon size={16} />
                {label}
              </span>
              <input
                type="number"
                min="0"
                value={profile[key]}
                onChange={(event) => onChange(key, event.target.value)}
              />
            </label>
          ))}
        </div>
      </div>

      <aside className="insight-panel">
        <div className="section-heading compact">
          <div>
            <p className="section-kicker">Snapshot</p>
            <h2>Profile Metrics</h2>
          </div>
        </div>
        <Metric label="Net Worth" value={formatCurrency(summary.netWorth)} />
        <Metric label="Monthly Surplus" value={formatCurrency(summary.monthlySurplus)} />
        <Metric label="Debt-to-Income" value={`${summary.debtToIncome}%`} />
        <Metric label="Investable Assets" value={formatCurrency(summary.investableAssets)} />
        <AgentToolRunButton
          label="Run Profile Tool"
          toolDemo={toolDemo}
          onRun={onRunToolDemo}
        />
      </aside>
    </section>
  );
}

function ProductSearchPage({
  criteria,
  results,
  onCriteriaChange,
  onSearch,
  onBack,
  toolDemo,
  onRunToolDemo
}) {
  return (
    <section className="product-layout">
      <div className="search-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Step 2</p>
            <h2>Product Search</h2>
          </div>
          <button className="secondary-button" type="button" onClick={onBack}>
            Profile
          </button>
        </div>

        <div className="criteria-grid">
          <label className="text-field wide">
            <span>Keywords</span>
            <input
              value={criteria.query}
              onChange={(event) => onCriteriaChange("query", event.target.value)}
            />
          </label>
          <SelectField
            label="Risk"
            value={criteria.risk}
            options={["Conservative", "Moderate", "Aggressive"]}
            onChange={(value) => onCriteriaChange("risk", value)}
          />
          <SelectField
            label="Asset Class"
            value={criteria.assetClass}
            options={["Any", "Fixed income", "Multi-asset", "Equity income", "Equity growth"]}
            onChange={(value) => onCriteriaChange("assetClass", value)}
          />
          <SelectField
            label="Region"
            value={criteria.region}
            options={["Global", "US", "Europe", "Asia"]}
            onChange={(value) => onCriteriaChange("region", value)}
          />
          <SelectField
            label="Currency"
            value={criteria.currency}
            options={["USD", "EUR", "HKD"]}
            onChange={(value) => onCriteriaChange("currency", value)}
          />
          <label className="text-field">
            <span>Minimum Yield</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={criteria.minYield}
              onChange={(event) => onCriteriaChange("minYield", event.target.value)}
            />
          </label>
          <SelectField
            label="Horizon"
            value={criteria.horizon}
            options={["0-1 year", "1-3 years", "3-5 years", "5+ years"]}
            onChange={(value) => onCriteriaChange("horizon", value)}
          />
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={criteria.esg}
              onChange={(event) => onCriteriaChange("esg", event.target.checked)}
            />
            <span>ESG Preferred</span>
          </label>
        </div>

        <button className="primary-button search-action" type="button" onClick={onSearch}>
          <Search size={16} />
          Search Funds
        </button>
        <AgentToolRunButton
          label="Run Search Tool"
          toolDemo={toolDemo}
          onRun={onRunToolDemo}
        />
      </div>

      <div className="results-panel">
        <div className="section-heading compact">
          <div>
            <p className="section-kicker">Results</p>
            <h2>Fund Table</h2>
          </div>
          <TableProperties size={21} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fund</th>
                <th>Class</th>
                <th>Region</th>
                <th>Risk</th>
                <th>Yield</th>
                <th>Fee</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {results.map((fund) => (
                <tr key={fund.id}>
                  <td>
                    <strong>{fund.name}</strong>
                    <span>{fund.ticker}</span>
                  </td>
                  <td>{fund.assetClass}</td>
                  <td>{fund.region}</td>
                  <td>
                    <span className={`risk-pill risk-${fund.risk.toLowerCase()}`}>{fund.risk}</span>
                  </td>
                  <td>{fund.distributionYield.toFixed(1)}%</td>
                  <td>{fund.expenseRatio.toFixed(2)}%</td>
                  <td>{fund.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AgentToolRunButton({ label, toolDemo, onRun }) {
  const Icon = toolDemo.busy ? LoaderCircle : Bot;

  return (
    <div className="agent-tool-row">
      <button
        className="secondary-button agent-tool-button"
        type="button"
        onClick={onRun}
        disabled={toolDemo.disabled}
      >
        <Icon className={toolDemo.busy ? "spin-icon" : undefined} size={16} />
        {toolDemo.busy ? "Running Tool" : label}
      </button>
      <span className={`agent-tool-status ${toolDemo.status}`}>{toolDemo.message}</span>
    </div>
  );
}

function ChatDrawer({ collapsed, currentPage, onToggle }) {
  const meta = pageMeta[currentPage];
  const Icon = meta.icon;

  return (
    <aside className={`chat-drawer ${meta.tone} ${collapsed ? "is-collapsed" : ""}`}>
      <button
        className="drawer-toggle"
        type="button"
        onClick={onToggle}
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
              <span>{meta.title}</span>
            </div>
          </div>
          <div className="chat-frame">
            <CopilotChat
              agentId="default"
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

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="text-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function summarizeFinancialProfile(profile) {
  const monthlyIncome = profile.annualIncome / 12;
  const monthlySurplus = monthlyIncome - profile.monthlyExpenses - profile.monthlyDebtPayments;
  const netWorth = profile.liquidSavings + profile.investmentAssets - profile.liabilities;
  const debtToIncome = monthlyIncome > 0 ? (profile.monthlyDebtPayments / monthlyIncome) * 100 : 0;

  return {
    monthlyIncome: roundCurrency(monthlyIncome),
    monthlySurplus: roundCurrency(monthlySurplus),
    netWorth: roundCurrency(netWorth),
    debtToIncome: Number(debtToIncome.toFixed(1)),
    investableAssets: roundCurrency(profile.liquidSavings + profile.investmentAssets)
  };
}

function runLocalFundSearch(criteria) {
  const terms = criteria.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const maxRisk = riskLimit[criteria.risk] || 3;

  const filtered = fundUniverse.filter((fund) => {
    const searchableText = [
      fund.name,
      fund.ticker,
      fund.assetClass,
      fund.region,
      fund.risk,
      fund.currency,
      fund.rationale
    ]
      .join(" ")
      .toLowerCase();
    const textMatch = terms.length === 0 || terms.every((term) => searchableText.includes(term));
    const riskMatch = riskRank[fund.risk] <= maxRisk;
    const assetMatch = criteria.assetClass === "Any" || fund.assetClass === criteria.assetClass;
    const regionMatch = criteria.region === "Global" || fund.region === criteria.region || fund.region === "Global";
    const currencyMatch = fund.currency === criteria.currency;
    const yieldMatch = fund.distributionYield >= Number(criteria.minYield || 0);
    const esgMatch = !criteria.esg || fund.esg;

    return textMatch && riskMatch && assetMatch && regionMatch && currencyMatch && yieldMatch && esgMatch;
  });

  const fallback = fundUniverse.filter((fund) => fund.currency === criteria.currency);
  return (filtered.length ? filtered : fallback)
    .sort((left, right) => right.distributionYield - left.distributionYield)
    .slice(0, 12);
}

function definedValues(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== null)
  );
}

function definedNumbers(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== null && Number.isFinite(value)
    )
  );
}

function parseAmount(value) {
  if (value === "") {
    return 0;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function roundCurrency(value) {
  return Math.round(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default App;
