import { gladiatorClassDefinitions } from "../../data/gladiatorClasses";
import { Gladiator } from "../../types/game";
import { randomInt } from "../../utils/random";
export type BattleAction = "attack" | "defend";

export interface BattleFighter {
  gladiator: Gladiator;
  currentHp: number;
  stamina: number;
  defending: boolean;
}

export interface BattleTurnResult {
  attackerName: string;
  defenderName: string;

  action: BattleAction;

  damage: number;

  defenderHp: number;
  attackerStamina: number;

  message: string;
}

export function createBattleFighter(gladiator: Gladiator): BattleFighter {
  return {
    gladiator,
    currentHp: gladiator.hp,
    stamina: 100,
    defending: false,
  };
}

export function calculateDamage(
  attacker: BattleFighter,
  defender: BattleFighter,
) {
  const attackerClass = gladiatorClassDefinitions[attacker.gladiator.class];

  const defenderClass = gladiatorClassDefinitions[defender.gladiator.class];

  const attackPower =
    (attacker.gladiator.attack * 0.45 +
      attacker.gladiator.strength * 0.35 +
      attacker.gladiator.agility * 0.2) *
    attackerClass.attackMultiplier;

  const defensePower =
    (defender.gladiator.defense * 0.55 +
      defender.gladiator.agility * 0.25 +
      defender.gladiator.endurance * 0.2) *
    defenderClass.defenseMultiplier;

  /*
    Çeviklik + sınıf bonusu
    saldırıdan tamamen kaçınma şansı verir.
  */
  const baseDodge = defender.gladiator.agility / 1000;

  const dodgeChance = Math.max(
    0,
    Math.min(0.25, baseDodge + defenderClass.dodgeBonus),
  );

  if (Math.random() < dodgeChance) {
    return 0;
  }

  let damage = attackPower - defensePower * 0.45 + randomInt(-4, 6);

  if (defender.defending) {
    damage *= 0.55;
  }

  if (attacker.stamina < 30) {
    damage *= 0.8;
  }

  return Math.max(1, Math.round(damage));
}

export function performAttack(
  attacker: BattleFighter,
  defender: BattleFighter,
): BattleTurnResult {
  const damage = calculateDamage(attacker, defender);

  const attackerClass = gladiatorClassDefinitions[attacker.gladiator.class];

  const staminaCost = Math.max(5, 10 + attackerClass.staminaAttackCostModifier);

  attacker.stamina = Math.max(0, attacker.stamina - staminaCost);

  defender.currentHp = Math.max(0, defender.currentHp - damage);

  defender.defending = false;

  return {
    attackerName: attacker.gladiator.name,
    defenderName: defender.gladiator.name,

    action: "attack",

    damage,

    defenderHp: defender.currentHp,
    attackerStamina: attacker.stamina,

    message:
      damage === 0
        ? `${defender.gladiator.name} saldırıdan kaçındı!`
        : `${attacker.gladiator.name}, ${defender.gladiator.name} adlı rakibine ${damage} hasar verdi.`,
  };
}

export function performDefend(fighter: BattleFighter): BattleTurnResult {
  fighter.defending = true;

  fighter.stamina = Math.min(100, fighter.stamina + 12);

  return {
    attackerName: fighter.gladiator.name,
    defenderName: fighter.gladiator.name,

    action: "defend",

    damage: 0,

    defenderHp: fighter.currentHp,
    attackerStamina: fighter.stamina,

    message: `${fighter.gladiator.name} savunmaya geçti ve stamina topladı.`,
  };
}

export function chooseEnemyAction(enemy: BattleFighter): BattleAction {
  if (enemy.stamina < 25) {
    return Math.random() < 0.65 ? "defend" : "attack";
  }

  return Math.random() < 0.75 ? "attack" : "defend";
}
