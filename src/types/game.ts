export type ControllerType = "player" | "ai";

export type AIPersonality =
  | "warrior"
  | "merchant"
  | "builder"
  | "risky"
  | "balanced";

export type GladiatorClass = "murmillo" | "retiarius" | "thraex" | "secutor";

export type GladiatorStatus =
  | "active"
  | "injured"
  | "auction"
  | "free"
  | "retired"
  | "dead";

export type GladiatorRarity = "common" | "uncommon" | "rare" | "legendary";

export interface World {
  id: string;
  name: string;

  currentDay: number;
  currentSeason: number;
  currentYear: number;
}

export interface Ludus {
  id: string;
  worldId: string;

  name: string;
  lanistaName: string;

  controllerType: ControllerType;

  aiPersonality?: AIPersonality;

  level: number;

  denarius: number;
  fame: number;
  prestige: number;

  actionPoints: number;
  maxActionPoints: number;

  order: number;
}

export interface Gladiator {
  id: string;
  worldId: string;
  ludusId: string;

  name: string;
  age: number;
  origin: string;

  class: GladiatorClass;
  rarity: GladiatorRarity;

  marketValue: number;

  status: GladiatorStatus;

  strength: number;
  endurance: number;
  agility: number;
  attack: number;
  defense: number;
  courage: number;

  morale: number;
  loyalty: number;

  potential: number;

  hp: number;
  maxHp: number;

  fatigue: number;

  experience: number;
  fame: number;

  wins: number;
  losses: number;
  winStreak: number;
}

export interface Auction {
  id: string;

  gladiator: Gladiator;

  currentBid: number;

  currentBidder: "player" | "ai-1" | "ai-2" | "ai-3" | "ai-4" | null;

  minNextBid: number;

  isFinished: boolean;
}
