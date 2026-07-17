import { useEffect, useRef } from "react";
import { z } from "zod";

/** @typedef {import("../../../packages/copilot-bridge/CopilotBridge").CopilotBridge} CopilotBridge */

const productCriteriaParameters = z.object({
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
});

const replacementResultsParameters = z.object({
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
});

export default function ProductCopilotRegistration({
  copilotBridge,
  productCriteria,
  fundResults,
  onUpdateCriteria,
  onRunSearch,
  onReplaceResults
}) {
  const handlersRef = useRef({
    onUpdateCriteria,
    onRunSearch,
    onReplaceResults
  });

  useEffect(() => {
    handlersRef.current = {
      onUpdateCriteria,
      onRunSearch,
      onReplaceResults
    };
  }, [onReplaceResults, onRunSearch, onUpdateCriteria]);

  useEffect(() => {
    if (!copilotBridge) {
      return undefined;
    }

    return copilotBridge.registerContext({
      description:
        "Product Search UI state owned by the product remote. Use it to understand the current fund criteria and visible search results.",
      value: {
        productCriteria,
        fundResults
      },
      agentIds: ["default"]
    });
  }, [copilotBridge, fundResults, productCriteria]);

  useEffect(() => {
    if (!copilotBridge) {
      return undefined;
    }

    return copilotBridge.registerTool({
      name: "update_product_search_criteria",
      agentId: "default",
      description:
        "Update product search criteria. Use this when the user asks to change risk, horizon, currency, yield, ESG preference, query, asset class, or region.",
      parameters: productCriteriaParameters,
      handler: async (updates) => {
        handlersRef.current.onUpdateCriteria(updates);
        return "Product search criteria updated.";
      }
    });
  }, [copilotBridge]);

  useEffect(() => {
    if (!copilotBridge) {
      return undefined;
    }

    return copilotBridge.registerTool({
      name: "run_product_search",
      agentId: "default",
      description:
        "Run the sample fund search with optional criteria updates, then update the visible result table.",
      parameters: productCriteriaParameters,
      handler: async (updates) => {
        const results = handlersRef.current.onRunSearch(updates);
        return JSON.stringify(results, null, 2);
      }
    });
  }, [copilotBridge]);

  useEffect(() => {
    if (!copilotBridge) {
      return undefined;
    }

    return copilotBridge.registerTool({
      name: "replace_fund_results",
      agentId: "default",
      description:
        "Replace the fund search result table with curated results. Use realistic demo fund rows only.",
      parameters: replacementResultsParameters,
      handler: async ({ results }) => {
        handlersRef.current.onReplaceResults(results);
        return "Fund results replaced.";
      }
    });
  }, [copilotBridge]);

  return null;
}
