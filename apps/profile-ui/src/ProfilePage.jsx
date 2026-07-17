import {
  Banknote,
  CircleDollarSign,
  SlidersHorizontal,
  TrendingUp,
  WalletCards
} from "lucide-react";
import "../../../packages/theme/journey.css";

const financialFieldDefs = [
  { key: "annualIncome", label: "Annual Income", icon: Banknote },
  { key: "liquidSavings", label: "Liquid Savings", icon: WalletCards },
  { key: "investmentAssets", label: "Investment Assets", icon: TrendingUp },
  { key: "monthlyExpenses", label: "Monthly Expenses", icon: CircleDollarSign },
  { key: "liabilities", label: "Total Liabilities", icon: SlidersHorizontal },
  { key: "monthlyDebtPayments", label: "Monthly Debt Payments", icon: Banknote }
];

export default function ProfilePage({
  financialProfile,
  profileSummary,
  onFinancialFieldChange,
  onNavigate
}) {
  return (
    <section className="page-grid">
      <div className="page-main">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Step 1 · Profile UI remote</p>
            <h2>Financial Profile</h2>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => onNavigate("/product-search")}
          >
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
                value={financialProfile[key]}
                onChange={(event) => onFinancialFieldChange(key, event.target.value)}
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
        <Metric label="Net Worth" value={formatCurrency(profileSummary.netWorth)} />
        <Metric label="Monthly Surplus" value={formatCurrency(profileSummary.monthlySurplus)} />
        <Metric label="Debt-to-Income" value={`${profileSummary.debtToIncome}%`} />
        <Metric
          label="Investable Assets"
          value={formatCurrency(profileSummary.investableAssets)}
        />
      </aside>
    </section>
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

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
