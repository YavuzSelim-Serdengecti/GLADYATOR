export type GameFeature =
  | "ludus"
  | "arena"
  | "market"
  | "rivals"
  | "daily_reward"
  | "blacksmith"
  | "tavern"
  | "infirmary"
  | "mine"
  | "gambling_house";

export type FeatureUnlock = {
  feature: GameFeature;
  name: string;
  requiredLevel: number;
  description: string;
};

export const FEATURE_UNLOCKS: Record<GameFeature, FeatureUnlock> = {
  ludus: {
    feature: "ludus",
    name: "Ludus",
    requiredLevel: 1,
    description: "Ludus yönetim ekranına erişim.",
  },

  arena: {
    feature: "arena",
    name: "Arena",
    requiredLevel: 1,
    description: "Gladyatörlerini arenada savaştır.",
  },

  market: {
    feature: "market",
    name: "Gladyatör Pazarı",
    requiredLevel: 1,
    description: "Yeni gladyatörler satın al.",
  },

  rivals: {
    feature: "rivals",
    name: "Rakip Luduslar",
    requiredLevel: 1,
    description: "Roma'daki rakip Ludusları incele.",
  },

  daily_reward: {
    feature: "daily_reward",
    name: "Günlük Çark",
    requiredLevel: 1,
    description: "Her gerçek gün ücretsiz ödül kazan.",
  },

  blacksmith: {
    feature: "blacksmith",
    name: "Demirci",
    requiredLevel: 4,
    description: "Silah ve zırh sistemine eriş.",
  },

  tavern: {
    feature: "tavern",
    name: "Taverna",
    requiredLevel: 4,
    description: "Roma'nın olayları ve söylentileriyle karşılaş.",
  },

  infirmary: {
    feature: "infirmary",
    name: "Revir",
    requiredLevel: 3,
    description: "Yaralı gladyatörlerin tedavi imkânlarını geliştir.",
  },

  mine: {
    feature: "mine",
    name: "Maden",
    requiredLevel: 7,
    description: "Pasif gelir sağlayan maden sistemine eriş.",
  },

  gambling_house: {
    feature: "gambling_house",
    name: "Oyun Evi",
    requiredLevel: 8,
    description: "Zar ve diğer şans oyunlarına eriş.",
  },
};

export function getFeatureUnlock(feature: GameFeature): FeatureUnlock {
  return FEATURE_UNLOCKS[feature];
}

export function getFeatureRequiredLevel(feature: GameFeature): number {
  return FEATURE_UNLOCKS[feature].requiredLevel;
}

export function isFeatureUnlocked(
  feature: GameFeature,
  ludusLevel: number,
): boolean {
  return ludusLevel >= FEATURE_UNLOCKS[feature].requiredLevel;
}

export function getUnlockedFeatures(ludusLevel: number): FeatureUnlock[] {
  return Object.values(FEATURE_UNLOCKS).filter(
    (unlock) => ludusLevel >= unlock.requiredLevel,
  );
}

export function getLockedFeatures(ludusLevel: number): FeatureUnlock[] {
  return Object.values(FEATURE_UNLOCKS).filter(
    (unlock) => ludusLevel < unlock.requiredLevel,
  );
}

export function getNextFeatureUnlocks(ludusLevel: number): FeatureUnlock[] {
  const locked = getLockedFeatures(ludusLevel);

  if (locked.length === 0) {
    return [];
  }

  const nextLevel = Math.min(...locked.map((unlock) => unlock.requiredLevel));

  return locked.filter((unlock) => unlock.requiredLevel === nextLevel);
}
