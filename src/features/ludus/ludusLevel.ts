export const LUDUS_LEVEL_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 900,
  6: 1400,
  7: 2100,
  8: 3000,
  9: 4200,
  10: 5600,
};

export const MAX_LUDUS_LEVEL = 10;

/*
  LUDUS PRESTİJ KAZANIMLARI

  Oyuncu sadece Arena'dan değil,
  Ludus yönetimiyle de seviye ilerlemesi kazanır.
*/
export const LUDUS_PRESTIGE_REWARDS = {
  arenaWin: 30,
  gladiatorPurchase: 15,
  buildingBuilt: 25,
  buildingUpgrade: 10,
  training: 3,
  equipmentPurchase: 5,
  staffHire: 15,
  workerHire: 3,
} as const;

export function calculateLudusLevel(prestige: number): number {
  let level = 1;

  for (let currentLevel = 2; currentLevel <= MAX_LUDUS_LEVEL; currentLevel++) {
    const requiredPrestige = LUDUS_LEVEL_REQUIREMENTS[currentLevel];

    if (prestige >= requiredPrestige) {
      level = currentLevel;
    } else {
      break;
    }
  }

  return level;
}

export function getNextLevelRequirement(currentLevel: number): number | null {
  if (currentLevel >= MAX_LUDUS_LEVEL) {
    return null;
  }

  return LUDUS_LEVEL_REQUIREMENTS[currentLevel + 1] ?? null;
}

export function getCurrentLevelRequirement(currentLevel: number): number {
  return LUDUS_LEVEL_REQUIREMENTS[currentLevel] ?? 0;
}

export function getPrestigeToNextLevel(
  prestige: number,
  currentLevel: number,
): number {
  const nextRequirement = getNextLevelRequirement(currentLevel);

  if (nextRequirement === null) {
    return 0;
  }

  return Math.max(0, nextRequirement - prestige);
}

export function getLudusLevelProgress(
  prestige: number,
  currentLevel: number,
): number {
  if (currentLevel >= MAX_LUDUS_LEVEL) {
    return 100;
  }

  const currentRequirement = getCurrentLevelRequirement(currentLevel);

  const nextRequirement = getNextLevelRequirement(currentLevel);

  if (nextRequirement === null) {
    return 100;
  }

  const requiredBetweenLevels = nextRequirement - currentRequirement;

  if (requiredBetweenLevels <= 0) {
    return 100;
  }

  const earnedThisLevel = prestige - currentRequirement;

  const progress = (earnedThisLevel / requiredBetweenLevels) * 100;

  return Math.max(0, Math.min(100, progress));
}

export function isMaxLudusLevel(currentLevel: number): boolean {
  return currentLevel >= MAX_LUDUS_LEVEL;
}

/*
  ENDGAME / HANEDAN SİSTEMİ
*/

export type DynastyRank =
  | "Yükselen Hanedan"
  | "Roma Hanedanı"
  | "Soylu Hanedan"
  | "Büyük Hanedan"
  | "Efsanevi Hanedan"
  | "Roma'nın Efendisi";

export type DynastyRankInfo = {
  rank: DynastyRank;
  rankNumber: number;
  currentRequirement: number;
  nextRequirement: number | null;
};

export const DYNASTY_RANK_REQUIREMENTS: {
  rank: DynastyRank;
  prestige: number;
}[] = [
  {
    rank: "Yükselen Hanedan",
    prestige: 5600,
  },
  {
    rank: "Roma Hanedanı",
    prestige: 7500,
  },
  {
    rank: "Soylu Hanedan",
    prestige: 10000,
  },
  {
    rank: "Büyük Hanedan",
    prestige: 14000,
  },
  {
    rank: "Efsanevi Hanedan",
    prestige: 20000,
  },
  {
    rank: "Roma'nın Efendisi",
    prestige: 30000,
  },
];

export function getDynastyRank(prestige: number): DynastyRankInfo | null {
  const minimumPrestige = LUDUS_LEVEL_REQUIREMENTS[MAX_LUDUS_LEVEL];

  if (prestige < minimumPrestige) {
    return null;
  }

  let currentIndex = 0;

  for (let index = 0; index < DYNASTY_RANK_REQUIREMENTS.length; index++) {
    const requirement = DYNASTY_RANK_REQUIREMENTS[index];

    if (prestige >= requirement.prestige) {
      currentIndex = index;
    } else {
      break;
    }
  }

  const current = DYNASTY_RANK_REQUIREMENTS[currentIndex];

  const next = DYNASTY_RANK_REQUIREMENTS[currentIndex + 1];

  return {
    rank: current.rank,
    rankNumber: currentIndex + 1,
    currentRequirement: current.prestige,
    nextRequirement: next?.prestige ?? null,
  };
}

