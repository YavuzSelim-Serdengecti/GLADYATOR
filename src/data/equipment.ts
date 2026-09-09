import { EquipmentItem } from "../types/game";

export const initialEquipment: EquipmentItem[] = [
  {
    id: "basic-sword",

    name: "Roma Kılıcı",

    type: "weapon",

    rarity: "common",

    price: 180,

    bonuses: {
      attack: 4,
      strength: 2,
    },

    description: "Basit ama güvenilir bir Roma kılıcı.",

    equippedByGladiatorId: null,
  },

  {
    id: "light-spear",

    name: "Hafif Mızrak",

    type: "weapon",

    rarity: "common",

    price: 200,

    bonuses: {
      attack: 3,
      agility: 3,
    },

    description: "Hızlı gladyatörler için dengeli bir silah.",

    equippedByGladiatorId: null,
  },

  {
    id: "heavy-sword",

    name: "Ağır Gladius",

    type: "weapon",

    rarity: "uncommon",

    price: 350,

    bonuses: {
      attack: 6,
      strength: 4,
      agility: -1,
    },

    description:
      "Yüksek hasar sağlar ancak hareket kabiliyetini biraz azaltır.",

    equippedByGladiatorId: null,
  },

  {
    id: "leather-armor",

    name: "Deri Zırh",

    type: "armor",

    rarity: "common",

    price: 220,

    bonuses: {
      defense: 4,
      agility: 1,
    },

    description: "Hafif ve hareket kabiliyetini koruyan temel zırh.",

    equippedByGladiatorId: null,
  },

  {
    id: "iron-armor",

    name: "Demir Zırh",

    type: "armor",

    rarity: "uncommon",

    price: 400,

    bonuses: {
      defense: 7,
      endurance: 3,
      agility: -2,
    },

    description: "Daha fazla koruma sağlar ancak gladyatörü yavaşlatır.",

    equippedByGladiatorId: null,
  },
];
