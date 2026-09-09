export type FinancialStatus =
  | "stable"
  | "warning"
  | "debt"
  | "critical"
  | "bankrupt";

export type BankruptcyState = {
  status: FinancialStatus;

  debtDays: number;

  totalDebt: number;

  bankrupt: boolean;
};

export type BankruptcyResult = {
  state: BankruptcyState;

  orderPenalty: number;

  prestigePenalty: number;

  message: string | null;
};

export const MAX_DEBT_DAYS = 5;

export const CRITICAL_DEBT_AMOUNT = 1000;

export function createInitialBankruptcyState(): BankruptcyState {
  return {
    status: "stable",

    debtDays: 0,

    totalDebt: 0,

    bankrupt: false,
  };
}

export function calculateFinancialStatus(
  denarius: number,
  debtDays: number,
): FinancialStatus {
  if (debtDays >= MAX_DEBT_DAYS) {
    return "bankrupt";
  }

  if (denarius <= -CRITICAL_DEBT_AMOUNT || debtDays >= 3) {
    return "critical";
  }

  if (denarius < 0) {
    return "debt";
  }

  if (denarius < 250) {
    return "warning";
  }

  return "stable";
}

export function processDailyBankruptcy({
  denarius,
  previousState,
}: {
  denarius: number;

  previousState: BankruptcyState;
}): BankruptcyResult {
  /*
    Para yeniden pozitife çıktıysa
    borç serisi sıfırlanır.
  */

  if (denarius >= 0) {
    const status = calculateFinancialStatus(denarius, 0);

    return {
      state: {
        status,

        debtDays: 0,

        totalDebt: 0,

        bankrupt: false,
      },

      orderPenalty: 0,

      prestigePenalty: 0,

      message:
        previousState.debtDays > 0
          ? "Ludus borçtan çıktı. Mali durum yeniden toparlandı."
          : null,
    };
  }

  const debtDays = previousState.debtDays + 1;

  const totalDebt = Math.abs(denarius);

  const status = calculateFinancialStatus(denarius, debtDays);

  /*
    Borç uzadıkça Ludus düzeni
    ve itibarı zarar görür.
  */

  let orderPenalty = 0;

  let prestigePenalty = 0;

  if (status === "debt") {
    orderPenalty = 3;
  }

  if (status === "critical") {
    orderPenalty = 7;
    prestigePenalty = 25;
  }

  if (status === "bankrupt") {
    orderPenalty = 15;
    prestigePenalty = 100;
  }

  let message: string | null = null;

  if (status === "debt") {
    message =
      `Ludus borca girdi. Borç: ${totalDebt} D. ` +
      `${MAX_DEBT_DAYS - debtDays} gün içinde ekonomiyi toparlamalısın.`;
  }

  if (status === "critical") {
    message =
      `Mali kriz! Ludus'un ${totalDebt} D borcu var. ` +
      `İflasa ${Math.max(0, MAX_DEBT_DAYS - debtDays)} gün kaldı.`;
  }

  if (status === "bankrupt") {
    message = "Ludus borçlarını ödeyemedi ve iflas etti.";
  }

  return {
    state: {
      status,

      debtDays,

      totalDebt,

      bankrupt: status === "bankrupt",
    },

    orderPenalty,

    prestigePenalty,

    message,
  };
}

export function getFinancialStatusLabel(status: FinancialStatus): string {
  if (status === "stable") {
    return "Mali Durum İyi";
  }

  if (status === "warning") {
    return "Mali Risk";
  }

  if (status === "debt") {
    return "Borç";
  }

  if (status === "critical") {
    return "Mali Kriz";
  }

  return "İflas";
}
