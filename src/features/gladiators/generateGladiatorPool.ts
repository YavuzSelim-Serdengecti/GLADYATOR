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

  return Array.from({ length: count }, () =>
    generateGladiator({
      worldId,
      ludusId,
      profile: "random",
    }),
  );
}
