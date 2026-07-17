import { useCallback, useMemo, useState } from "react";
import ProfileCopilotRegistration from "./ProfileCopilotRegistration.jsx";
import ProfilePage from "./ProfilePage.jsx";

const initialFinancialProfile = {
  annualIncome: 145000,
  liquidSavings: 52000,
  investmentAssets: 180000,
  monthlyExpenses: 6200,
  liabilities: 72000,
  monthlyDebtPayments: 1350
};

const financialFieldKeys = new Set(Object.keys(initialFinancialProfile));

export default function ProfileFeature({ copilotBridge, onNavigate = () => {} }) {
  const [financialProfile, setFinancialProfile] = useState(initialFinancialProfile);

  const profileSummary = useMemo(
    () => summarizeFinancialProfile(financialProfile),
    [financialProfile]
  );

  const updateFinancialProfile = useCallback((updates) => {
    const acceptedUpdates = definedFinancialNumbers(updates);
    const updatedFields = Object.keys(acceptedUpdates);

    if (updatedFields.length > 0) {
      setFinancialProfile((current) => ({
        ...current,
        ...acceptedUpdates
      }));
    }

    return updatedFields;
  }, []);

  const updateFinancialField = useCallback((key, value) => {
    if (!financialFieldKeys.has(key)) {
      return;
    }

    setFinancialProfile((current) => ({
      ...current,
      [key]: parseAmount(value)
    }));
  }, []);

  return (
    <>
      <ProfileCopilotRegistration
        copilotBridge={copilotBridge}
        financialProfile={financialProfile}
        profileSummary={profileSummary}
        onUpdateFinancialProfile={updateFinancialProfile}
      />
      <ProfilePage
        financialProfile={financialProfile}
        profileSummary={profileSummary}
        onFinancialFieldChange={updateFinancialField}
        onNavigate={onNavigate}
      />
    </>
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

function definedFinancialNumbers(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) =>
        financialFieldKeys.has(key) &&
        value !== undefined &&
        value !== null &&
        Number.isFinite(value)
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
