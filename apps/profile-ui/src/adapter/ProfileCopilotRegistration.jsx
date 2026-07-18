import {
  useCopilotKit,
  useFrontendTool
} from "@copilotkit/react-core/v2";
import { useLayoutEffect, useMemo } from "react";
import { z } from "zod";

const profileContextDescription =
  "Financial Profile UI state owned by the React 18 profile feature. Use it to understand the user's income, savings, investment assets, expenses, liabilities, debt payments, and calculated profile metrics.";

const financialProfileParameters = z.object({
  annualIncome: z.number().optional().describe("Annual income amount."),
  liquidSavings: z.number().optional().describe("Liquid savings or cash amount."),
  investmentAssets: z.number().optional().describe("Current investment asset amount."),
  monthlyExpenses: z.number().optional().describe("Monthly expense amount."),
  liabilities: z.number().optional().describe("Total liability amount."),
  monthlyDebtPayments: z.number().optional().describe("Monthly debt payment amount.")
});

export default function ProfileCopilotRegistration({
  profileContext,
  integrationRef
}) {
  const { copilotkit } = useCopilotKit();
  const serializedProfileContext = useMemo(
    () => JSON.stringify(profileContext),
    [profileContext]
  );

  useLayoutEffect(() => {
    const id = copilotkit.addContext({
      description: profileContextDescription,
      value: serializedProfileContext,
      agentIds: ["default"]
    });

    return () => copilotkit.removeContext(id);
  }, [copilotkit, serializedProfileContext]);

  useFrontendTool(
    {
      name: "update_financial_profile",
      agentId: "default",
      description:
        "Update one or more amount fields in the React 18 Financial Profile UI. Amounts are numeric USD values.",
      parameters: financialProfileParameters,
      followUp: false,
      handler: async (updates) => {
        const updateFinancialProfile = integrationRef.current?.handler;

        if (typeof updateFinancialProfile !== "function") {
          throw new Error("The Financial Profile UI is not ready to accept updates.");
        }

        const updatedFields = await updateFinancialProfile(updates);

        return {
          updatedFields,
          message: "Financial profile updated in the React 18 remote."
        };
      }
    },
    []
  );

  return null;
}