export function getDynastyRankProgress(prestige: number): number {
  const rankInfo = getDynastyRank(prestige);

  if (!rankInfo) {
    return 0;
  }

  if (rankInfo.nextRequirement === null) {
    return 100;
  }

  const requiredBetweenRanks =
    rankInfo.nextRequirement - rankInfo.currentRequirement;

  const earnedInCurrentRank = prestige - rankInfo.currentRequirement;

  const progress = (earnedInCurrentRank / requiredBetweenRanks) * 100;

  return Math.max(0, Math.min(100, progress));
}

export function getPrestigeToNextDynastyRank(prestige: number): number {
  const rankInfo = getDynastyRank(prestige);

  if (!rankInfo) {
    const minimumPrestige = LUDUS_LEVEL_REQUIREMENTS[MAX_LUDUS_LEVEL];

    return Math.max(0, minimumPrestige - prestige);
  }

  if (rankInfo.nextRequirement === null) {
    return 0;
  }

  return Math.max(0, rankInfo.nextRequirement - prestige);
}

export function isEndgameUnlocked(prestige: number): boolean {
  return prestige >= LUDUS_LEVEL_REQUIREMENTS[MAX_LUDUS_LEVEL];
}

/*
  MİRAS SİSTEMİ

  Roma'nın Efendisi derecesine ulaştıktan
  sonra ilerleme burada sonsuza kadar
  devam eder.
*/

export const LEGACY_START_PRESTIGE = 30000;

export const LEGACY_PRESTIGE_PER_LEVEL = 5000;

export type LegacyInfo = {
  unlocked: boolean;
  level: number;
  currentRequirement: number;
  nextRequirement: number;
  progress: number;
  prestigeToNextLevel: number;
};

export function isLegacyUnlocked(prestige: number): boolean {
  return prestige >= LEGACY_START_PRESTIGE;
}

export function getLegacyLevel(prestige: number): number {
  if (!isLegacyUnlocked(prestige)) {
    return 0;
  }

  return (
    Math.floor((prestige - LEGACY_START_PRESTIGE) / LEGACY_PRESTIGE_PER_LEVEL) +
    1
  );
}

export function getLegacyCurrentRequirement(prestige: number): number {
  const level = getLegacyLevel(prestige);

  if (level <= 0) {
    return LEGACY_START_PRESTIGE;
  }

  return LEGACY_START_PRESTIGE + (level - 1) * LEGACY_PRESTIGE_PER_LEVEL;
}

export function getLegacyNextRequirement(prestige: number): number {
  const level = getLegacyLevel(prestige);

  if (level <= 0) {
    return LEGACY_START_PRESTIGE;
  }

  return LEGACY_START_PRESTIGE + level * LEGACY_PRESTIGE_PER_LEVEL;
}

export function getLegacyProgress(prestige: number): number {
  if (!isLegacyUnlocked(prestige)) {
    return 0;
  }

  const currentRequirement = getLegacyCurrentRequirement(prestige);

  const earned = prestige - currentRequirement;

  const progress = (earned / LEGACY_PRESTIGE_PER_LEVEL) * 100;

  return Math.max(0, Math.min(100, progress));
}

export function getPrestigeToNextLegacyLevel(prestige: number): number {
  if (!isLegacyUnlocked(prestige)) {
    return Math.max(0, LEGACY_START_PRESTIGE - prestige);
  }

  const nextRequirement = getLegacyNextRequirement(prestige);

  return Math.max(0, nextRequirement - prestige);
}

export function getLegacyInfo(prestige: number): LegacyInfo {
  const unlocked = isLegacyUnlocked(prestige);

  if (!unlocked) {
    return {
      unlocked: false,
      level: 0,
      currentRequirement: LEGACY_START_PRESTIGE,
      nextRequirement: LEGACY_START_PRESTIGE,
      progress: 0,
      prestigeToNextLevel: Math.max(0, LEGACY_START_PRESTIGE - prestige),
    };
  }

  return {
    unlocked: true,
    level: getLegacyLevel(prestige),
    currentRequirement: getLegacyCurrentRequirement(prestige),
    nextRequirement: getLegacyNextRequirement(prestige),
    progress: getLegacyProgress(prestige),
    prestigeToNextLevel: getPrestigeToNextLegacyLevel(prestige),
  };
}
