import { Gladiator, LudusStaff } from "../../types/game";

interface CalculateRebellionRiskOptions {
  gladiator: Gladiator;
  staff: LudusStaff[];
}

export function calculateGladiatorRebellionRisk({
  gladiator,
  staff,
}: CalculateRebellionRiskOptions) {
  if (gladiator.status === "dead" || gladiator.status === "retired") {
    return 0;
  }

  let risk = 0;

  /*
    MORAL
  */
  if (gladiator.morale < 20) {
    risk += 25;
  } else if (gladiator.morale < 40) {
    risk += 12;
  }

  /*
    SADAKAT
  */
  if (gladiator.loyalty < 20) {
    risk += 35;
  } else if (gladiator.loyalty < 40) {
    risk += 18;
  }

  /*
    Yaralı olmak hoşnutsuzluğu artırabilir.
  */
  if (gladiator.status === "injured") {
    risk += 5;
  }

  /*
    Muhafız Kaptanı riski düşürür.
  */
  const guardCaptain = staff.find(
    (member) => member.role === "guard_captain" && member.hired,
  );

  if (guardCaptain) {
    risk -= guardCaptain.securityBonus;
  }

  return Math.max(0, Math.min(80, risk));
}
