import { EquipmentBonuses, EquipmentItem, Gladiator } from "../../types/game";

export function getGladiatorEquipment(
  gladiatorId: string,
  inventory: EquipmentItem[],
) {
  return inventory.filter((item) => item.equippedByGladiatorId === gladiatorId);
}

export function getEquipmentBonusesForGladiator(
  gladiatorId: string,
  inventory: EquipmentItem[],
): EquipmentBonuses {
  const equippedItems = getGladiatorEquipment(gladiatorId, inventory);

  return equippedItems.reduce<EquipmentBonuses>(
    (total, item) => ({
      strength: (total.strength ?? 0) + (item.bonuses.strength ?? 0),

      endurance: (total.endurance ?? 0) + (item.bonuses.endurance ?? 0),

      agility: (total.agility ?? 0) + (item.bonuses.agility ?? 0),

      attack: (total.attack ?? 0) + (item.bonuses.attack ?? 0),

      defense: (total.defense ?? 0) + (item.bonuses.defense ?? 0),

      courage: (total.courage ?? 0) + (item.bonuses.courage ?? 0),
    }),
    {},
  );
}

export function applyEquipmentBonuses(
  gladiator: Gladiator,
  inventory: EquipmentItem[],
): Gladiator {
  const bonuses = getEquipmentBonusesForGladiator(gladiator.id, inventory);

  return {
    ...gladiator,

    strength: Math.max(
      1,
      Math.min(100, gladiator.strength + (bonuses.strength ?? 0)),
    ),

    endurance: Math.max(
      1,
      Math.min(100, gladiator.endurance + (bonuses.endurance ?? 0)),
    ),

    agility: Math.max(
      1,
      Math.min(100, gladiator.agility + (bonuses.agility ?? 0)),
    ),

    attack: Math.max(
      1,
      Math.min(100, gladiator.attack + (bonuses.attack ?? 0)),
    ),

    defense: Math.max(
      1,
      Math.min(100, gladiator.defense + (bonuses.defense ?? 0)),
    ),

    courage: Math.max(
      1,
      Math.min(100, gladiator.courage + (bonuses.courage ?? 0)),
    ),
  };
}
