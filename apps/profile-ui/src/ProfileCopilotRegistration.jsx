import { useEffect } from "react";
import { z } from "zod";

/** @typedef {import("../../../packages/copilot-bridge/CopilotBridge").CopilotBridge} CopilotBridge */

const financialProfileParameters = z.object({
  annualIncome: z.number().optional().describe("Annual income amount."),
  liquidSavings: z.number().optional().describe("Liquid savings or cash amount."),
  investmentAssets: z.number().optional().describe("Current investment asset amount."),
  monthlyExpenses: z.number().optional().describe("Monthly expense amount."),
  liabilities: z.number().optional().describe("Total liability amount."),
  monthlyDebtPayments: z.number().optional().describe("Monthly debt payment amount.")
});

export default function ProfileCopilotRegistration({
  copilotBridge,
  financialProfile,
  profileSummary,
  onUpdateFinancialProfile
}) {
  useEffect(() => {
    if (!copilotBridge) {
      return undefined;
    }

    return copilotBridge.registerContext({
      description:
        "Financial Profile UI state owned by the React 18 profile remote. Use it to understand the user's income, savings, investment assets, expenses, liabilities, debt payments, and calculated profile metrics.",
      value: {
        financialProfile,
        profileSummary
      },
      agentIds: ["default"]
    });
  }, [copilotBridge, financialProfile, profileSummary]);

  useEffect(() => {
    if (!copilotBridge) {
      return undefined;
    }

    return copilotBridge.registerTool({
      name: "update_financial_profile",
      agentId: "default",
      description:
        "Update one or more amount fields in the React 18 Financial Profile UI. Amounts are numeric USD values.",
      parameters: financialProfileParameters,
      handler: async (updates) => {
        const updatedFields = onUpdateFinancialProfile(updates);
        return {
          updatedFields,
          message: "Financial profile updated in the React 18 remote."
        };
      }
    });
  }, [copilotBridge, onUpdateFinancialProfile]);

  return null;
}
