import { LudusStaff } from "../types/game";

export const initialLudusStaff: LudusStaff[] = [
  {
    id: "medicus",
    name: "Medicus",
    role: "medicus",

    level: 1,
    maxLevel: 5,
    requiredLudusLevel: 5,

    salary: 80,

    healingBonus: 5,
    trainingBonus: 0,
    securityBonus: 0,
    expenseReduction: 0,

    hired: false,
  },

  {
    id: "trainer",
    name: "Doctore",
    role: "trainer",

    level: 1,
    maxLevel: 5,
    requiredLudusLevel: 2,

    salary: 90,

    healingBonus: 0,
    trainingBonus: 1,
    securityBonus: 0,
    expenseReduction: 0,

    hired: false,
  },

  {
    id: "guard-captain",
    name: "Muhafız Kaptanı",
    role: "guard_captain",

    level: 1,
    maxLevel: 5,
    requiredLudusLevel: 6,

    salary: 75,

    healingBonus: 0,
    trainingBonus: 0,
    securityBonus: 10,
    expenseReduction: 0,

    hired: false,
  },

  {
    id: "steward",
    name: "Kâhya",
    role: "steward",

    level: 1,
    maxLevel: 5,
    requiredLudusLevel: 3,

    salary: 65,

    healingBonus: 0,
    trainingBonus: 0,
    securityBonus: 0,
    expenseReduction: 5,

    hired: false,
  },
];
