import { AchievementProgress } from "../../types/game";

import { ACHIEVEMENTS } from "./achievements";

export function createAchievementProgress(): AchievementProgress[] {
  return ACHIEVEMENTS.map((achievement) => ({
    achievementId: achievement.id,

    progress: 0,

    completed: false,

    claimed: false,
  }));
}
