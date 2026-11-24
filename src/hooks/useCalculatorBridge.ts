"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  BridgeHouseCount,
  BridgeTab,
  CalculatorBridgeState,
  PropertyBridgeParams,
} from "@/types/calculator-bridge";

const VALID_TABS: BridgeTab[] = ["tax", "dsr", "brokerage"];
const VALID_HOUSES: BridgeHouseCount[] = ["1", "2", "3+"];

export interface UseCalculatorBridgeOptions {
  initialParams: PropertyBridgeParams;
  defaultAnnualIncome?: number;
  defaultLtvPercent?: number;
}

export function useCalculatorBridge({
  initialParams,
  defaultAnnualIncome = 80_000_000,
  defaultLtvPercent = 60,
}: UseCalculatorBridgeOptions) {
  const [state, setState] = useState<CalculatorBridgeState>({
    ...initialParams,
    houseCount: initialParams.houseCount ?? "1",
    tab: "tax",
    annualIncome: defaultAnnualIncome,
    ltvPercent: defaultLtvPercent,
    isRegulatedArea: false,
    isFirstHome: false,
  });

  const [hydrated, setHydrated] = useState(false);

  // 마운트 시 URL 쿼리 파라미터에서 계산 상태 복원 (SSR/SSG Hydration 안전)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const qTab = sp.get("tab") as BridgeTab | null;
    const qPrice = Number(sp.get("price"));
    const qArea = Number(sp.get("area"));
    const qHouse = sp.get("house") as BridgeHouseCount | null;
    const qIncome = Number(sp.get("income"));
    const qLtv = Number(sp.get("ltv"));

    setState((prev) => ({
      ...prev,
      tab: qTab && VALID_TABS.includes(qTab) ? qTab : prev.tab,
      price: Number.isFinite(qPrice) && qPrice > 0 ? Math.round(qPrice) : prev.price,
      area: Number.isFinite(qArea) && qArea > 0 ? qArea : prev.area,
      houseCount:
        qHouse && VALID_HOUSES.includes(qHouse) ? qHouse : prev.houseCount,
      annualIncome:
        Number.isFinite(qIncome) && qIncome > 0
          ? Math.round(qIncome)
          : prev.annualIncome,
      ltvPercent:
        Number.isFinite(qLtv) && qLtv >= 10 && qLtv <= 80
          ? Math.round(qLtv)
          : prev.ltvPercent,
    }));
    setHydrated(true);
  }, []);

  // 상태 변경 시 window.history.replaceState로 URL 쿼리 실시간 동기화
  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", state.tab);
    url.searchParams.set("price", String(Math.round(state.price)));
    url.searchParams.set("area", String(state.area));
    url.searchParams.set("house", state.houseCount);
    url.searchParams.set("income", String(Math.round(state.annualIncome)));
    url.searchParams.set("ltv", String(state.ltvPercent));

    window.history.replaceState(null, "", url.pathname + url.search);
  }, [
    hydrated,
    state.tab,
    state.price,
    state.area,
    state.houseCount,
    state.annualIncome,
    state.ltvPercent,
  ]);

  const updateState = useCallback(
    (patch: Partial<CalculatorBridgeState>) => {
      setState((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const resetToInitial = useCallback(() => {
    setState({
      ...initialParams,
      houseCount: initialParams.houseCount ?? "1",
      tab: "tax",
      annualIncome: defaultAnnualIncome,
      ltvPercent: defaultLtvPercent,
      isRegulatedArea: false,
      isFirstHome: false,
    });
  }, [initialParams, defaultAnnualIncome, defaultLtvPercent]);

  return {
    state,
    updateState,
    resetToInitial,
  };
}
