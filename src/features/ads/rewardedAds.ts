export type RewardedAdRewardType = "action_point" | "denarius";

export type RewardedAdReward = {
  id: string;

  type: RewardedAdRewardType;

  title: string;

  description: string;

  amount: number;

  dailyLimit: number;
};

export type RewardedAdUsage = {
  actionPointAdsWatched: number;

  denariusAdsWatched: number;
};

export const REWARDED_AD_REWARDS: RewardedAdReward[] = [
  {
    id: "action_point_reward",

    type: "action_point",

    title: "+1 AKSİYON",

    description: "Ödüllü reklam izleyerek 1 ek aksiyon hakkı kazan.",

    amount: 1,

    dailyLimit: 2,
  },

  {
    id: "denarius_reward",

    type: "denarius",

    title: "+150 DENARIUS",

    description: "Ödüllü reklam izleyerek Ludus kasasına 150 Denarius ekle.",

    amount: 150,

    dailyLimit: 3,
  },
];

export function createInitialRewardedAdUsage(): RewardedAdUsage {
  return {
    actionPointAdsWatched: 0,

    denariusAdsWatched: 0,
  };
}

export function getRewardedAdReward(
  type: RewardedAdRewardType,
): RewardedAdReward {
  const reward = REWARDED_AD_REWARDS.find((item) => item.type === type);

  if (!reward) {
    throw new Error(`Rewarded ad reward bulunamadı: ${type}`);
  }

  return reward;
}

export function getRewardedAdWatchCount(
  usage: RewardedAdUsage,
  type: RewardedAdRewardType,
): number {
  if (type === "action_point") {
    return usage.actionPointAdsWatched;
  }

  return usage.denariusAdsWatched;
}

export function canWatchRewardedAd(
  usage: RewardedAdUsage,
  type: RewardedAdRewardType,
): boolean {
  const reward = getRewardedAdReward(type);

  const watched = getRewardedAdWatchCount(usage, type);

  return watched < reward.dailyLimit;
}

export function getRewardedAdRemainingCount(
  usage: RewardedAdUsage,
  type: RewardedAdRewardType,
): number {
  const reward = getRewardedAdReward(type);

  const watched = getRewardedAdWatchCount(usage, type);

  return Math.max(0, reward.dailyLimit - watched);
}

export function registerRewardedAdWatch(
  usage: RewardedAdUsage,
  type: RewardedAdRewardType,
): RewardedAdUsage {
  if (!canWatchRewardedAd(usage, type)) {
    return usage;
  }

  if (type === "action_point") {
    return {
      ...usage,

      actionPointAdsWatched: usage.actionPointAdsWatched + 1,
    };
  }

  return {
    ...usage,

    denariusAdsWatched: usage.denariusAdsWatched + 1,
  };
}

export function resetRewardedAdUsage(): RewardedAdUsage {
  return createInitialRewardedAdUsage();
}
