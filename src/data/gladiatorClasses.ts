import { GladiatorClass } from "../types/game";

export interface GladiatorClassDefinition {
  id: GladiatorClass;

  name: string;

  description: string;

  strengths: string[];
  weaknesses: string[];

  attackMultiplier: number;
  defenseMultiplier: number;

  staminaAttackCostModifier: number;

  dodgeBonus: number;
}

export const gladiatorClassDefinitions: Record<
  GladiatorClass,
  GladiatorClassDefinition
> = {
  murmillo: {
    id: "murmillo",

    name: "Murmillo",

    description: "Ağır zırhlı, dayanıklı ve savunma odaklı gladyatör.",

    strengths: [
      "Yüksek savunma",
      "Yüksek dayanıklılık",
      "Uzun dövüşlerde güçlü",
    ],

    weaknesses: ["Düşük hareket kabiliyeti", "Yüksek stamina tüketimi"],

    attackMultiplier: 1,

    defenseMultiplier: 1.15,

    staminaAttackCostModifier: 2,

    dodgeBonus: -0.03,
  },

  retiarius: {
    id: "retiarius",

    name: "Retiarius",

    description: "Hız ve çevikliğe dayanan, hafif ekipmanlı gladyatör.",

    strengths: [
      "Yüksek çeviklik",
      "Daha yüksek kaçınma",
      "Düşük stamina maliyeti",
    ],

    weaknesses: ["Düşük savunma", "Ağır darbelerde kırılgan"],

    attackMultiplier: 1.05,

    defenseMultiplier: 0.9,

    staminaAttackCostModifier: -2,

    dodgeBonus: 0.08,
  },

  thraex: {
    id: "thraex",

    name: "Thraex",

    description: "Agresif ve saldırı gücü yüksek dengeli savaşçı.",

    strengths: ["Yüksek saldırı", "İyi çeviklik", "Hızlı baskı kurar"],

    weaknesses: ["Orta seviye dayanıklılık", "Uzayan dövüşlerde zorlanabilir"],

    attackMultiplier: 1.12,

    defenseMultiplier: 0.95,

    staminaAttackCostModifier: 1,

    dodgeBonus: 0.03,
  },

  secutor: {
    id: "secutor",

    name: "Secutor",

    description: "Dengeli savunma ve dayanıklılığa sahip takipçi sınıfı.",

    strengths: [
      "Dengeli savunma",
      "İyi dayanıklılık",
      "İstikrarlı dövüş performansı",
    ],

    weaknesses: ["Belirgin bir saldırı üstünlüğü yok"],

    attackMultiplier: 1.02,

    defenseMultiplier: 1.08,

    staminaAttackCostModifier: 0,

    dodgeBonus: 0,
  },
};
