export type DailyRewardType = "denarius" | "action_points" | "fame";

export type DailyReward = {
  id: string;
  type: DailyRewardType;
  amount: number;
  label: string;
  weight: number;
};

export const dailyRewards: DailyReward[] = [
  {
    id: "denarius-100",
    type: "denarius",
    amount: 100,
    label: "100 Denarius",
    weight: 30,
  },
  {
    id: "denarius-200",
    type: "denarius",
    amount: 200,
    label: "200 Denarius",
    weight: 25,
  },
  {
    id: "denarius-350",
    type: "denarius",
    amount: 350,
    label: "350 Denarius",
    weight: 15,
  },
  {
    id: "action-1",
    type: "action_points",
    amount: 1,
    label: "+1 Aksiyon Puanı",
    weight: 15,
  },
  {
    id: "fame-10",
    type: "fame",
    amount: 10,
    label: "+10 Şöhret",
    weight: 10,
  },
  {
    id: "denarius-750",
    type: "denarius",
    amount: 750,
    label: "750 Denarius",
    weight: 5,
  },
];

export function getRandomDailyReward(): DailyReward {
  const totalWeight = dailyRewards.reduce(
    (total, reward) => total + reward.weight,
    0,
  );

  let random = Math.random() * totalWeight;

  for (const reward of dailyRewards) {
    random -= reward.weight;

    if (random < 0) {
      return reward;
    }
  }

  return dailyRewards[0];
}

export function getTodayDateKey(): string {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
