import {
    getDynastyRank,
    getLegacyLevel,
    isEndgameUnlocked,
} from "../ludus/ludusLevel";

export type EndgameScaling = {
  active: boolean;

  dynastyRank: number;

  legacyLevel: number;

  scalingTier: number;

  opponentStatBonus: number;

  opponentValueMultiplier: number;

  denariusRewardMultiplier: number;

  fameRewardMultiplier: number;

  prestigeRewardMultiplier: number;
};

const NORMAL_GAME_SCALING: EndgameScaling = {
  active: false,

  dynastyRank: 0,

  legacyLevel: 0,

  scalingTier: 0,

  opponentStatBonus: 0,

  opponentValueMultiplier: 1,

  denariusRewardMultiplier: 1,

  fameRewardMultiplier: 1,

  prestigeRewardMultiplier: 1,
};

export function getEndgameScaling(prestige: number): EndgameScaling {
  if (!isEndgameUnlocked(prestige)) {
    return NORMAL_GAME_SCALING;
  }

  const dynasty = getDynastyRank(prestige);

  if (!dynasty) {
    return NORMAL_GAME_SCALING;
  }

  const legacyLevel = getLegacyLevel(prestige);

  /*
    İlk 6 kademe Hanedan dereceleridir.

    30.000 Prestij'den sonra Miras
    sistemi devreye girer.

    Böylece zorluk ve ödül sistemi
    sonsuza kadar büyümeye devam eder.
  */

  const dynastyTier = dynasty.rankNumber;

  const legacyBonusTier = legacyLevel > 0 ? legacyLevel - 1 : 0;

  const scalingTier = dynastyTier + legacyBonusTier;

  /*
    Stat bonusunu sınırsız artırırsak
    rakipler kısa sürede 100 stat
    sınırına takılır.

    Bu yüzden stat bonusu maksimum
    +30'a kadar çıkar.

    Daha sonraki Miras seviyelerinde
    ekonomi ve ödül çarpanları büyümeye
    devam eder.
  */

  const opponentStatBonus = Math.min(30, scalingTier * 3);

  const opponentValueMultiplier = 1 + scalingTier * 0.08;

  const denariusRewardMultiplier = 1 + scalingTier * 0.12;

  const fameRewardMultiplier = 1 + scalingTier * 0.1;

  const prestigeRewardMultiplier = 1 + scalingTier * 0.08;

  return {
    active: true,

    dynastyRank: dynasty.rankNumber,

    legacyLevel,

    scalingTier,

    opponentStatBonus,

    opponentValueMultiplier,

    denariusRewardMultiplier,

    fameRewardMultiplier,

    prestigeRewardMultiplier,
  };
}

export function applyEndgameRewardMultiplier(
  value: number,
  multiplier: number,
): number {
  return Math.max(0, Math.round(value * multiplier));
}

export function applyEndgameStatBonus(value: number, bonus: number): number {
  return Math.max(1, Math.min(100, value + bonus));
}
