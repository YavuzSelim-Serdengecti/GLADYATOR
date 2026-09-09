import { LudusWorker } from "../../types/game";

export interface DailyIncomeBreakdown {
  mineIncome: number;
  totalIncome: number;
}

interface CalculateDailyIncomeOptions {
  workers: LudusWorker[];
}

export function calculateDailyIncome({
  workers,
}: CalculateDailyIncomeOptions): DailyIncomeBreakdown {
  const miners = workers.find((worker) => worker.role === "miner");

  if (!miners || miners.count <= 0) {
    return {
      mineIncome: 0,
      totalIncome: 0,
    };
  }

  const BASE_MINER_INCOME = 35;

  const mineIncome = Math.round(
    miners.count * BASE_MINER_INCOME * miners.efficiency,
  );

  return {
    mineIncome,
    totalIncome: mineIncome,
  };
}
