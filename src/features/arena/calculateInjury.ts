import { Gladiator, InjurySeverity } from "../../types/game";

export interface InjuryResult {
  injured: boolean;
  severity: InjurySeverity | null;
  recoveryDays: number;
}

interface CalculateInjuryOptions {
  gladiator: Gladiator;
  remainingHp: number;
  won: boolean;
}

export function calculateInjury({
  gladiator,
  remainingHp,
  won,
}: CalculateInjuryOptions): InjuryResult {
  const hpPercent = remainingHp / gladiator.maxHp;

  let injuryChance = 0;

  if (hpPercent <= 0) {
    injuryChance = 0.8;
  } else if (hpPercent <= 0.15) {
    injuryChance = 0.55;
  } else if (hpPercent <= 0.3) {
    injuryChance = 0.35;
  } else if (hpPercent <= 0.5) {
    injuryChance = 0.15;
  } else {
    injuryChance = 0.03;
  }

  if (!won) {
    injuryChance += 0.08;
  }

  // Dayanıklı gladyatörler biraz daha zor yaralanır.
  injuryChance -= gladiator.endurance / 1000;

  injuryChance = Math.max(0, Math.min(0.9, injuryChance));

  const injured = Math.random() < injuryChance;

  if (!injured) {
    return {
      injured: false,
      severity: null,
      recoveryDays: 0,
    };
  }

  /*
    HP ne kadar düşükse ağır yaralanma
    ihtimali o kadar yüksek.
  */

  const roll = Math.random();

  let severity: InjurySeverity;

  if (hpPercent <= 0.1) {
    if (roll < 0.45) {
      severity = "severe";
    } else if (roll < 0.8) {
      severity = "moderate";
    } else {
      severity = "minor";
    }
  } else if (hpPercent <= 0.3) {
    if (roll < 0.2) {
      severity = "severe";
    } else if (roll < 0.65) {
      severity = "moderate";
    } else {
      severity = "minor";
    }
  } else {
    if (roll < 0.12) {
      severity = "severe";
    } else if (roll < 0.4) {
      severity = "moderate";
    } else {
      severity = "minor";
    }
  }

  const recoveryDays =
    severity === "minor" ? 1 : severity === "moderate" ? 3 : 6;

  return {
    injured: true,
    severity,
    recoveryDays,
  };
}
