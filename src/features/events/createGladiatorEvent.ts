import { GameEvent, Gladiator } from "../../types/game";

interface CreateGladiatorEventOptions {
  gladiator: Gladiator;
  currentDay: number;
  rebellionRisk: number;
}

export function createGladiatorEvent({
  gladiator,
  currentDay,
  rebellionRisk,
}: CreateGladiatorEventOptions): GameEvent | null {
  if (rebellionRisk <= 0) {
    return null;
  }

  const roll = Math.random() * 100;

  if (roll >= rebellionRisk) {
    return null;
  }

  /*
    Çok düşük sadakat + yüksek risk:
    doğrudan ciddi olay çıkabilir.
  */

  if (gladiator.loyalty < 15 && rebellionRisk >= 60) {
    return {
      id: `event-rebellion-${gladiator.id}-${Date.now()}`,

      type: "rebellion",

      gladiatorId: gladiator.id,

      title: "İSYAN TEHLİKESİ",

      description: `${gladiator.name}, Ludus'a karşı açıkça başkaldırmaya hazırlanıyor.`,

      status: "pending",

      createdDay: currentDay,
    };
  }

  if (gladiator.loyalty < 25 && rebellionRisk >= 45) {
    return {
      id: `event-escape-${gladiator.id}-${Date.now()}`,

      type: "escape_attempt",

      gladiatorId: gladiator.id,

      title: "KAÇIŞ GİRİŞİMİ",

      description: `${gladiator.name}, Ludus'tan kaçmanın yollarını arıyor.`,

      status: "pending",

      createdDay: currentDay,
    };
  }

  return {
    id: `event-freedom-${gladiator.id}-${Date.now()}`,

    type: "freedom_request",

    gladiatorId: gladiator.id,

    title: "ÖZGÜRLÜK TALEBİ",

    description: `${gladiator.name}, verdiği hizmetlerin karşılığında özgürlüğünü talep ediyor.`,

    status: "pending",

    createdDay: currentDay,
  };
}
