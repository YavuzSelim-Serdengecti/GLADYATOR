import { Gladiator } from "../../types/game";

interface CalculateTrainingGainOptions {
  gladiator: Gladiator;
  trainingGroundLevel: number;
}

export function calculateTrainingGain({
  gladiator,
  trainingGroundLevel,
}: CalculateTrainingGainOptions): number {
  let gain = 1;

  // Eğitim alanı bonusu
  if (trainingGroundLevel >= 2) {
    gain += 0.35;
  }

  if (trainingGroundLevel >= 3) {
    gain += 0.35;
  }

  if (trainingGroundLevel >= 4) {
    gain += 0.4;
  }

  if (trainingGroundLevel >= 5) {
    gain += 0.4;
  }

  // Potansiyel bonusu
  if (gladiator.potential >= 80) {
    gain += 0.8;
  } else if (gladiator.potential >= 65) {
    gain += 0.5;
  } else if (gladiator.potential >= 50) {
    gain += 0.25;
  }

  // Yorgunluk cezası
  if (gladiator.fatigue >= 80) {
    gain *= 0.25;
  } else if (gladiator.fatigue >= 60) {
    gain *= 0.5;
  } else if (gladiator.fatigue >= 40) {
    gain *= 0.75;
  }

  /*
    Ondalıklı gelişimi olasılığa çeviriyoruz.

    Örnek:
    gain = 1.75
    → kesin +1
    → %75 ihtimalle bir +1 daha
  */
  const guaranteedGain = Math.floor(gain);

  const extraChance = gain - guaranteedGain;

  const extraGain = Math.random() < extraChance ? 1 : 0;

  return Math.max(1, guaranteedGain + extraGain);
}
