import { Gladiator } from "../../types/game";

export function clampValue(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function getArenaMoraleChange(won: boolean) {
  return won ? 6 : -8;
}

export function getInjuryMoralePenalty(gladiator: Gladiator) {
  if (gladiator.injurySeverity === "severe") {
    return -10;
  }

  if (gladiator.injurySeverity === "moderate") {
    return -5;
  }

  if (gladiator.injurySeverity === "minor") {
    return -2;
  }

  return 0;
}

export function getTrainingLoyaltyBonus() {
  return 1;
}
