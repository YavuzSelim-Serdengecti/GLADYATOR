import {
    Gladiator,
    GladiatorAppearance,
    GladiatorClass,
    GladiatorRarity,
} from "../../types/game";

export type SpecialGladiatorDefinition = {
  id: string;

  name: string;

  origin: string;

  age: number;

  class: GladiatorClass;

  rarity: GladiatorRarity;

  appearance: GladiatorAppearance;

  strength: number;

  endurance: number;

  agility: number;

  attack: number;

  defense: number;

  courage: number;

  morale: number;

  loyalty: number;

  potential: number;

  marketValue: number;

  title: string;

  description: string;
};

export const SPECIAL_GLADIATORS: SpecialGladiatorDefinition[] = [
  {
    id: "spartacus",

    name: "Spartacus",

    origin: "Thracia",

    age: 28,

    class: "thraex",

    rarity: "legendary",

    appearance: {
      skinTone: "tan",
      faceType: "face_3",
      hairStyle: "medium",
      hairColor: "dark_brown",
      beardStyle: "short",
      scar: "left_eye",
    },

    strength: 91,

    endurance: 94,

    agility: 88,

    attack: 93,

    defense: 87,

    courage: 98,

    morale: 95,

    loyalty: 45,

    potential: 100,

    marketValue: 5000,

    title: "Trakyalı Efsane",

    description:
      "Olağanüstü cesareti, dayanıklılığı ve savaş yeteneğiyle tanınan efsanevi gladyatör.",
  },

  {
    id: "crixus",

    name: "Crixus",

    origin: "Gallia",

    age: 29,

    class: "murmillo",

    rarity: "legendary",

    appearance: {
      skinTone: "light",
      faceType: "face_5",
      hairStyle: "short",
      hairColor: "light_brown",
      beardStyle: "stubble",
      scar: "cheek",
    },

    strength: 96,

    endurance: 92,

    agility: 78,

    attack: 94,

    defense: 90,

    courage: 95,

    morale: 92,

    loyalty: 70,

    potential: 98,

    marketValue: 4700,

    title: "Gallia Şampiyonu",

    description:
      "Muazzam fiziksel gücü ve saldırgan dövüş tarzıyla rakiplerine korku salan savaşçı.",
  },

  {
    id: "gannicus",

    name: "Gannicus",

    origin: "Gallia",

    age: 30,

    class: "secutor",

    rarity: "legendary",

    appearance: {
      skinTone: "olive",
      faceType: "face_2",
      hairStyle: "long",
      hairColor: "blond",
      beardStyle: "short",
      scar: "none",
    },

    strength: 87,

    endurance: 86,

    agility: 97,

    attack: 96,

    defense: 84,

    courage: 96,

    morale: 94,

    loyalty: 60,

    potential: 100,

    marketValue: 5200,

    title: "Arena Ustası",

    description:
      "Hızı, refleksleri ve sıra dışı dövüş yeteneğiyle arenanın en tehlikeli savaşçılarından biri.",
  },
];

export function getSpecialGladiator(
  id: string,
): SpecialGladiatorDefinition | undefined {
  return SPECIAL_GLADIATORS.find((gladiator) => gladiator.id === id);
}

export function getRandomSpecialGladiator(): SpecialGladiatorDefinition | null {
  if (SPECIAL_GLADIATORS.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * SPECIAL_GLADIATORS.length);

  return SPECIAL_GLADIATORS[index];
}

export function isSpecialGladiator(name: string): boolean {
  return SPECIAL_GLADIATORS.some(
    (gladiator) =>
      gladiator.name.toLocaleLowerCase("tr-TR") ===
      name.toLocaleLowerCase("tr-TR"),
  );
}

export function createSpecialGladiator(
  specialGladiator: SpecialGladiatorDefinition,
  worldId: string,
  ludusId: string,
): Gladiator {
  return {
    id: `special-${specialGladiator.id}-${Date.now()}`,

    worldId,

    ludusId,

    name: specialGladiator.name,

    age: specialGladiator.age,

    origin: specialGladiator.origin,

    class: specialGladiator.class,

    rarity: specialGladiator.rarity,

    marketValue: specialGladiator.marketValue,

    status: "active",

    appearance: {
      ...specialGladiator.appearance,
    },

    injurySeverity: null,

    injuryDaysRemaining: 0,

    strength: specialGladiator.strength,

    endurance: specialGladiator.endurance,

    agility: specialGladiator.agility,

    attack: specialGladiator.attack,

    defense: specialGladiator.defense,

    courage: specialGladiator.courage,

    morale: specialGladiator.morale,

    loyalty: specialGladiator.loyalty,

    potential: specialGladiator.potential,

    hp: 100,

    maxHp: 100,

    fatigue: 0,

    experience: 0,

    fame: 50,

    wins: 0,

    losses: 0,

    winStreak: 0,
  };
}
