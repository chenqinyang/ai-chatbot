import { Search, TableProperties } from "lucide-react";
import "../../../packages/theme/journey.css";

export default function ProductPage({
  productCriteria,
  fundResults,
  onCriteriaChange,
  onSearch,
  onNavigate
}) {
  return (
    <section className="product-layout">
      <div className="search-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Step 2 · Product UI remote</p>
            <h2>Product Search</h2>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => onNavigate("/financial-profile")}
          >
            Profile
          </button>
        </div>

        <div className="criteria-grid">
          <label className="text-field wide">
            <span>Keywords</span>
            <input
              value={productCriteria.query}
              onChange={(event) => onCriteriaChange("query", event.target.value)}
            />
          </label>
          <SelectField
            label="Risk"
            value={productCriteria.risk}
            options={["Conservative", "Moderate", "Aggressive"]}
            onChange={(value) => onCriteriaChange("risk", value)}
          />
          <SelectField
            label="Asset Class"
            value={productCriteria.assetClass}
            options={["Any", "Fixed income", "Multi-asset", "Equity income", "Equity growth"]}
            onChange={(value) => onCriteriaChange("assetClass", value)}
          />
          <SelectField
            label="Region"
            value={productCriteria.region}
            options={["Global", "US", "Europe", "Asia"]}
            onChange={(value) => onCriteriaChange("region", value)}
          />
          <SelectField
            label="Currency"
            value={productCriteria.currency}
            options={["USD", "EUR", "HKD"]}
            onChange={(value) => onCriteriaChange("currency", value)}
          />
          <label className="text-field">
            <span>Minimum Yield</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={productCriteria.minYield}
              onChange={(event) => onCriteriaChange("minYield", event.target.value)}
            />
          </label>
          <SelectField
            label="Horizon"
            value={productCriteria.horizon}
            options={["0-1 year", "1-3 years", "3-5 years", "5+ years"]}
            onChange={(value) => onCriteriaChange("horizon", value)}
          />
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={productCriteria.esg}
              onChange={(event) => onCriteriaChange("esg", event.target.checked)}
            />
            <span>ESG Preferred</span>
          </label>
        </div>

        <button className="primary-button search-action" type="button" onClick={onSearch}>
          <Search size={16} />
          Search Funds
        </button>
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
              {fundResults.map((fund) => (
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
