import { Gladiator } from "../../types/game";
import { generateGladiator } from "./generateGladiator";

type GenerateGladiatorPoolParams = {
  worldId: string;
  count: number;
  ludusId?: string;
};

export function generateGladiatorPool({
  worldId,
  count,
  ludusId,
}: GenerateGladiatorPoolParams): Gladiator[] {
  if (count <= 0) {
    return [];
  }

  const portraitIds = Array.from({ length: 16 }, (_, index) => index + 1);

  // Portreleri karıştır
  for (let i = portraitIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [portraitIds[i], portraitIds[j]] = [portraitIds[j], portraitIds[i]];
  }

  return Array.from({ length: count }, (_, index) =>
    generateGladiator({
      worldId,
      ludusId,
      profile: "random",
      portraitId: portraitIds[index % portraitIds.length],
    }),
  );
}
