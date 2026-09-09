import { Gladiator, LudusStaff, LudusWorker } from "../../types/game";

export interface DailyExpenseBreakdown {
  baseCost: number;
  gladiatorCost: number;
  staffCost: number;
  workerCost: number;

  generalWorkerReductionPercent: number;
  generalWorkerReductionAmount: number;

  grossTotalCost: number;

  expenseReductionPercent: number;
  expenseReductionAmount: number;

  totalCost: number;
}

interface CalculateDailyExpensesOptions {
  gladiators: Gladiator[];
  ludusId: string;
  staff: LudusStaff[];
  workers: LudusWorker[];
}

export function calculateDailyExpenses({
  gladiators,
  ludusId,
  staff,
  workers,
}: CalculateDailyExpensesOptions): DailyExpenseBreakdown {
  const BASE_COST = 40;

  const livingGladiators = gladiators.filter(
    (gladiator) => gladiator.ludusId === ludusId && gladiator.status !== "dead",
  );

  const gladiatorCost = livingGladiators.length * 15;

  const hiredStaff = staff.filter((member) => member.hired);

  const staffCost = hiredStaff.reduce(
    (total, member) => total + member.salary,
    0,
  );

  const workerCost = workers.reduce(
    (total, worker) => total + worker.count * worker.dailySalary,
    0,
  );

  /*
    GENEL İŞÇİLER

    Ludus'un temizlik, yemek, taşıma ve günlük bakım
    işlerini yaparak temel işletme giderini azaltırlar.

    Her işçi:
    %5 * efficiency

    Maksimum indirim:
    %40
  */
  const generalWorkers = workers.find((worker) => worker.role === "general");

  const generalWorkerReductionPercent = generalWorkers
    ? Math.min(
        40,
        generalWorkers.count * 5 * Math.max(0, generalWorkers.efficiency),
      )
    : 0;

  const generalWorkerReductionAmount = Math.round(
    BASE_COST * (generalWorkerReductionPercent / 100),
  );

  const baseCost = Math.max(0, BASE_COST - generalWorkerReductionAmount);

  const grossTotalCost = baseCost + gladiatorCost + staffCost + workerCost;

  /*
    KÂHYA

    Genel işçiler temel bakım maliyetini düşürdükten sonra
    Kâhya kalan toplam günlük gider üzerinden indirim sağlar.
  */
  const steward = hiredStaff.find((member) => member.role === "steward");

  const expenseReductionPercent = steward?.expenseReduction ?? 0;

  const expenseReductionAmount = Math.round(
    grossTotalCost * (expenseReductionPercent / 100),
  );

  const totalCost = Math.max(0, grossTotalCost - expenseReductionAmount);

  return {
    baseCost,
    gladiatorCost,
    staffCost,
    workerCost,

    generalWorkerReductionPercent,
    generalWorkerReductionAmount,

    grossTotalCost,

    expenseReductionPercent,
    expenseReductionAmount,

    totalCost,
  };
}
