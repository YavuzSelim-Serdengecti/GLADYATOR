import { Gladiator, GladiatorClass, GladiatorRarity } from "../../types/game";

import { getNamesForOrigin, gladiatorOrigins } from "../../data/gladiatorNames";

import { randomInt, randomItem } from "../../utils/random";

const gladiatorClasses: GladiatorClass[] = [
  "murmillo",
  "retiarius",
  "thraex",
  "secutor",
];

export type GladiatorProfile = "random" | "strong" | "fast" | "balanced";

interface GenerateGladiatorOptions {
  worldId: string;
  ludusId?: string;
  profile?: GladiatorProfile;
}

function clampStat(value: number) {
  return Math.max(1, Math.min(100, value));
}
function calculateAveragePower(
  strength: number,
  endurance: number,
  agility: number,
  attack: number,
  defense: number,
  courage: number,
) {
  return (strength + endurance + agility + attack + defense + courage) / 6;
}

function determineRarity(
  averagePower: number,
  potential: number,
): GladiatorRarity {
  const score = averagePower * 0.7 + potential * 0.3;

  if (score >= 78) {
    return "legendary";
  }

  if (score >= 68) {
    return "rare";
  }

  if (score >= 55) {
    return "uncommon";
  }

  return "common";
}

function calculateMarketValue(
  averagePower: number,
  potential: number,
  age: number,
  rarity: GladiatorRarity,
) {
  let value = averagePower * 6 + potential * 3;

  if (age <= 22) {
    value += 120;
  }

  if (age >= 30) {
    value -= 80;
  }

  if (rarity === "uncommon") {
    value += 100;
  }

  if (rarity === "rare") {
    value += 300;
  }

  if (rarity === "legendary") {
    value += 700;
  }

  return Math.max(100, Math.round(value));
}

export function generateGladiator({
  worldId,
  ludusId = "",
  profile = "random",
}: GenerateGladiatorOptions): Gladiator {
  const age = randomInt(18, 32);

  const origin = randomItem(gladiatorOrigins);
  const name = randomItem(getNamesForOrigin(origin));

  let strength = randomInt(35, 65);
  let endurance = randomInt(35, 65);
  let agility = randomInt(35, 65);
  let attack = randomInt(35, 65);
  let defense = randomInt(35, 65);
  let courage = randomInt(40, 75);

  // Başlangıç profilleri
  if (profile === "strong") {
    strength = randomInt(58, 72);
    endurance = randomInt(52, 68);
    agility = randomInt(35, 50);
    attack = randomInt(52, 66);
    defense = randomInt(45, 60);
  }

  if (profile === "fast") {
    strength = randomInt(38, 52);
    endurance = randomInt(42, 58);
    agility = randomInt(60, 75);
    attack = randomInt(52, 66);
    defense = randomInt(40, 55);
  }

  if (profile === "balanced") {
    strength = randomInt(48, 62);
    endurance = randomInt(48, 62);
    agility = randomInt(48, 62);
    attack = randomInt(48, 62);
    defense = randomInt(48, 62);
  }

  // Yaş etkisi
  if (age <= 22) {
    agility += randomInt(2, 5);
    endurance += randomInt(1, 3);
  }

  if (age >= 29) {
    strength += randomInt(1, 4);
    courage += randomInt(2, 5);
    agility -= randomInt(1, 4);
  }

  // Sınıf seçimi
  const gladiatorClass = randomItem(gladiatorClasses);

  // Sınıf etkileri
  if (gladiatorClass === "murmillo") {
    strength += randomInt(2, 5);
    defense += randomInt(3, 6);
    agility -= randomInt(1, 3);
  }

  if (gladiatorClass === "retiarius") {
    agility += randomInt(4, 7);
    attack += randomInt(1, 4);
    defense -= randomInt(2, 5);
  }

  if (gladiatorClass === "thraex") {
    agility += randomInt(2, 5);
    attack += randomInt(3, 6);
    endurance -= randomInt(1, 3);
  }

  if (gladiatorClass === "secutor") {
    endurance += randomInt(2, 5);
    defense += randomInt(2, 5);
  }

  const potential = randomInt(45, 95);

  const finalStrength = clampStat(strength);
  const finalEndurance = clampStat(endurance);
  const finalAgility = clampStat(agility);
  const finalAttack = clampStat(attack);
  const finalDefense = clampStat(defense);
  const finalCourage = clampStat(courage);

  const averagePower = calculateAveragePower(
    finalStrength,
    finalEndurance,
    finalAgility,
    finalAttack,
    finalDefense,
    finalCourage,
  );

  const rarity = determineRarity(averagePower, potential);

  const marketValue = calculateMarketValue(
    averagePower,
    potential,
    age,
    rarity,
  );

  const maxHp = 100;

  return {
    id: `gladiator-${Date.now()}-${Math.random()}`,

    worldId,
    ludusId,

    name,
    age,
    origin,

    class: gladiatorClass,
    status: ludusId ? "active" : "free",
    rarity,
    marketValue,

    strength: finalStrength,
    endurance: finalEndurance,
    agility: finalAgility,
    attack: finalAttack,
    defense: finalDefense,
    courage: finalCourage,

    morale: randomInt(55, 80),
    loyalty: randomInt(40, 70),

    potential,

    hp: maxHp,
    maxHp,
    fatigue: 0,

    experience: 0,
    fame: 0,

    wins: 0,
    losses: 0,
    winStreak: 0,
  };
}
