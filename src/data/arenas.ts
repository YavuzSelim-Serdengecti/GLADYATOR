import { Arena } from "../types/game";

export const arenas: Arena[] = [
  {
    id: "capua-small",

    name: "Capua Küçük Arena",

    requiredLudusLevel: 1,

    difficulty: "easy",

    recommendedPowerMin: 35,
    recommendedPowerMax: 50,

    rewardMin: 120,
    rewardMax: 200,

    fameReward: 15,

    deathRisk: 0.01,
  },

  {
    id: "capua-main",

    name: "Capua Arena",

    requiredLudusLevel: 6,

    difficulty: "normal",

    recommendedPowerMin: 50,
    recommendedPowerMax: 65,

    rewardMin: 250,
    rewardMax: 400,

    fameReward: 30,

    deathRisk: 0.03,
  },

  {
    id: "roman-provincial",

    name: "Roma Eyalet Arenası",

    requiredLudusLevel: 13,

    difficulty: "hard",

    recommendedPowerMin: 65,
    recommendedPowerMax: 80,

    rewardMin: 500,
    rewardMax: 850,

    fameReward: 60,

    deathRisk: 0.06,
  },

  {
    id: "roman-grand",

    name: "Roma Büyük Arenası",

    requiredLudusLevel: 18,

    difficulty: "elite",

    recommendedPowerMin: 80,
    recommendedPowerMax: 95,

    rewardMin: 1000,
    rewardMax: 1800,

    fameReward: 120,

    deathRisk: 0.1,
  },
];
