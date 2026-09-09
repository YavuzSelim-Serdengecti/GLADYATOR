import { Gladiator } from "../../types/game";

interface CalculateDeathOptions {
  gladiator: Gladiator;
  remainingHp: number;
  arenaDeathRisk: number;
}

export function calculateDeath({
  gladiator,
  remainingHp,
  arenaDeathRisk,
}: CalculateDeathOptions): boolean {
  // HP 0'ın üstündeyse ölüm yok.
  if (remainingHp > 0) {
    return false;
  }

  let deathChance = arenaDeathRisk;

  // Dövüşte tamamen düşmek riski artırır.
  deathChance += 0.12;

  // Dayanıklılık hayatta kalma şansını artırır.
  deathChance -= gladiator.endurance / 1500;

  // Cesaret küçük bir ek avantaj sağlar.
  deathChance -= gladiator.courage / 3000;

  deathChance = Math.max(0.02, Math.min(0.5, deathChance));

  return Math.random() < deathChance;
}
