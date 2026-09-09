import { Arena, Gladiator } from "../../types/game";

import { randomInt } from "../../utils/random";

import {
  applyEndgameStatBonus,
  getEndgameScaling,
} from "../endgame/endgameScaling";

import { generateGladiator } from "../gladiators/generateGladiator";

interface GenerateArenaOpponentOptions {
  worldId: string;

  arena: Arena;

  playerGladiator: Gladiator;

  playerPrestige: number;
}

function clampStat(value: number) {
  return Math.max(1, Math.min(100, value));
}

export function generateArenaOpponent({
  worldId,
  arena,
  playerGladiator,
  playerPrestige,
}: GenerateArenaOpponentOptions): Gladiator {
  const enemy = generateGladiator({
    worldId,

    profile: "random",
  });

  const playerAverage =
    (playerGladiator.strength +
      playerGladiator.endurance +
      playerGladiator.agility +
      playerGladiator.attack +
      playerGladiator.defense +
      playerGladiator.courage) /
    6;

  let difficultyModifier = 0;

  if (arena.difficulty === "easy") {
    difficultyModifier = randomInt(-8, -2);
  }

  if (arena.difficulty === "normal") {
    difficultyModifier = randomInt(-3, 5);
  }

  if (arena.difficulty === "hard") {
    difficultyModifier = randomInt(3, 10);
  }

  if (arena.difficulty === "elite") {
    difficultyModifier = randomInt(8, 16);
  }

  const targetPower = Math.max(
    arena.recommendedPowerMin,

    Math.min(arena.recommendedPowerMax, playerAverage + difficultyModifier),
  );

  const variation = () => randomInt(-5, 5);

  enemy.strength = clampStat(Math.round(targetPower + variation()));

  enemy.endurance = clampStat(Math.round(targetPower + variation()));

  enemy.agility = clampStat(Math.round(targetPower + variation()));

  enemy.attack = clampStat(Math.round(targetPower + variation()));

  enemy.defense = clampStat(Math.round(targetPower + variation()));

  enemy.courage = clampStat(Math.round(targetPower + variation()));

  /*
    ENDGAME BONUSU

    Ludus Lv.10'a ulaştıktan sonra
    Hanedan Derecesine göre Arena
    rakipleri güçlenmeye devam eder.
  */

  const endgameScaling = getEndgameScaling(playerPrestige);

  if (endgameScaling.active) {
    enemy.strength = applyEndgameStatBonus(
      enemy.strength,
      endgameScaling.opponentStatBonus,
    );

    enemy.endurance = applyEndgameStatBonus(
      enemy.endurance,
      endgameScaling.opponentStatBonus,
    );

    enemy.agility = applyEndgameStatBonus(
      enemy.agility,
      endgameScaling.opponentStatBonus,
    );

    enemy.attack = applyEndgameStatBonus(
      enemy.attack,
      endgameScaling.opponentStatBonus,
    );

    enemy.defense = applyEndgameStatBonus(
      enemy.defense,
      endgameScaling.opponentStatBonus,
    );

    enemy.courage = applyEndgameStatBonus(
      enemy.courage,
      endgameScaling.opponentStatBonus,
    );
  }

  enemy.hp = 100;

  enemy.maxHp = 100;

  enemy.fatigue = randomInt(0, 10);

  enemy.morale = randomInt(55, 80);

  enemy.loyalty = randomInt(40, 70);

  enemy.status = "active";

  enemy.ludusId = "arena-opponent";

  enemy.wins = randomInt(0, 8);

  enemy.losses = randomInt(0, 5);

  return enemy;
}
