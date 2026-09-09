import AsyncStorage from "@react-native-async-storage/async-storage";

export const GAME_SAVE_KEY = "@gladiator_game_save_v1";

export type GameSaveData = {
  version: number;
  savedAt: string;
  state: Record<string, unknown>;
};

const SAVE_VERSION = 1;

export async function saveGameState(
  state: Record<string, unknown>,
): Promise<void> {
  const saveData: GameSaveData = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };

  await AsyncStorage.setItem(GAME_SAVE_KEY, JSON.stringify(saveData));
}

export async function loadGameState(): Promise<GameSaveData | null> {
  const rawSave = await AsyncStorage.getItem(GAME_SAVE_KEY);

  if (!rawSave) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSave) as GameSaveData;

    if (!parsed || typeof parsed !== "object" || !parsed.state) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Save dosyası okunamadı:", error);

    return null;
  }
}

export async function hasGameSave(): Promise<boolean> {
  const rawSave = await AsyncStorage.getItem(GAME_SAVE_KEY);

  return rawSave !== null;
}

export async function deleteGameSave(): Promise<void> {
  await AsyncStorage.removeItem(GAME_SAVE_KEY);
}

export async function getGameSaveDate(): Promise<string | null> {
  const save = await loadGameState();

  if (!save) {
    return null;
  }

  return save.savedAt;
}
