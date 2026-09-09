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
export type ArenaDifficulty = "easy" | "normal" | "hard" | "elite";
export type MatchResult = "player_win" | "enemy_win";
export type GladiatorSkinTone = "light" | "olive" | "tan" | "brown" | "dark";
export type GladiatorFaceType =
  | "face_1"
  | "face_2"
  | "face_3"
  | "face_4"
  | "face_5"
  | "face_6";
export type GladiatorHairStyle =
  | "bald"
  | "short"
  | "medium"
  | "long"
  | "curly"
  | "shaved";
export type GladiatorHairColor =
  | "black"
  | "dark_brown"
  | "brown"
  | "light_brown"
  | "blond"
  | "red"
  | "gray";
export type GladiatorBeardStyle =
  | "none"
  | "stubble"
  | "short"
  | "full"
  | "long"
  | "goatee";
export type GladiatorScar =
  | "none"
  | "left_eye"
  | "right_eye"
  | "cheek"
  | "forehead"
  | "jaw";

export interface GladiatorAppearance {
  skinTone: GladiatorSkinTone;
  faceType: GladiatorFaceType;
  hairStyle: GladiatorHairStyle;
  hairColor: GladiatorHairColor;
  beardStyle: GladiatorBeardStyle;
  scar: GladiatorScar;
}

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
  appearance: GladiatorAppearance;
  injurySeverity: InjurySeverity | null;
  injuryDaysRemaining: number;
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

export interface Arena {
  id: string;
  name: string;
  requiredLudusLevel: number;
  difficulty: ArenaDifficulty;
  recommendedPowerMin: number;
  recommendedPowerMax: number;
  rewardMin: number;
  rewardMax: number;
  fameReward: number;
  deathRisk: number;
}

export interface ArenaMatch {
  id: string;
  arenaId: string;
  playerGladiator: Gladiator;
  enemyGladiator: Gladiator;
  result: MatchResult;
  playerRemainingHp: number;
  enemyRemainingHp: number;
  denariusReward: number;
  fameReward: number;
  experienceReward: number;
}

export type LudusBuildingType =
  | "training_ground"
  | "infirmary"
  | "armory"
  | "barracks"
  | "slave_quarters";

export type BuildingConstructionType = "build" | "upgrade";

export interface LudusBuilding {
  id: string;
  type: LudusBuildingType;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  requiredLudusLevel: number;
  buildCost: number;
  upgradeCost: number;
  buildDays: number;
  upgradeDays: number;
  isBuilt: boolean;
  constructionType: BuildingConstructionType | null;
  constructionDaysRemaining: number;
  constructionTargetLevel: number | null;
}

export type EquipmentType = "weapon" | "armor";
export type EquipmentRarity = "common" | "uncommon" | "rare" | "legendary";

export interface EquipmentBonuses {
  strength?: number;
  endurance?: number;
  agility?: number;
  attack?: number;
  defense?: number;
  courage?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: EquipmentRarity;
  price: number;
  bonuses: EquipmentBonuses;
  description: string;
  equippedByGladiatorId?: string | null;
}

export type InjurySeverity = "minor" | "moderate" | "severe";

export type LudusStaffRole =
  | "medicus"
  | "trainer"
  | "guard_captain"
  | "steward";

export interface LudusStaff {
  id: string;
  name: string;
  role: LudusStaffRole;
  level: number;
  maxLevel: number;
  requiredLudusLevel: number;
  salary: number;
  healingBonus: number;
  trainingBonus: number;
  securityBonus: number;
  expenseReduction: number;
  hired: boolean;
}

export type WorkerRole = "builder" | "miner" | "general";

export interface LudusWorker {
  id: string;
  role: WorkerRole;
  name: string;
  description: string;
  count: number;
  maxCount: number;
  requiredLudusLevel: number;
  hiringCost: number;
  dailySalary: number;
  efficiency: number;
}

export type GameEventType = "freedom_request" | "escape_attempt" | "rebellion";
export type GameEventStatus = "pending" | "resolved";

export interface GameEvent {
  id: string;
  type: GameEventType;
  gladiatorId: string;
  title: string;
  description: string;
  status: GameEventStatus;
  createdDay: number;
  resolution?: GameEventDecision | null;
}

export type GameEventDecision =
  | "grant_freedom"
  | "deny_freedom"
  | "forgive_escape"
  | "punish_escape"
  | "suppress_rebellion"
  | "release_rebel";

export interface TwentyOneGameState {
  active: boolean;
  playerScore: number;
  houseScore: number;
  bet: number;
  finished: boolean;
  result: "win" | "lose" | "draw" | null;
}

export type AchievementRequirementType =
  | "arena_wins"
  | "gladiators_owned"
  | "trainings_completed"
  | "buildings_built"
  | "staff_hired"
  | "workers_hired"
  | "special_gladiators_owned"
  | "ludus_level"
  | "prestige"
  | "fame"
  | "denarius";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  requirementType: AchievementRequirementType;
  target: number;
  prestigeReward: number;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface GameStatistics {
  arenaWins: number;
  gladiatorsPurchased: number;
  trainingsCompleted: number;
  buildingsBuilt: number;
  staffHired: number;
  workersHired: number;
}
