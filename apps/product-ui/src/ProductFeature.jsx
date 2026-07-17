import { useCallback, useRef, useState } from "react";
import ProductCopilotRegistration from "./ProductCopilotRegistration.jsx";
import ProductPage from "./ProductPage.jsx";

const noNavigation = () => {};

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

const fundUniverse = [
  ["Atlas Global Income Fund", "AGIF", "Multi-asset", "Global", "Medium", 4.7, 0.55, "USD", true, "A", "Balanced income mix with global bond and dividend equity exposure."],
  ["Harbor Short Duration Bond", "HSDB", "Fixed income", "US", "Low", 3.8, 0.21, "USD", false, "A-", "Lower duration bond profile for conservative cash-flow needs."],
  ["Northstar Asia Dividend", "NAD", "Equity income", "Asia", "High", 5.4, 0.74, "USD", true, "B+", "Asia dividend income with higher regional equity risk."],
  ["Evergreen ESG Bond Plus", "EEBP", "Fixed income", "Global", "Medium", 4.1, 0.39, "USD", true, "A", "ESG-screened global credit exposure with moderate volatility."],
  ["Cedar Balanced Allocation", "CBA", "Multi-asset", "US", "Medium", 3.6, 0.48, "USD", true, "A-", "Core US allocation blend with moderate income and growth."],
  ["Summit European Credit", "SEC", "Fixed income", "Europe", "Medium", 4.4, 0.46, "EUR", false, "B+", "European corporate credit income with active duration control."],
  ["Pioneer Growth Opportunities", "PGO", "Equity growth", "Global", "High", 1.2, 0.62, "USD", true, "B", "Global growth-focused fund with limited income contribution."],
  ["Keystone Conservative Income", "KCI", "Multi-asset", "Global", "Low", 3.4, 0.34, "USD", true, "A", "Defensive global allocation for stable income and lower drawdown risk."],
  ["Meridian US Treasury Ladder", "MUTL", "Fixed income", "US", "Low", 3.2, 0.18, "USD", true, "A", "US treasury ladder for capital preservation and predictable income."],
  ["Bluewater Municipal Income", "BMI", "Fixed income", "US", "Low", 3.5, 0.25, "USD", false, "A-", "Tax-aware municipal bond income for conservative US investors."],
  ["Oakridge US Dividend Leaders", "OUDL", "Equity income", "US", "Medium", 3.9, 0.41, "USD", true, "A-", "US large-cap dividend income with quality and ESG screens."],
  ["Granite High Yield Credit", "GHYC", "Fixed income", "US", "High", 6.2, 0.69, "USD", false, "B", "High yield US credit income for aggressive risk budgets."],
  ["Pacific Asia Bond Income", "PABI", "Fixed income", "Asia", "Medium", 4.6, 0.5, "USD", true, "B+", "Asia bond income across sovereign and investment-grade credit."],
  ["Lotus Asia ESG Dividend", "LAED", "Equity income", "Asia", "Medium", 4.8, 0.66, "USD", true, "A-", "Asia dividend portfolio with ESG preference and income focus."],
  ["Dragonfly China Growth Equity", "DCGE", "Equity growth", "Asia", "High", 0.8, 0.82, "USD", false, "B", "China and Asia growth exposure for high-volatility mandates."],
  ["Sakura Balanced Income", "SBI", "Multi-asset", "Asia", "Medium", 4.2, 0.57, "USD", true, "A-", "Asia balanced income using bonds, dividends, and covered-call overlays."],
  ["Alpine European Dividend", "AED", "Equity income", "Europe", "Medium", 4.5, 0.54, "EUR", true, "A-", "European dividend income with quality balance-sheet discipline."],
  ["Rhine Investment Grade Bond", "RIGB", "Fixed income", "Europe", "Low", 3.1, 0.22, "EUR", true, "A", "Low-risk European investment grade bond exposure."],
  ["Eurostar Strategic Credit", "ESC", "Fixed income", "Europe", "High", 5.9, 0.61, "EUR", false, "B", "Flexible European credit income with high yield allocations."],
  ["Nordic Sustainable Allocation", "NSA", "Multi-asset", "Europe", "Low", 2.9, 0.33, "EUR", true, "A", "Sustainable European multi-asset allocation for defensive investors."],
  ["Continental Growth Opportunities", "CGO", "Equity growth", "Europe", "High", 1.1, 0.72, "EUR", true, "B+", "European innovation and growth companies with ESG preference."],
  ["Global Quality Dividend", "GQD", "Equity income", "Global", "Medium", 4.0, 0.44, "USD", true, "A", "Global quality dividend strategy for recurring equity income."],
  ["Horizon Global ESG Growth", "HGEG", "Equity growth", "Global", "High", 1.0, 0.58, "USD", true, "B+", "Global ESG growth portfolio focused on durable revenue expansion."],
  ["Compass Multi-Asset Income", "CMAI", "Multi-asset", "Global", "Medium", 5.0, 0.52, "USD", false, "B+", "Global income allocation with bonds, preferreds, and dividend equities."],
  ["Anchor Conservative Allocation", "ACA", "Multi-asset", "Global", "Low", 3.0, 0.31, "USD", true, "A", "Capital preservation with global bonds and defensive income assets."],
  ["Beacon Global Bond Fund", "BGBF", "Fixed income", "Global", "Low", 3.7, 0.28, "USD", true, "A", "Global bond exposure across government and investment-grade markets."],
  ["Frontier Emerging Market Income", "FEMI", "Fixed income", "Global", "High", 6.8, 0.83, "USD", false, "B", "Emerging market bond income for aggressive yield seekers."],
  ["Sequoia Global Infrastructure Income", "SGII", "Equity income", "Global", "Medium", 4.3, 0.59, "USD", true, "A-", "Global infrastructure dividend income with inflation-linked cash flows."],
  ["Silvercrest Technology Growth", "STG", "Equity growth", "Global", "High", 0.5, 0.64, "USD", true, "B+", "Technology-led global equity growth with minimal current income."],
  ["Harbor HKD Short Bond", "HKSB", "Fixed income", "Asia", "Low", 2.8, 0.2, "HKD", true, "A", "HKD short-duration bond fund for liquidity and capital stability."],
  ["Bauhinia HKD Income Portfolio", "BHIP", "Multi-asset", "Asia", "Low", 3.3, 0.38, "HKD", true, "A-", "HKD multi-asset income portfolio with defensive Asia exposure."],
  ["Pearl River Dividend Fund", "PRDF", "Equity income", "Asia", "Medium", 4.6, 0.62, "HKD", false, "B+", "Hong Kong and Asia dividend income with currency alignment."],
  ["Lion Rock Asia Growth", "LRAG", "Equity growth", "Asia", "High", 1.3, 0.75, "HKD", true, "B", "HKD Asia equity growth strategy for aggressive investors."],
  ["Victoria Harbour Credit", "VHC", "Fixed income", "Asia", "Medium", 4.2, 0.47, "HKD", false, "B+", "HKD corporate credit income with moderate duration risk."],
  ["Capital Preserve Bond", "CPB", "Fixed income", "US", "Low", 2.9, 0.19, "USD", true, "A", "US short bond strategy for low-risk capital preservation."],
  ["Liberty Core Balanced", "LCB", "Multi-asset", "US", "Low", 3.1, 0.36, "USD", true, "A-", "US core balanced allocation with stable income and modest growth."],
  ["Redwood US Equity Income", "RUEI", "Equity income", "US", "Medium", 4.2, 0.43, "USD", true, "A-", "US dividend equity income with quality and low-volatility screens."],
  ["Aspen US Growth Select", "AUGS", "Equity growth", "US", "High", 0.7, 0.57, "USD", true, "B+", "US growth equities across technology, healthcare, and consumer themes."],
  ["Prairie High Income Allocation", "PHIA", "Multi-asset", "US", "High", 5.8, 0.71, "USD", false, "B", "High income US allocation using high yield bonds and equity income."],
  ["Baltic Green Bond", "BGB", "Fixed income", "Europe", "Low", 2.7, 0.24, "EUR", true, "A", "European green bond fund with low credit and ESG risk."],
  ["Iberia Income Opportunities", "IIO", "Multi-asset", "Europe", "Medium", 4.1, 0.49, "EUR", false, "B+", "European income allocation across credit and dividend equities."],
  ["Danube Dividend Equity", "DDE", "Equity income", "Europe", "Medium", 4.6, 0.56, "EUR", true, "A-", "European dividend income tilted toward defensive sectors."],
  ["Alps Small Cap Growth", "ASCG", "Equity growth", "Europe", "High", 0.9, 0.79, "EUR", false, "B", "European small-cap growth exposure with high volatility."],
  ["Europa Defensive Multi Asset", "EDMA", "Multi-asset", "Europe", "Low", 3.2, 0.35, "EUR", true, "A", "Defensive European multi-asset income with ESG preference."],
  ["Silk Road Balanced Income", "SRBI", "Multi-asset", "Asia", "Medium", 4.9, 0.6, "USD", true, "A-", "Asia balanced income fund with bonds, dividends, and alternatives."],
  ["ASEAN Sustainable Bond", "ASB", "Fixed income", "Asia", "Low", 3.6, 0.32, "USD", true, "A-", "ASEAN sustainable bond exposure for lower-risk income."],
  ["India Equity Growth", "IEG", "Equity growth", "Asia", "High", 0.6, 0.77, "USD", true, "B+", "India equity growth fund focused on domestic demand and technology."],
  ["Korea Dividend Plus", "KDP", "Equity income", "Asia", "Medium", 4.1, 0.58, "USD", true, "B+", "Korea dividend income with shareholder-return improvement theme."],
  ["Asia High Yield Income", "AHYI", "Fixed income", "Asia", "High", 6.5, 0.82, "USD", false, "B", "Asia high yield credit income for aggressive portfolios."],
  ["World Balanced Opportunities", "WBO", "Multi-asset", "Global", "High", 5.5, 0.68, "USD", true, "B+", "Global multi-asset opportunities fund with higher income and growth risk."]
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

export default function ProductFeature({
  copilotBridge,
  onNavigate = noNavigation
}) {
  const [productCriteria, setProductCriteria] = useState(initialProductCriteria);
  const criteriaRef = useRef(initialProductCriteria);
  const [fundResults, setFundResults] = useState(() =>
    runLocalFundSearch(initialProductCriteria)
  );

  const commitCriteria = useCallback((nextCriteria) => {
    criteriaRef.current = nextCriteria;
    setProductCriteria(nextCriteria);
  }, []);

  const updateCriteriaFromUi = useCallback((key, value) => {
    const nextCriteria = {
      ...criteriaRef.current,
      [key]: key === "minYield" ? parseAmount(value) : value
    };
    commitCriteria(nextCriteria);
  }, [commitCriteria]);

  const updateCriteriaFromTool = useCallback((updates) => {
    commitCriteria({
      ...criteriaRef.current,
      ...definedValues(updates)
    });
  }, [commitCriteria]);

  const runSearch = useCallback((updates = {}) => {
    const nextCriteria = {
      ...criteriaRef.current,
      ...definedValues(updates)
    };
    const nextResults = runLocalFundSearch(nextCriteria);

    commitCriteria(nextCriteria);
    setFundResults(nextResults);
    onNavigate("/product-search");
    return nextResults;
  }, [commitCriteria, onNavigate]);

  const replaceResults = useCallback((results) => {
    const nextResults = results.map((result, index) => ({
      id: `${result.ticker || result.name}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      esg: Boolean(result.esg),
      rating: result.rating || "B+",
      ticker: result.ticker || "DEMO",
      ...result
    }));

    setFundResults(nextResults);
    onNavigate("/product-search");
  }, [onNavigate]);

  const runSearchFromUi = useCallback(() => {
    setFundResults(runLocalFundSearch(criteriaRef.current));
  }, []);

  return (
    <>
      <ProductCopilotRegistration
        copilotBridge={copilotBridge}
        productCriteria={productCriteria}
        fundResults={fundResults}
        onUpdateCriteria={updateCriteriaFromTool}
        onRunSearch={runSearch}
        onReplaceResults={replaceResults}
      />
      <ProductPage
        productCriteria={productCriteria}
        fundResults={fundResults}
        onCriteriaChange={updateCriteriaFromUi}
        onSearch={runSearchFromUi}
        onNavigate={onNavigate}
      />
    </>
  );
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
    const textMatch =
      terms.length === 0 || terms.every((term) => searchableText.includes(term));
    const riskMatch = riskRank[fund.risk] <= maxRisk;
    const assetMatch =
      criteria.assetClass === "Any" || fund.assetClass === criteria.assetClass;
    const regionMatch =
      criteria.region === "Global" ||
      fund.region === criteria.region ||
      fund.region === "Global";
    const currencyMatch = fund.currency === criteria.currency;
    const yieldMatch = fund.distributionYield >= Number(criteria.minYield || 0);
    const esgMatch = !criteria.esg || fund.esg;

    return (
      textMatch &&
      riskMatch &&
      assetMatch &&
      regionMatch &&
      currencyMatch &&
      yieldMatch &&
      esgMatch
    );
  });

  const fallback = fundUniverse.filter(
    (fund) => fund.currency === criteria.currency
  );

  return (filtered.length ? filtered : fallback)
    .sort((left, right) => right.distributionYield - left.distributionYield)
    .slice(0, 12);
}

function definedValues(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== null
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
