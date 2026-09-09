import { LudusWorker } from "../types/game";

export const initialLudusWorkers: LudusWorker[] = [
  {
    id: "general-workers",

    role: "general",

    name: "Genel İşçiler",

    description: "Ludus'un günlük işlerinde ve bakımında görev alırlar.",

    count: 0,
    maxCount: 12,

    requiredLudusLevel: 1,

    hiringCost: 80,

    dailySalary: 10,

    efficiency: 1,
  },

  {
    id: "builders",

    role: "builder",

    name: "İnşaat İşçileri",

    description:
      "Ludus binalarının inşa ve geliştirme süreçlerinde çalışırlar.",

    count: 0,
    maxCount: 10,

    requiredLudusLevel: 2,

    hiringCost: 100,

    dailySalary: 12,

    efficiency: 1,
  },

  {
    id: "miners",

    role: "miner",

    name: "Maden İşçileri",

    description: "Madenlerde çalışarak Ludus için pasif gelir sağlarlar.",

    count: 0,
    maxCount: 15,

    requiredLudusLevel: 7,

    hiringCost: 120,

    dailySalary: 14,

    efficiency: 1,
  },
];
