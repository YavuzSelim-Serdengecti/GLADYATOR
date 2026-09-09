import {
    AchievementProgress,
    GameStatistics,
    Gladiator,
    Ludus,
    LudusBuilding,
    LudusStaff,
    LudusWorker,
} from "../../types/game";

import { ACHIEVEMENTS } from "./achievements";

type AchievementSnapshot = {
  playerLudus: Ludus | null;
  gladiators: Gladiator[];
  ludusBuildings: LudusBuilding[];
  ludusStaff: LudusStaff[];
  ludusWorkers: LudusWorker[];
  gameStatistics: GameStatistics;
};

function getRequirementProgress(
  achievementId: string,
  requirementType: string,
  snapshot: AchievementSnapshot,
): number {
  const {
    playerLudus,
    gladiators,
    ludusBuildings,
    ludusStaff,
    ludusWorkers,
    gameStatistics,
  } = snapshot;

  if (!playerLudus) {
    return 0;
  }

  if (achievementId === "first_purchase") {
    return gameStatistics.gladiatorsPurchased;
  }

  switch (requirementType) {
    case "arena_wins":
      return gameStatistics.arenaWins;

    case "gladiators_owned":
      return gladiators.filter(
        (gladiator) =>
          gladiator.ludusId === playerLudus.id && gladiator.status !== "dead",
      ).length;

    case "trainings_completed":
      return gameStatistics.trainingsCompleted;

    case "buildings_built":
      return Math.max(
        gameStatistics.buildingsBuilt,
        ludusBuildings.filter((building) => building.isBuilt).length,
      );

    case "staff_hired":
      return Math.max(
        gameStatistics.staffHired,
        ludusStaff.filter((staff) => staff.hired).length,
      );

    case "workers_hired":
      return Math.max(
        gameStatistics.workersHired,
        ludusWorkers.reduce((total, worker) => total + worker.count, 0),
      );

    case "special_gladiators_owned":
      return gladiators.filter(
        (gladiator) =>
          gladiator.ludusId === playerLudus.id &&
          gladiator.id.startsWith("special-") &&
          gladiator.status !== "dead",
      ).length;

    case "ludus_level":
      return playerLudus.level;

    case "prestige":
      return playerLudus.prestige;

    case "fame":
      return playerLudus.fame;

    case "denarius":
      return playerLudus.denarius;

    default:
      return 0;
  }
}

export function syncAchievementProgress(
  currentProgress: AchievementProgress[],
  snapshot: AchievementSnapshot,
): AchievementProgress[] {
  return ACHIEVEMENTS.map((achievement) => {
    const previous = currentProgress.find(
      (item) => item.achievementId === achievement.id,
    );

    const rawProgress = getRequirementProgress(
      achievement.id,
      achievement.requirementType,
      snapshot,
    );

    const completed = previous?.completed || rawProgress >= achievement.target;

    return {
      achievementId: achievement.id,
      progress: Math.min(rawProgress, achievement.target),
      completed,
      claimed: previous?.claimed ?? false,
    };
  });
}
