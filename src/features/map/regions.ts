export type RegionId = "roma" | "campania" | "capua" | "sicilia" | "gallia";

export type GameRegion = {
  id: RegionId;
  name: string;
  subtitle: string;
  description: string;
  requiredLevel: number;
  unlockedByDefault: boolean;
};

export const GAME_REGIONS: GameRegion[] = [
  {
    id: "roma",
    name: "Roma",
    subtitle: "İmparatorluğun kalbi",
    description: "Arena, Ludus, pazar ve şehir yaşamının merkezi.",
    requiredLevel: 1,
    unlockedByDefault: true,
  },

  {
    id: "campania",
    name: "Campania",
    subtitle: "Zengin topraklar",
    description: "Yeni ticaret fırsatları ve farklı rakip Luduslar.",
    requiredLevel: 3,
    unlockedByDefault: false,
  },

  {
    id: "capua",
    name: "Capua",
    subtitle: "Gladyatörlerin şehri",
    description: "Daha güçlü rakipler ve yüksek seviyeli arenalar.",
    requiredLevel: 5,
    unlockedByDefault: false,
  },

  {
    id: "sicilia",
    name: "Sicilia",
    subtitle: "Ada toprakları",
    description: "Yeni olaylar, ticaret ve özel gladyatörler.",
    requiredLevel: 7,
    unlockedByDefault: false,
  },

  {
    id: "gallia",
    name: "Gallia",
    subtitle: "Uzak kuzey toprakları",
    description: "Endgame rakipleri ve nadir gladyatörler.",
    requiredLevel: 10,
    unlockedByDefault: false,
  },
];

export function getRegion(regionId: RegionId): GameRegion | undefined {
  return GAME_REGIONS.find((region) => region.id === regionId);
}

export function isRegionUnlocked(
  regionId: RegionId,
  ludusLevel: number,
): boolean {
  const region = getRegion(regionId);

  if (!region) {
    return false;
  }

  if (region.unlockedByDefault) {
    return true;
  }

  return ludusLevel >= region.requiredLevel;
}

export function getUnlockedRegions(ludusLevel: number): GameRegion[] {
  return GAME_REGIONS.filter((region) =>
    isRegionUnlocked(region.id, ludusLevel),
  );
}

export function getLockedRegions(ludusLevel: number): GameRegion[] {
  return GAME_REGIONS.filter(
    (region) => !isRegionUnlocked(region.id, ludusLevel),
  );
}

export function getNextRegionUnlock(ludusLevel: number): GameRegion | null {
  const lockedRegions = getLockedRegions(ludusLevel);

  if (lockedRegions.length === 0) {
    return null;
  }

  return (
    [...lockedRegions].sort((a, b) => a.requiredLevel - b.requiredLevel)[0] ??
    null
  );
}
