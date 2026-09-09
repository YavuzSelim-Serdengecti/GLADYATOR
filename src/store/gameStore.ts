import { create } from "zustand";

import { initialEquipment } from "../data/equipment";
import { initialLudusBuildings } from "../data/ludusBuildings";
import { initialLudusStaff } from "../data/ludusStaff";
import { initialLudusWorkers } from "../data/ludusWorkers";

import { calculateDeath } from "../features/arena/calculateDeath";
import { calculateInjury } from "../features/arena/calculateInjury";

import {
  calculateDailyExpenses,
  DailyExpenseBreakdown,
} from "../features/economy/calculateDailyExpenses";

import {
  calculateDailyIncome,
  DailyIncomeBreakdown,
} from "../features/economy/calculateDailyIncome";

import {
  BankruptcyState,
  createInitialBankruptcyState,
  processDailyBankruptcy,
} from "../features/economy/bankruptcySystem";

import { calculateGladiatorRebellionRisk } from "../features/events/calculateGladiatorRebellionRisk";
import { createGladiatorEvent } from "../features/events/createGladiatorEvent";
import {
  createTavernEvent,
  TavernChoiceEvent,
} from "../features/events/createTavernEvent";

import { generateGladiator } from "../features/gladiators/generateGladiator";
import {
  createSpecialGladiator,
  getSpecialGladiator,
} from "../features/gladiators/specialGladiators";
import {
  clampValue,
  getArenaMoraleChange,
  getTrainingLoyaltyBonus,
} from "../features/gladiators/updateMoraleAndLoyalty";

import {
  calculateLudusLevel,
  LUDUS_PRESTIGE_REWARDS,
} from "../features/ludus/ludusLevel";
import { calculateTrainingGain } from "../features/training/calculateTrainingGain";

import {
  DailyReward,
  getRandomDailyReward,
  getTodayDateKey,
} from "../features/dailyReward/dailyReward";

import {
  canWatchRewardedAd,
  createInitialRewardedAdUsage,
  getRewardedAdReward,
  registerRewardedAdWatch,
  RewardedAdRewardType,
  RewardedAdUsage,
} from "../features/ads/rewardedAds";

import {
  deleteGameSave,
  getGameSaveDate,
  hasGameSave,
  loadGameState,
  saveGameState,
} from "../features/save/saveSystem";

import {
  deleteCloudSave,
  downloadCloudSave,
  uploadCloudSave,
} from "../features/save/cloudSaveService";

import { syncAchievementProgress } from "../features/achievements/achievementEngine";
import { ACHIEVEMENTS } from "../features/achievements/achievements";
import { createAchievementProgress } from "../features/achievements/createAchievementProgress";

import {
  AchievementProgress,
  EquipmentItem,
  GameEvent,
  GameEventDecision,
  GameStatistics,
  Gladiator,
  Ludus,
  LudusBuilding,
  LudusStaff,
  LudusWorker,
  TwentyOneGameState,
  World,
} from "../types/game";

type TrainingType = "strength" | "endurance" | "agility" | "attack" | "defense";

function applyLudusPrestigeGain(ludus: Ludus, amount: number): Ludus {
  if (amount <= 0) {
    return ludus;
  }

  const prestige = ludus.prestige + amount;

  return {
    ...ludus,
    prestige,
    level: calculateLudusLevel(prestige),
  };
}

function getBuilderDailyProgress(workers: LudusWorker[]): number {
  const builders = workers.find((worker) => worker.role === "builder");

  if (!builders || builders.count <= 0) {
    return 1;
  }

  /*
    Her inşaatçı verim değerinin %25'i kadar
    günlük ek ilerleme sağlar.

    Örnek:
    2 işçi, 1.2 verim => 1 + (2 * 1.2 * 0.25) = 1.6 gün ilerleme.
  */
  return 1 + builders.count * Math.max(0, builders.efficiency) * 0.25;
}

function normalizeBuilding(building: LudusBuilding): LudusBuilding {
  return {
    ...building,
    buildDays: building.buildDays ?? 2,
    upgradeDays: building.upgradeDays ?? 2,
    constructionType: building.constructionType ?? null,
    constructionDaysRemaining: building.constructionDaysRemaining ?? 0,
    constructionTargetLevel: building.constructionTargetLevel ?? null,
  };
}

interface GameState {
  world: World | null;
  playerLudus: Ludus | null;

  aiLuduses: Ludus[];
  gladiators: Gladiator[];

  ludusBuildings: LudusBuilding[];
  ludusStaff: LudusStaff[];
  ludusWorkers: LudusWorker[];

  inventory: EquipmentItem[];

  currentArenaOpponent: Gladiator | null;

  lastDailyExpenses: DailyExpenseBreakdown | null;
  lastDailyIncome: DailyIncomeBreakdown | null;

  bankruptcyState: BankruptcyState;
  lastFinancialMessage: string | null;

  dailyRewardAvailable: boolean;
  lastDailyReward: DailyReward | null;
  lastDailyRewardDate: string | null;

  rewardedAdUsage: RewardedAdUsage;

  hasSavedGame: boolean;
  isSaveLoading: boolean;
  lastSaveAt: string | null;

  hasCloudSavedGame: boolean;
  isCloudSaveLoading: boolean;
  lastCloudSaveAt: string | null;

  checkSavedGame: () => Promise<boolean>;
  saveGame: () => Promise<string>;
  loadGame: () => Promise<boolean>;
  deleteSavedGame: () => Promise<void>;

  checkCloudSavedGame: () => Promise<boolean>;
  uploadGameToCloud: () => Promise<string>;
  loadGameFromCloud: () => Promise<boolean>;
  deleteCloudSavedGame: () => Promise<string>;

  checkDailyReward: () => Promise<boolean>;

  claimDailyReward: () => Promise<string>;

  claimRewardedAd: (type: RewardedAdRewardType) => string;

  gameEvents: GameEvent[];

  gameStatistics: GameStatistics;
  achievementProgress: AchievementProgress[];

  refreshAchievements: () => void;
  claimAchievementReward: (achievementId: string) => string;

  createNewGame: (lanistaName: string, ludusName: string) => void;

  addGladiator: (gladiator: Gladiator) => void;
  addSpecialGladiator: (specialGladiatorId: string) => string;
  buyGladiator: (gladiator: Gladiator, price?: number) => boolean;

  aiBuyGladiator: (
    gladiator: Gladiator,
    aiLudusId: string,
    price: number,
  ) => boolean;

  setCurrentArenaOpponent: (gladiator: Gladiator) => void;

  clearCurrentArenaOpponent: () => void;

  applyArenaResult: (
    gladiatorId: string,
    won: boolean,
    remainingHp: number,
    denariusReward: number,
    fameReward: number,
    experienceReward: number,
    arenaDeathRisk: number,
  ) => void;

  addPrestige: (amount: number) => void;

  buildLudusBuilding: (buildingId: string) => boolean;

  upgradeLudusBuilding: (buildingId: string) => boolean;

  trainGladiator: (gladiatorId: string, trainingType: TrainingType) => boolean;

  buyEquipment: (itemId: string) => boolean;

  equipItem: (itemId: string, gladiatorId: string) => boolean;

  unequipItem: (itemId: string) => boolean;

  hireStaff: (staffId: string) => boolean;

  hireWorker: (workerId: string, amount?: number) => boolean;

  resolveEvent: (eventId: string, decision: GameEventDecision) => string;

  pendingTavernEvent: {
    event: TavernChoiceEvent;
    gladiatorId: string;
  } | null;

  visitTavern: (gladiatorId: string) => string;

  resolveTavernChoice: (optionId: string) => string;

  playDiceGame: (bet: 50 | 100 | 250) => string;

  twentyOneGame: TwentyOneGameState;

  startTwentyOne: () => string;

  hitTwentyOne: () => string;

  standTwentyOne: () => string;

  spendActionPoints: (amount: number) => boolean;

  endDay: () => void;

  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  world: null,
  playerLudus: null,

  aiLuduses: [],
  gladiators: [],

  ludusBuildings: [],
  ludusStaff: [],
  ludusWorkers: [],

  inventory: [],

  currentArenaOpponent: null,

  lastDailyExpenses: null,
  lastDailyIncome: null,

  bankruptcyState: createInitialBankruptcyState(),
  lastFinancialMessage: null,

  dailyRewardAvailable: false,
  lastDailyReward: null,
  lastDailyRewardDate: null,

  rewardedAdUsage: createInitialRewardedAdUsage(),

  hasSavedGame: false,
  isSaveLoading: false,
  lastSaveAt: null,

  hasCloudSavedGame: false,
  isCloudSaveLoading: false,
  lastCloudSaveAt: null,

  gameEvents: [],

  gameStatistics: {
    arenaWins: 0,
    gladiatorsPurchased: 0,
    trainingsCompleted: 0,
    buildingsBuilt: 0,
    staffHired: 0,
    workersHired: 0,
  },

  achievementProgress: createAchievementProgress(),

  pendingTavernEvent: null,

  twentyOneGame: {
    active: false,
    playerScore: 0,
    houseScore: 0,
    bet: 100,
    finished: false,
    result: null,
  },

  checkSavedGame: async () => {
    try {
      const exists = await hasGameSave();
      const savedAt = exists ? await getGameSaveDate() : null;

      set({
        hasSavedGame: exists,
        lastSaveAt: savedAt,
      });

      return exists;
    } catch (error) {
      console.error("Kayıt kontrol edilemedi:", error);

      set({
        hasSavedGame: false,
        lastSaveAt: null,
      });

      return false;
    }
  },

  saveGame: async () => {
    const state = get();

    if (!state.world || !state.playerLudus) {
      return "Kaydedilecek aktif oyun bulunamadı.";
    }

    const saveableState = {
      world: state.world,
      playerLudus: state.playerLudus,
      aiLuduses: state.aiLuduses,
      gladiators: state.gladiators,
      ludusBuildings: state.ludusBuildings,
      ludusStaff: state.ludusStaff,
      ludusWorkers: state.ludusWorkers,
      inventory: state.inventory,
      currentArenaOpponent: state.currentArenaOpponent,
      lastDailyExpenses: state.lastDailyExpenses,
      lastDailyIncome: state.lastDailyIncome,
      bankruptcyState: state.bankruptcyState,
      lastFinancialMessage: state.lastFinancialMessage,
      dailyRewardAvailable: state.dailyRewardAvailable,
      lastDailyReward: state.lastDailyReward,
      lastDailyRewardDate: state.lastDailyRewardDate,
      rewardedAdUsage: state.rewardedAdUsage,
      gameEvents: state.gameEvents,
      gameStatistics: state.gameStatistics,
      achievementProgress: state.achievementProgress,
      pendingTavernEvent: state.pendingTavernEvent,
      twentyOneGame: state.twentyOneGame,
    };

    try {
      await saveGameState(saveableState);

      const savedAt = await getGameSaveDate();

      set({
        hasSavedGame: true,
        lastSaveAt: savedAt,
      });

      return "Oyun kaydedildi.";
    } catch (error) {
      console.error("Oyun kaydedilemedi:", error);

      return "Oyun kaydedilemedi.";
    }
  },

  loadGame: async () => {
    set({ isSaveLoading: true });

    try {
      const save = await loadGameState();

      if (!save) {
        set({
          hasSavedGame: false,
          isSaveLoading: false,
          lastSaveAt: null,
        });

        return false;
      }

      const savedState = save.state as Partial<GameState>;

      if (!savedState.world || !savedState.playerLudus) {
        set({
          hasSavedGame: false,
          isSaveLoading: false,
        });

        return false;
      }

      set({
        world: savedState.world,
        playerLudus: savedState.playerLudus,
        aiLuduses: savedState.aiLuduses ?? [],
        gladiators: savedState.gladiators ?? [],
        ludusBuildings: (
          savedState.ludusBuildings ?? initialLudusBuildings
        ).map((building) => normalizeBuilding(building)),
        ludusStaff: savedState.ludusStaff ?? [],
        ludusWorkers: savedState.ludusWorkers ?? [],
        inventory: savedState.inventory ?? [],
        currentArenaOpponent: savedState.currentArenaOpponent ?? null,
        lastDailyExpenses: savedState.lastDailyExpenses ?? null,
        lastDailyIncome: savedState.lastDailyIncome ?? null,
        bankruptcyState:
          savedState.bankruptcyState ?? createInitialBankruptcyState(),
        lastFinancialMessage: savedState.lastFinancialMessage ?? null,
        dailyRewardAvailable:
          (savedState.lastDailyRewardDate ?? null) !== getTodayDateKey(),
        lastDailyReward: savedState.lastDailyReward ?? null,
        lastDailyRewardDate: savedState.lastDailyRewardDate ?? null,
        rewardedAdUsage:
          savedState.rewardedAdUsage ?? createInitialRewardedAdUsage(),
        gameEvents: savedState.gameEvents ?? [],
        gameStatistics: savedState.gameStatistics ?? {
          arenaWins: 0,
          gladiatorsPurchased: 0,
          trainingsCompleted: 0,
          buildingsBuilt: 0,
          staffHired: 0,
          workersHired: 0,
        },
        achievementProgress:
          savedState.achievementProgress ?? createAchievementProgress(),
        pendingTavernEvent: savedState.pendingTavernEvent ?? null,
        twentyOneGame: savedState.twentyOneGame ?? {
          active: false,
          playerScore: 0,
          houseScore: 0,
          bet: 100,
          finished: false,
          result: null,
        },
        hasSavedGame: true,
        isSaveLoading: false,
        lastSaveAt: save.savedAt,
      });

      get().refreshAchievements();

      return true;
    } catch (error) {
      console.error("Oyun yüklenemedi:", error);

      set({ isSaveLoading: false });

      return false;
    }
  },

  deleteSavedGame: async () => {
    try {
      await deleteGameSave();
    } catch (error) {
      console.error("Kayıt silinemedi:", error);
    } finally {
      set({
        hasSavedGame: false,
        lastSaveAt: null,
      });
    }
  },

  checkCloudSavedGame: async () => {
    try {
      const cloudSave = await downloadCloudSave();

      set({
        hasCloudSavedGame: cloudSave !== null,
        lastCloudSaveAt: cloudSave?.updated_at ?? null,
      });

      return cloudSave !== null;
    } catch (error) {
      console.error("Bulut kayıt kontrol edilemedi:", error);

      set({
        hasCloudSavedGame: false,
        lastCloudSaveAt: null,
      });

      return false;
    }
  },

  uploadGameToCloud: async () => {
    set({ isCloudSaveLoading: true });

    try {
      /*
        ÖNEMLİ:
        Buluta aktif Zustand state'i değil, cihazdaki gerçek
        AsyncStorage kaydı gönderilir. Böylece kullanıcı ana
        menüden Hesap ekranına girse bile cihaz kaydı bulunur.
      */
      const localSave = await loadGameState();

      if (!localSave) {
        set({ isCloudSaveLoading: false });
        return "Cihazda buluta yedeklenecek bir oyun kaydı yok.";
      }

      const localState = localSave.state as Partial<GameState>;

      if (!localState.world || !localState.playerLudus) {
        set({ isCloudSaveLoading: false });
        return "Cihazdaki oyun kaydı geçerli değil.";
      }

      const cloudSave = await uploadCloudSave(localSave);

      set({
        hasCloudSavedGame: true,
        isCloudSaveLoading: false,
        lastCloudSaveAt: cloudSave.updated_at,
      });

      return "Cihaz kaydı buluta yedeklendi.";
    } catch (error) {
      console.error("Oyun buluta yüklenemedi:", error);

      set({ isCloudSaveLoading: false });

      return "Bulut yedekleme başarısız oldu.";
    }
  },

  loadGameFromCloud: async () => {
    set({ isCloudSaveLoading: true });

    try {
      const cloudSave = await downloadCloudSave();

      if (!cloudSave) {
        set({
          hasCloudSavedGame: false,
          isCloudSaveLoading: false,
          lastCloudSaveAt: null,
        });

        return false;
      }

      const cloudGameSave = cloudSave.save_data;
      const cloudState = cloudGameSave?.state as Partial<GameState> | undefined;

      if (!cloudState?.world || !cloudState.playerLudus) {
        set({ isCloudSaveLoading: false });
        return false;
      }

      /*
        Önce bulut kaydını cihazın yerel kaydı haline getiriyoruz.
        Ardından mevcut loadGame() tek bir yerden Zustand state'ini
        dolduruyor. Böylece iki ayrı yükleme mantığı oluşmuyor.
      */
      await saveGameState(cloudGameSave.state);

      const loaded = await get().loadGame();

      set({
        hasCloudSavedGame: true,
        isCloudSaveLoading: false,
        lastCloudSaveAt: cloudSave.updated_at,
      });

      return loaded;
    } catch (error) {
      console.error("Bulut kayıt yüklenemedi:", error);

      set({ isCloudSaveLoading: false });

      return false;
    }
  },

  deleteCloudSavedGame: async () => {
    set({ isCloudSaveLoading: true });

    try {
      await deleteCloudSave();

      set({
        hasCloudSavedGame: false,
        isCloudSaveLoading: false,
        lastCloudSaveAt: null,
      });

      return "Bulut kayıt silindi.";
    } catch (error) {
      console.error("Bulut kayıt silinemedi:", error);

      set({ isCloudSaveLoading: false });

      return "Bulut kayıt silinemedi.";
    }
  },

  refreshAchievements: () => {
    const state = get();

    const nextProgress = syncAchievementProgress(state.achievementProgress, {
      playerLudus: state.playerLudus,
      gladiators: state.gladiators,
      ludusBuildings: state.ludusBuildings,
      ludusStaff: state.ludusStaff,
      ludusWorkers: state.ludusWorkers,
      gameStatistics: state.gameStatistics,
    });

    set({
      achievementProgress: nextProgress,
    });
  },

  claimAchievementReward: (achievementId) => {
    const state = get();
    const ludus = state.playerLudus;

    if (!ludus) {
      return "Ludus bulunamadı.";
    }

    const definition = ACHIEVEMENTS.find(
      (achievement) => achievement.id === achievementId,
    );

    const progress = state.achievementProgress.find(
      (item) => item.achievementId === achievementId,
    );

    if (!definition || !progress) {
      return "Başarım bulunamadı.";
    }

    if (!progress.completed) {
      return "Bu başarım henüz tamamlanmadı.";
    }

    if (progress.claimed) {
      return "Bu başarımın ödülünü zaten aldın.";
    }

    const newPrestige = ludus.prestige + definition.prestigeReward;
    const newLevel = calculateLudusLevel(newPrestige);

    set((current) => ({
      playerLudus: {
        ...ludus,
        prestige: newPrestige,
        level: newLevel,
      },

      achievementProgress: current.achievementProgress.map((item) =>
        item.achievementId === achievementId
          ? {
              ...item,
              claimed: true,
            }
          : item,
      ),
    }));

    get().refreshAchievements();

    return `${definition.title} tamamlandı! +${definition.prestigeReward} Prestij`;
  },

  createNewGame: (lanistaName, ludusName) => {
    const timestamp = Date.now();

    const worldId = `world-${timestamp}`;

    const ludusId = `ludus-${timestamp}`;

    const newWorld: World = {
      id: worldId,
      name: "Roma",

      currentDay: 1,
      currentSeason: 1,
      currentYear: 1,
    };

    const newLudus: Ludus = {
      id: ludusId,
      worldId,

      name: ludusName,
      lanistaName,

      controllerType: "player",

      level: 1,

      denarius: 1000,
      fame: 0,
      prestige: 0,

      actionPoints: 8,
      maxActionPoints: 8,

      order: 70,
    };

    const aiLuduses: Ludus[] = [
      {
        id: `ai-ludus-1-${timestamp}`,
        worldId,

        name: "House Varro",
        lanistaName: "Varro",

        controllerType: "ai",
        aiPersonality: "warrior",

        level: 1,

        denarius: 1100,
        fame: 0,
        prestige: 0,

        actionPoints: 8,
        maxActionPoints: 8,

        order: 70,
      },

      {
        id: `ai-ludus-2-${timestamp}`,
        worldId,

        name: "House Cassian",
        lanistaName: "Cassian",

        controllerType: "ai",
        aiPersonality: "merchant",

        level: 1,

        denarius: 1000,
        fame: 0,
        prestige: 0,

        actionPoints: 8,
        maxActionPoints: 8,

        order: 70,
      },

      {
        id: `ai-ludus-3-${timestamp}`,
        worldId,

        name: "House Aurelius",
        lanistaName: "Aurelius",

        controllerType: "ai",
        aiPersonality: "builder",

        level: 1,

        denarius: 1200,
        fame: 0,
        prestige: 0,

        actionPoints: 8,
        maxActionPoints: 8,

        order: 70,
      },

      {
        id: `ai-ludus-4-${timestamp}`,
        worldId,

        name: "House Drusus",
        lanistaName: "Drusus",

        controllerType: "ai",
        aiPersonality: "risky",

        level: 1,

        denarius: 900,
        fame: 0,
        prestige: 0,

        actionPoints: 8,
        maxActionPoints: 8,

        order: 70,
      },
    ];

    const aiStartingGladiators = aiLuduses.map((aiLudus) =>
      generateGladiator({
        worldId,
        ludusId: aiLudus.id,
        profile: "balanced",
      }),
    );

    const startingBuildings = initialLudusBuildings.map((building) => ({
      ...building,
    }));

    const startingStaff = initialLudusStaff.map((staff) => ({
      ...staff,
    }));

    const startingWorkers = initialLudusWorkers.map((worker) => ({
      ...worker,
    }));

    const startingInventory: EquipmentItem[] = [];

    set({
      world: newWorld,
      playerLudus: newLudus,

      aiLuduses,

      gladiators: aiStartingGladiators,

      ludusBuildings: startingBuildings,

      ludusStaff: startingStaff,

      ludusWorkers: startingWorkers,

      inventory: startingInventory,

      currentArenaOpponent: null,

      lastDailyExpenses: null,
      lastDailyIncome: null,

      bankruptcyState: createInitialBankruptcyState(),
      lastFinancialMessage: null,

      dailyRewardAvailable: true,
      lastDailyReward: null,
      lastDailyRewardDate: null,

      rewardedAdUsage: createInitialRewardedAdUsage(),

      hasSavedGame: false,
      isSaveLoading: false,
      lastSaveAt: null,

      gameEvents: [],

      gameStatistics: {
        arenaWins: 0,
        gladiatorsPurchased: 0,
        trainingsCompleted: 0,
        buildingsBuilt: 0,
        staffHired: 0,
        workersHired: 0,
      },

      achievementProgress: createAchievementProgress(),

      pendingTavernEvent: null,

      twentyOneGame: {
        active: false,
        playerScore: 0,
        houseScore: 0,
        bet: 100,
        finished: false,
        result: null,
      },
    });
  },

  addGladiator: (gladiator) => {
    set((state) => ({
      gladiators: [...state.gladiators, gladiator],
    }));

    get().refreshAchievements();
  },

  addSpecialGladiator: (specialGladiatorId) => {
    const world = get().world;
    const ludus = get().playerLudus;

    if (!world || !ludus) {
      return "Aktif oyun bulunamadı.";
    }

    const definition = getSpecialGladiator(specialGladiatorId);

    if (!definition) {
      return "Özel gladyatör bulunamadı.";
    }

    const alreadyExists = get().gladiators.some(
      (gladiator) =>
        gladiator.worldId === world.id &&
        gladiator.name.toLocaleLowerCase("tr-TR") ===
          definition.name.toLocaleLowerCase("tr-TR"),
    );

    if (alreadyExists) {
      return `${definition.name} zaten bu oyun dünyasında bulunuyor.`;
    }

    const gladiator = createSpecialGladiator(definition, world.id, ludus.id);

    set((state) => ({
      gladiators: [...state.gladiators, gladiator],
    }));

    get().refreshAchievements();

    return `${definition.name} Ludus'una katıldı!`;
  },

  buyGladiator: (gladiator, price) => {
    const ludus = get().playerLudus;

    if (!ludus) {
      return false;
    }

    const finalPrice = price ?? gladiator.marketValue;

    if (ludus.denarius < finalPrice) {
      return false;
    }

    const purchasedGladiator: Gladiator = {
      ...gladiator,

      ludusId: ludus.id,
      status: "active",
    };

    set((state) => ({
      playerLudus: applyLudusPrestigeGain(
        {
          ...ludus,
          denarius: ludus.denarius - finalPrice,
        },
        LUDUS_PRESTIGE_REWARDS.gladiatorPurchase,
      ),

      gladiators: [...state.gladiators, purchasedGladiator],

      gameStatistics: {
        ...state.gameStatistics,
        gladiatorsPurchased: state.gameStatistics.gladiatorsPurchased + 1,
      },
    }));

    get().refreshAchievements();

    return true;
  },

  aiBuyGladiator: (gladiator, aiLudusId, price) => {
    const aiLudus = get().aiLuduses.find((ludus) => ludus.id === aiLudusId);

    if (!aiLudus) {
      return false;
    }

    if (aiLudus.denarius < price) {
      return false;
    }

    const purchasedGladiator: Gladiator = {
      ...gladiator,

      ludusId: aiLudus.id,
      status: "active",
    };

    set((state) => ({
      aiLuduses: state.aiLuduses.map((ludus) =>
        ludus.id === aiLudusId
          ? {
              ...ludus,

              denarius: ludus.denarius - price,
            }
          : ludus,
      ),

      gladiators: [...state.gladiators, purchasedGladiator],
    }));

    return true;
  },

  setCurrentArenaOpponent: (gladiator) => {
    set({
      currentArenaOpponent: gladiator,
    });
  },

  clearCurrentArenaOpponent: () => {
    set({
      currentArenaOpponent: null,
    });
  },

  applyArenaResult: (
    gladiatorId,
    won,
    remainingHp,
    denariusReward,
    fameReward,
    experienceReward,
    arenaDeathRisk,
  ) => {
    const ludus = get().playerLudus;

    const gladiator = get().gladiators.find((item) => item.id === gladiatorId);

    if (!ludus || !gladiator) {
      return;
    }

    const finalHp = Math.max(0, Math.min(gladiator.maxHp, remainingHp));

    const died = calculateDeath({
      gladiator,
      remainingHp: finalHp,
      arenaDeathRisk,
    });

    const injury = died
      ? {
          injured: false,
          severity: null,
          recoveryDays: 0,
        }
      : calculateInjury({
          gladiator,
          remainingHp: finalHp,
          won,
        });

    const arenaMoraleChange = getArenaMoraleChange(won);

    let injuryMoralePenalty = 0;

    if (!died && injury.injured) {
      if (injury.severity === "minor") {
        injuryMoralePenalty = -2;
      }

      if (injury.severity === "moderate") {
        injuryMoralePenalty = -5;
      }

      if (injury.severity === "severe") {
        injuryMoralePenalty = -10;
      }
    }

    set((state) => ({
      gladiators: state.gladiators.map((item) => {
        if (item.id !== gladiatorId) {
          return item;
        }

        return {
          ...item,

          hp: finalHp,

          status: died ? "dead" : injury.injured ? "injured" : "active",

          injurySeverity: died ? null : injury.severity,

          injuryDaysRemaining: died ? 0 : injury.recoveryDays,

          wins: won ? item.wins + 1 : item.wins,

          losses: won ? item.losses : item.losses + 1,

          winStreak: won ? item.winStreak + 1 : 0,

          experience: item.experience + experienceReward,

          fame: item.fame + (won ? fameReward : 0),

          morale: clampValue(
            item.morale + arenaMoraleChange + injuryMoralePenalty,
          ),
        };
      }),

      playerLudus: won
        ? applyLudusPrestigeGain(
            {
              ...ludus,
              denarius: ludus.denarius + denariusReward,
              fame: ludus.fame + fameReward,
            },
            LUDUS_PRESTIGE_REWARDS.arenaWin,
          )
        : {
            ...ludus,
          },

      currentArenaOpponent: null,

      gameStatistics: won
        ? {
            ...state.gameStatistics,
            arenaWins: state.gameStatistics.arenaWins + 1,
          }
        : state.gameStatistics,
    }));

    get().refreshAchievements();
  },

  addPrestige: (amount) => {
    const ludus = get().playerLudus;

    if (!ludus || amount <= 0) {
      return;
    }

    const newPrestige = ludus.prestige + amount;

    const newLevel = calculateLudusLevel(newPrestige);

    set({
      playerLudus: {
        ...ludus,

        prestige: newPrestige,

        level: newLevel,
      },
    });

    get().refreshAchievements();
  },

  buildLudusBuilding: (buildingId) => {
    const ludus = get().playerLudus;

    const building = get().ludusBuildings.find(
      (item) => item.id === buildingId,
    );

    if (!ludus || !building) {
      return false;
    }

    if (building.isBuilt || building.constructionType !== null) {
      return false;
    }

    if (ludus.level < building.requiredLudusLevel) {
      return false;
    }

    if (ludus.denarius < building.buildCost) {
      return false;
    }

    set((state) => ({
      playerLudus: {
        ...ludus,
        denarius: ludus.denarius - building.buildCost,
      },

      ludusBuildings: state.ludusBuildings.map((item) =>
        item.id === buildingId
          ? {
              ...item,
              constructionType: "build",
              constructionDaysRemaining: item.buildDays,
              constructionTargetLevel: 1,
            }
          : item,
      ),
    }));

    return true;
  },

  upgradeLudusBuilding: (buildingId) => {
    const ludus = get().playerLudus;

    const building = get().ludusBuildings.find(
      (item) => item.id === buildingId,
    );

    if (!ludus || !building) {
      return false;
    }

    if (!building.isBuilt || building.constructionType !== null) {
      return false;
    }

    if (building.level >= building.maxLevel) {
      return false;
    }

    const upgradePrice = building.upgradeCost * building.level;

    if (ludus.denarius < upgradePrice) {
      return false;
    }

    set((state) => ({
      playerLudus: {
        ...ludus,
        denarius: ludus.denarius - upgradePrice,
      },

      ludusBuildings: state.ludusBuildings.map((item) =>
        item.id === buildingId
          ? {
              ...item,
              constructionType: "upgrade",
              constructionDaysRemaining: item.upgradeDays,
              constructionTargetLevel: item.level + 1,
            }
          : item,
      ),
    }));

    return true;
  },

  trainGladiator: (gladiatorId, trainingType) => {
    const ludus = get().playerLudus;

    const trainingGround = get().ludusBuildings.find(
      (building) => building.type === "training_ground",
    );

    if (!ludus || !trainingGround?.isBuilt) {
      return false;
    }

    const gladiator = get().gladiators.find((item) => item.id === gladiatorId);

    if (
      !gladiator ||
      gladiator.ludusId !== ludus.id ||
      gladiator.status !== "active"
    ) {
      return false;
    }

    if (gladiator.hp <= 0) {
      return false;
    }

    if (gladiator.fatigue >= 90) {
      return false;
    }

    if (ludus.actionPoints < 1) {
      return false;
    }

    const baseStatGain = calculateTrainingGain({
      gladiator,

      trainingGroundLevel: trainingGround.level,
    });

    const trainer = get().ludusStaff.find(
      (staff) => staff.role === "trainer" && staff.hired,
    );

    const trainerBonus = trainer?.trainingBonus ?? 0;

    const finalStatGain = baseStatGain + trainerBonus;

    const loyaltyBonus = getTrainingLoyaltyBonus();

    set((state) => ({
      playerLudus: applyLudusPrestigeGain(
        {
          ...ludus,
          actionPoints: ludus.actionPoints - 1,
        },
        LUDUS_PRESTIGE_REWARDS.training,
      ),

      gladiators: state.gladiators.map((item) => {
        if (item.id !== gladiatorId) {
          return item;
        }

        return {
          ...item,

          [trainingType]: Math.min(
            100,

            item[trainingType] + finalStatGain,
          ),

          fatigue: Math.min(
            100,

            item.fatigue + 8,
          ),

          loyalty: clampValue(item.loyalty + loyaltyBonus),
        };
      }),

      gameStatistics: {
        ...state.gameStatistics,
        trainingsCompleted: state.gameStatistics.trainingsCompleted + 1,
      },
    }));

    get().refreshAchievements();

    return true;
  },

  buyEquipment: (itemId) => {
    const ludus = get().playerLudus;

    const item = initialEquipment.find((equipment) => equipment.id === itemId);

    const armory = get().ludusBuildings.find(
      (building) => building.type === "armory",
    );

    if (!ludus || !item) {
      return false;
    }

    /*
    EKİPMAN MAĞAZASI

    Oyuncunun Silahhane'yi sadece açmış olması yetmez.
    Bina gerçekten inşa edilmiş ve tamamlanmış olmalıdır.
  */
    if (!armory || !armory.isBuilt || armory.constructionType !== null) {
      return false;
    }

    if (ludus.denarius < item.price) {
      return false;
    }

    const ownedItem: EquipmentItem = {
      ...item,

      id: `${item.id}-${Date.now()}-${Math.random()}`,

      equippedByGladiatorId: null,
    };

    set((state) => ({
      playerLudus: applyLudusPrestigeGain(
        {
          ...ludus,
          denarius: ludus.denarius - item.price,
        },
        LUDUS_PRESTIGE_REWARDS.equipmentPurchase,
      ),

      inventory: [...state.inventory, ownedItem],
    }));

    return true;
  },

  equipItem: (itemId, gladiatorId) => {
    const ludus = get().playerLudus;

    if (!ludus) {
      return false;
    }

    const gladiator = get().gladiators.find((item) => item.id === gladiatorId);

    const equipment = get().inventory.find((item) => item.id === itemId);

    if (!gladiator || !equipment || gladiator.ludusId !== ludus.id) {
      return false;
    }

    if (
      equipment.equippedByGladiatorId &&
      equipment.equippedByGladiatorId !== gladiatorId
    ) {
      return false;
    }

    set((state) => ({
      inventory: state.inventory.map((item) => {
        if (
          item.type === equipment.type &&
          item.equippedByGladiatorId === gladiatorId
        ) {
          return {
            ...item,

            equippedByGladiatorId: null,
          };
        }

        if (item.id === itemId) {
          return {
            ...item,

            equippedByGladiatorId: gladiatorId,
          };
        }

        return item;
      }),
    }));

    return true;
  },

  unequipItem: (itemId) => {
    const equipment = get().inventory.find((item) => item.id === itemId);

    if (!equipment) {
      return false;
    }

    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.id === itemId
          ? {
              ...item,

              equippedByGladiatorId: null,
            }
          : item,
      ),
    }));

    return true;
  },

  hireStaff: (staffId) => {
    const ludus = get().playerLudus;

    const staff = get().ludusStaff.find((item) => item.id === staffId);

    if (!ludus || !staff || staff.hired) {
      return false;
    }

    if (ludus.level < staff.requiredLudusLevel) {
      return false;
    }

    const hiringCost = 300;

    if (ludus.denarius < hiringCost) {
      return false;
    }

    set((state) => ({
      playerLudus: applyLudusPrestigeGain(
        {
          ...ludus,
          denarius: ludus.denarius - hiringCost,
        },
        LUDUS_PRESTIGE_REWARDS.staffHire,
      ),

      ludusStaff: state.ludusStaff.map((item) =>
        item.id === staffId
          ? {
              ...item,
              hired: true,
            }
          : item,
      ),

      gameStatistics: {
        ...state.gameStatistics,
        staffHired: state.gameStatistics.staffHired + 1,
      },
    }));

    get().refreshAchievements();

    return true;
  },

  hireWorker: (workerId, amount = 1) => {
    const ludus = get().playerLudus;

    const worker = get().ludusWorkers.find((item) => item.id === workerId);

    if (!ludus || !worker || amount <= 0) {
      return false;
    }

    // Ludus seviyesi kontrolü
    if (ludus.level < worker.requiredLudusLevel) {
      return false;
    }

    if (worker.count + amount > worker.maxCount) {
      return false;
    }

    const totalCost = worker.hiringCost * amount;

    if (ludus.denarius < totalCost) {
      return false;
    }

    set((state) => ({
      playerLudus: applyLudusPrestigeGain(
        {
          ...ludus,
          denarius: ludus.denarius - totalCost,
        },
        LUDUS_PRESTIGE_REWARDS.workerHire * amount,
      ),

      ludusWorkers: state.ludusWorkers.map((item) =>
        item.id === workerId
          ? {
              ...item,
              count: item.count + amount,
            }
          : item,
      ),

      gameStatistics: {
        ...state.gameStatistics,
        workersHired: state.gameStatistics.workersHired + amount,
      },
    }));

    get().refreshAchievements();

    return true;
  },

  /*
      OLAYI ÇÖZÜLDÜ OLARAK İŞARETLE
    */

  resolveEvent: (eventId, decision) => {
    const event = get().gameEvents.find(
      (item) => item.id === eventId && item.status === "pending",
    );

    if (!event) {
      return "Olay bulunamadı.";
    }

    const gladiator = get().gladiators.find(
      (item) => item.id === event.gladiatorId,
    );

    if (!gladiator) {
      return "Gladyatör bulunamadı.";
    }

    let message = "Kararın uygulandı.";

    /*
    ÖZGÜRLÜK TALEBİ
  */

    if (event.type === "freedom_request") {
      if (decision === "grant_freedom") {
        set((state) => ({
          gladiators: state.gladiators.map((item) =>
            item.id === gladiator.id
              ? {
                  ...item,

                  ludusId: "",

                  status: "free",

                  morale: 100,
                  loyalty: 100,
                }
              : item,
          ),

          gameEvents: state.gameEvents.map((item) =>
            item.id === eventId
              ? {
                  ...item,

                  status: "resolved",

                  resolution: decision,
                }
              : item,
          ),
        }));

        return `${gladiator.name} özgürlüğüne kavuştu ve Ludus'tan ayrıldı.`;
      }

      if (decision === "deny_freedom") {
        set((state) => ({
          gladiators: state.gladiators.map((item) =>
            item.id === gladiator.id
              ? {
                  ...item,

                  morale: clampValue(item.morale - 8),

                  loyalty: clampValue(item.loyalty - 12),
                }
              : item,
          ),

          gameEvents: state.gameEvents.map((item) =>
            item.id === eventId
              ? {
                  ...item,

                  status: "resolved",

                  resolution: decision,
                }
              : item,
          ),
        }));

        return `${gladiator.name}'ın özgürlük talebi reddedildi. Moral ve sadakati düştü.`;
      }
    }

    /*
    KAÇIŞ GİRİŞİMİ
  */

    if (event.type === "escape_attempt") {
      if (decision === "forgive_escape") {
        set((state) => ({
          gladiators: state.gladiators.map((item) =>
            item.id === gladiator.id
              ? {
                  ...item,

                  morale: clampValue(item.morale + 8),

                  loyalty: clampValue(item.loyalty + 6),
                }
              : item,
          ),

          gameEvents: state.gameEvents.map((item) =>
            item.id === eventId
              ? {
                  ...item,

                  status: "resolved",

                  resolution: decision,
                }
              : item,
          ),
        }));

        return `${gladiator.name} affedildi. Moral ve sadakati yükseldi.`;
      }

      if (decision === "punish_escape") {
        set((state) => ({
          gladiators: state.gladiators.map((item) =>
            item.id === gladiator.id
              ? {
                  ...item,

                  morale: clampValue(item.morale - 12),

                  loyalty: clampValue(item.loyalty - 10),

                  fatigue: Math.min(100, item.fatigue + 15),
                }
              : item,
          ),

          gameEvents: state.gameEvents.map((item) =>
            item.id === eventId
              ? {
                  ...item,

                  status: "resolved",

                  resolution: decision,
                }
              : item,
          ),
        }));

        return `${gladiator.name} cezalandırıldı. Kaçış girişiminin bedelini ödedi.`;
      }
    }

    /*
    İSYAN
  */

    if (event.type === "rebellion") {
      if (decision === "release_rebel") {
        set((state) => ({
          gladiators: state.gladiators.map((item) =>
            item.id === gladiator.id
              ? {
                  ...item,

                  ludusId: "",

                  status: "free",

                  morale: 100,
                  loyalty: 100,
                }
              : item,
          ),

          gameEvents: state.gameEvents.map((item) =>
            item.id === eventId
              ? {
                  ...item,

                  status: "resolved",

                  resolution: decision,
                }
              : item,
          ),
        }));

        return `${gladiator.name} serbest bırakıldı. İsyan tehlikesi sona erdi.`;
      }

      if (decision === "suppress_rebellion") {
        const guardCaptain = get().ludusStaff.find(
          (staff) => staff.role === "guard_captain" && staff.hired,
        );

        const securityBonus = guardCaptain?.securityBonus ?? 0;

        /*
        Temel başarı %65.
        Muhafız Kaptanı güvenlik
        bonusuyla başarı ihtimalini artırır.
      */

        const successChance = Math.min(95, 65 + securityBonus);

        const success = Math.random() * 100 < successChance;

        if (success) {
          set((state) => ({
            gladiators: state.gladiators.map((item) =>
              item.id === gladiator.id
                ? {
                    ...item,

                    morale: clampValue(item.morale - 15),

                    loyalty: clampValue(item.loyalty - 20),

                    fatigue: Math.min(
                      100,

                      item.fatigue + 20,
                    ),
                  }
                : item,
            ),

            gameEvents: state.gameEvents.map((item) =>
              item.id === eventId
                ? {
                    ...item,

                    status: "resolved",

                    resolution: decision,
                  }
                : item,
            ),
          }));

          return guardCaptain
            ? `Muhafız Kaptanı'nın desteğiyle ${gladiator.name}'ın isyanı bastırıldı.`
            : `${gladiator.name}'ın isyanı bastırıldı.`;
        }

        /*
        Bastırma başarısız:
        gladyatör kaçıyor.
      */

        set((state) => ({
          gladiators: state.gladiators.map((item) =>
            item.id === gladiator.id
              ? {
                  ...item,

                  ludusId: "",

                  status: "free",
                }
              : item,
          ),

          gameEvents: state.gameEvents.map((item) =>
            item.id === eventId
              ? {
                  ...item,

                  status: "resolved",

                  resolution: decision,
                }
              : item,
          ),
        }));

        return `İsyan bastırılamadı. ${gladiator.name} Ludus'tan kaçtı!`;
      }
    }

    return message;
  },

  visitTavern: (gladiatorId) => {
    const ludus = get().playerLudus;

    if (!ludus) {
      return "Ludus bulunamadı.";
    }

    if (get().pendingTavernEvent) {
      return "Önce bekleyen Taverna olayındaki kararını vermelisin.";
    }

    const gladiator = get().gladiators.find((item) => item.id === gladiatorId);

    if (!gladiator || gladiator.ludusId !== ludus.id) {
      return "Gladyatör bulunamadı.";
    }

    if (gladiator.status !== "active" || gladiator.hp <= 0) {
      return "Bu gladyatör şu anda Taverna'ya gidemez.";
    }

    if (gladiator.morale >= 100) {
      return `${gladiator.name} zaten maksimum morale sahip.`;
    }

    const tavernCost = 50;
    const actionCost = 1;
    const baseMoraleGain = 10;

    if (ludus.denarius < tavernCost) {
      return "Taverna için yeterli Denarius'un yok.";
    }

    if (ludus.actionPoints < actionCost) {
      return "Taverna için yeterli aksiyon puanın yok.";
    }

    const tavernEvent = createTavernEvent();

    /*
      Ziyaretin garanti bedeli ve +10 moral etkisi
      her durumda hemen uygulanır.
    */
    set((state) => ({
      playerLudus: {
        ...ludus,
        denarius: ludus.denarius - tavernCost,
        actionPoints: ludus.actionPoints - actionCost,
      },

      gladiators: state.gladiators.map((item) =>
        item.id === gladiatorId
          ? {
              ...item,
              morale: clampValue(item.morale + baseMoraleGain),
            }
          : item,
      ),
    }));

    if (!tavernEvent) {
      return `${gladiator.name} Taverna'da vakit geçirdi. Moral +${baseMoraleGain}. Bu gece olağan geçti.`;
    }

    /*
      SEÇİMLİ OLAY
      Etkiler oyuncu karar verene kadar uygulanmaz.
    */
    if (tavernEvent.kind === "choice") {
      set({
        pendingTavernEvent: {
          event: tavernEvent,
          gladiatorId,
        },
      });

      return `${tavernEvent.title}\n\n${tavernEvent.description}\n\nBir karar vermen gerekiyor.`;
    }

    /*
      ANLIK OLAY
    */
    set((state) => ({
      playerLudus: state.playerLudus
        ? {
            ...state.playerLudus,
            denarius: Math.max(
              0,
              state.playerLudus.denarius + tavernEvent.denariusChange,
            ),
            fame: Math.max(0, state.playerLudus.fame + tavernEvent.fameChange),
          }
        : state.playerLudus,

      gladiators: state.gladiators.map((item) =>
        item.id === gladiatorId
          ? {
              ...item,
              morale: clampValue(item.morale + tavernEvent.moraleChange),
              loyalty: clampValue(item.loyalty + tavernEvent.loyaltyChange),
            }
          : item,
      ),
    }));

    const effects: string[] = [];

    const totalMoraleChange = baseMoraleGain + tavernEvent.moraleChange;

    if (totalMoraleChange !== 0) {
      effects.push(
        `Moral ${totalMoraleChange > 0 ? "+" : ""}${totalMoraleChange}`,
      );
    }

    if (tavernEvent.loyaltyChange !== 0) {
      effects.push(
        `Sadakat ${tavernEvent.loyaltyChange > 0 ? "+" : ""}${tavernEvent.loyaltyChange}`,
      );
    }

    if (tavernEvent.denariusChange !== 0) {
      effects.push(
        `Denarius ${tavernEvent.denariusChange > 0 ? "+" : ""}${tavernEvent.denariusChange}`,
      );
    }

    if (tavernEvent.fameChange !== 0) {
      effects.push(
        `Şöhret ${tavernEvent.fameChange > 0 ? "+" : ""}${tavernEvent.fameChange}`,
      );
    }

    const effectText =
      effects.length > 0 ? `\n\nSonuç: ${effects.join(" • ")}` : "";

    return `${tavernEvent.title}\n\n${tavernEvent.description}${effectText}`;
  },

  resolveTavernChoice: (optionId) => {
    const pending = get().pendingTavernEvent;
    const ludus = get().playerLudus;

    if (!pending) {
      return "Bekleyen bir Taverna olayı yok.";
    }

    if (!ludus) {
      return "Ludus bulunamadı.";
    }

    const option = pending.event.options.find((item) => item.id === optionId);

    if (!option) {
      return "Seçenek bulunamadı.";
    }

    const gladiator = get().gladiators.find(
      (item) => item.id === pending.gladiatorId,
    );

    if (!gladiator) {
      set({ pendingTavernEvent: null });
      return "Gladyatör bulunamadı.";
    }

    set((state) => ({
      playerLudus: state.playerLudus
        ? {
            ...state.playerLudus,
            denarius: Math.max(
              0,
              state.playerLudus.denarius + option.denariusChange,
            ),
            fame: Math.max(0, state.playerLudus.fame + option.fameChange),
          }
        : state.playerLudus,

      gladiators: state.gladiators.map((item) =>
        item.id === pending.gladiatorId
          ? {
              ...item,
              morale: clampValue(item.morale + option.moraleChange),
              loyalty: clampValue(item.loyalty + option.loyaltyChange),
            }
          : item,
      ),

      pendingTavernEvent: null,
    }));

    get().refreshAchievements();

    const effects: string[] = [];

    if (option.moraleChange !== 0) {
      effects.push(
        `Moral ${option.moraleChange > 0 ? "+" : ""}${option.moraleChange}`,
      );
    }

    if (option.loyaltyChange !== 0) {
      effects.push(
        `Sadakat ${option.loyaltyChange > 0 ? "+" : ""}${option.loyaltyChange}`,
      );
    }

    if (option.denariusChange !== 0) {
      effects.push(
        `Denarius ${option.denariusChange > 0 ? "+" : ""}${option.denariusChange}`,
      );
    }

    if (option.fameChange !== 0) {
      effects.push(
        `Şöhret ${option.fameChange > 0 ? "+" : ""}${option.fameChange}`,
      );
    }

    const effectText =
      effects.length > 0 ? `\n\nSonuç: ${effects.join(" • ")}` : "";

    return `${option.resultText}${effectText}`;
  },

  playDiceGame: (bet) => {
    const ludus = get().playerLudus;

    if (!ludus) {
      return "Ludus bulunamadı.";
    }

    if (![50, 100, 250].includes(bet)) {
      return "Geçersiz bahis.";
    }

    if (ludus.denarius < bet) {
      return "Yeterli Denarius yok.";
    }

    if (ludus.actionPoints < 1) {
      return "Yeterli aksiyon puanın yok.";
    }

    const playerRoll = Math.floor(Math.random() * 6) + 1;

    const houseRoll = Math.floor(Math.random() * 6) + 1;

    let denariusChange = 0;

    let resultText = "";

    if (playerRoll > houseRoll) {
      denariusChange = bet;

      resultText = `Sen ${playerRoll} attın, kasa ${houseRoll} attı.\n\nKazandın! +${bet} D`;
    } else if (playerRoll < houseRoll) {
      denariusChange = -bet;

      resultText = `Sen ${playerRoll} attın, kasa ${houseRoll} attı.\n\nKaybettin! -${bet} D`;
    } else {
      resultText = `Sen ${playerRoll} attın, kasa ${houseRoll} attı.\n\nBerabere. Paran değişmedi.`;
    }

    set({
      playerLudus: {
        ...ludus,

        denarius: Math.max(0, ludus.denarius + denariusChange),

        actionPoints: ludus.actionPoints - 1,
      },
    });

    get().refreshAchievements();

    return resultText;
  },

  startTwentyOne: () => {
    const ludus = get().playerLudus;
    const currentGame = get().twentyOneGame;

    if (!ludus) return "Ludus bulunamadı.";

    if (currentGame.active && !currentGame.finished) {
      return "Önce devam eden 21 oyununu bitirmelisin.";
    }

    const bet = 100;

    if (ludus.denarius < bet) return "Yeterli Denarius yok.";
    if (ludus.actionPoints < 1) return "Yeterli aksiyon puanın yok.";

    const playerScore = Math.floor(Math.random() * 10) + 4;

    const houseScore = Math.floor(Math.random() * 10) + 4;

    set({
      playerLudus: {
        ...ludus,
        denarius: ludus.denarius - bet,
        actionPoints: ludus.actionPoints - 1,
      },

      twentyOneGame: {
        active: true,
        playerScore,
        houseScore,
        bet,
        finished: false,
        result: null,
      },
    });

    return `21 başladı. İlk skorun: ${playerScore}. 100 D bahis yatırıldı.`;
  },

  hitTwentyOne: () => {
    const game = get().twentyOneGame;

    if (!game.active || game.finished) {
      return "Aktif bir 21 oyunu yok.";
    }

    const card = Math.floor(Math.random() * 10) + 1;
    const newScore = game.playerScore + card;

    if (newScore > 21) {
      set({
        twentyOneGame: {
          ...game,
          playerScore: newScore,
          finished: true,
          result: "lose",
        },
      });

      return `Kart: ${card}\nSkorun: ${newScore}\n\n21'i geçtin. Kaybettin!`;
    }

    set({
      twentyOneGame: {
        ...game,
        playerScore: newScore,
      },
    });

    if (newScore === 21) {
      return `Kart: ${card}\nSkorun: 21\n\nTam 21! İstersen DUR diyerek kasanın oyununu başlat.`;
    }

    return `Kart: ${card}\nYeni skorun: ${newScore}`;
  },

  standTwentyOne: () => {
    const ludus = get().playerLudus;
    const game = get().twentyOneGame;

    if (!ludus) return "Ludus bulunamadı.";

    if (!game.active || game.finished) {
      return "Aktif bir 21 oyunu yok.";
    }

    let houseScore = game.houseScore;

    while (houseScore < 17) {
      houseScore += Math.floor(Math.random() * 10) + 1;
    }

    let result: "win" | "lose" | "draw";
    let payout = 0;
    let resultText = "";

    if (houseScore > 21 || game.playerScore > houseScore) {
      result = "win";
      payout = 220;
      resultText = `Sen: ${game.playerScore}\nKasa: ${houseScore}\n\nKazandın! 220 D ödeme aldın.`;
    } else if (game.playerScore < houseScore) {
      result = "lose";
      resultText = `Sen: ${game.playerScore}\nKasa: ${houseScore}\n\nKaybettin. 100 D bahsin gitti.`;
    } else {
      result = "draw";
      payout = game.bet;
      resultText = `Sen: ${game.playerScore}\nKasa: ${houseScore}\n\nBerabere. 100 D bahsin iade edildi.`;
    }

    set({
      playerLudus: {
        ...ludus,
        denarius: ludus.denarius + payout,
      },

      twentyOneGame: {
        ...game,
        houseScore,
        finished: true,
        result,
      },
    });

    get().refreshAchievements();

    return resultText;
  },

  checkDailyReward: async () => {
    const today = getTodayDateKey();
    const available = get().lastDailyRewardDate !== today;

    set({
      dailyRewardAvailable: available,
    });

    return available;
  },

  claimDailyReward: async () => {
    const ludus = get().playerLudus;

    if (!ludus) {
      return "Ludus bulunamadı.";
    }

    const today = getTodayDateKey();

    if (get().lastDailyRewardDate === today) {
      set({
        dailyRewardAvailable: false,
      });

      return "Bugünkü günlük ödülünü zaten aldın.";
    }

    const reward = getRandomDailyReward();

    set((state) => {
      if (!state.playerLudus) {
        return {
          dailyRewardAvailable: false,
          lastDailyReward: reward,
          lastDailyRewardDate: today,
        };
      }

      let denarius = state.playerLudus.denarius;
      let actionPoints = state.playerLudus.actionPoints;
      let fame = state.playerLudus.fame;

      if (reward.type === "denarius") {
        denarius += reward.amount;
      }

      if (reward.type === "action_points") {
        actionPoints += reward.amount;
      }

      if (reward.type === "fame") {
        fame += reward.amount;
      }

      return {
        playerLudus: {
          ...state.playerLudus,
          denarius,
          actionPoints,
          fame,
        },

        dailyRewardAvailable: false,
        lastDailyReward: reward,
        lastDailyRewardDate: today,
      };
    });

    get().refreshAchievements();

    if (reward.type === "denarius") {
      return `Günlük ödül: +${reward.amount} Denarius!`;
    }

    if (reward.type === "action_points") {
      return `Günlük ödül: +${reward.amount} Aksiyon Puanı!`;
    }

    return `Günlük ödül: +${reward.amount} Şöhret!`;
  },

  claimRewardedAd: (type) => {
    const state = get();
    const ludus = state.playerLudus;

    if (!ludus) {
      return "Ludus bulunamadı.";
    }

    if (state.bankruptcyState.bankrupt) {
      return "Ludus iflas ettiği için ödüllü reklam kullanılamaz.";
    }

    if (!canWatchRewardedAd(state.rewardedAdUsage, type)) {
      return "Bu ödül için günlük reklam hakkını doldurdun.";
    }

    const reward = getRewardedAdReward(type);
    const nextUsage = registerRewardedAdWatch(state.rewardedAdUsage, type);

    if (type === "action_point") {
      set({
        playerLudus: {
          ...ludus,
          actionPoints: ludus.actionPoints + reward.amount,
        },
        rewardedAdUsage: nextUsage,
      });

      return `Ödüllü reklam tamamlandı. +${reward.amount} Aksiyon Puanı!`;
    }

    set({
      playerLudus: {
        ...ludus,
        denarius: ludus.denarius + reward.amount,
      },
      rewardedAdUsage: nextUsage,
    });

    return `Ödüllü reklam tamamlandı. +${reward.amount} Denarius!`;
  },

  spendActionPoints: (amount) => {
    const ludus = get().playerLudus;

    if (!ludus || ludus.actionPoints < amount) {
      return false;
    }

    set({
      playerLudus: {
        ...ludus,

        actionPoints: ludus.actionPoints - amount,
      },
    });

    return true;
  },

  endDay: () => {
    const world = get().world;

    const ludus = get().playerLudus;

    if (!world || !ludus) {
      return;
    }

    if (get().bankruptcyState.bankrupt) {
      return;
    }

    /*
        MEDICUS
      */

    const medicus = get().ludusStaff.find(
      (staff) => staff.role === "medicus" && staff.hired,
    );

    const medicusHealingBonus = medicus?.healingBonus ?? 0;

    /*
        GLADYATÖR OLAYLARI
      */

    const currentEvents = get().gameEvents;

    const newEvents: GameEvent[] = [];

    const playerGladiators = get().gladiators.filter(
      (gladiator) =>
        gladiator.ludusId === ludus.id &&
        gladiator.status !== "dead" &&
        gladiator.status !== "retired",
    );

    playerGladiators.forEach((gladiator) => {
      /*
            Aynı gladyatörün bekleyen
            bir olayı varsa tekrar üretme.
          */

      const hasPendingEvent = currentEvents.some(
        (event) =>
          event.gladiatorId === gladiator.id && event.status === "pending",
      );

      if (hasPendingEvent) {
        return;
      }

      const rebellionRisk = calculateGladiatorRebellionRisk({
        gladiator,

        staff: get().ludusStaff,
      });

      const event = createGladiatorEvent({
        gladiator,

        currentDay: world.currentDay,

        rebellionRisk,
      });

      if (event) {
        newEvents.push(event);
      }
    });

    /*
        GÜNLÜK GİDERLER
      */

    const dailyExpenses = calculateDailyExpenses({
      gladiators: get().gladiators,

      ludusId: ludus.id,

      staff: get().ludusStaff,

      workers: get().ludusWorkers,
    });

    /*
        GÜNLÜK PASİF GELİR
      */

    const dailyIncome = calculateDailyIncome({
      workers: get().ludusWorkers,
    });

    /*
        GÜN SONU PARA
      */

    const newDenarius =
      ludus.denarius + dailyIncome.totalIncome - dailyExpenses.totalCost;

    const bankruptcyResult = processDailyBankruptcy({
      denarius: newDenarius,
      previousState: get().bankruptcyState,
    });

    const newPrestige = Math.max(
      0,
      ludus.prestige - bankruptcyResult.prestigePenalty,
    );

    const newOrder = clampValue(ludus.order - bankruptcyResult.orderPenalty);

    /*
        İNŞAAT İLERLEMESİ

        Her gün temel olarak 1 günlük iş tamamlanır.
        İnşaat işçileri bu ilerlemeyi hızlandırır.
      */

    const builderDailyProgress = getBuilderDailyProgress(get().ludusWorkers);

    let completedBuildCount = 0;
    let completedUpgradeCount = 0;

    const nextBuildings = get().ludusBuildings.map((building) => {
      if (
        building.constructionType === null ||
        building.constructionDaysRemaining <= 0
      ) {
        return building;
      }

      const remaining = Math.max(
        0,
        building.constructionDaysRemaining - builderDailyProgress,
      );

      if (remaining > 0) {
        return {
          ...building,
          constructionDaysRemaining: remaining,
        };
      }

      if (building.constructionType === "build") {
        completedBuildCount += 1;

        return {
          ...building,
          isBuilt: true,
          level: building.constructionTargetLevel ?? 1,
          constructionType: null,
          constructionDaysRemaining: 0,
          constructionTargetLevel: null,
        };
      }

      completedUpgradeCount += 1;

      return {
        ...building,
        level: building.constructionTargetLevel ?? building.level + 1,
        constructionType: null,
        constructionDaysRemaining: 0,
        constructionTargetLevel: null,
      };
    });

    const constructionPrestige =
      completedBuildCount * LUDUS_PRESTIGE_REWARDS.buildingBuilt +
      completedUpgradeCount * LUDUS_PRESTIGE_REWARDS.buildingUpgrade;

    const finalPrestige = newPrestige + constructionPrestige;
    const finalLevel = calculateLudusLevel(finalPrestige);

    set((state) => ({
      world: {
        ...world,

        currentDay: world.currentDay + 1,
      },

      playerLudus: {
        ...ludus,

        denarius: newDenarius,

        prestige: finalPrestige,

        level: finalLevel,

        order: newOrder,

        actionPoints: ludus.maxActionPoints,
      },

      ludusBuildings: nextBuildings,

      gameStatistics:
        completedBuildCount > 0
          ? {
              ...state.gameStatistics,
              buildingsBuilt:
                state.gameStatistics.buildingsBuilt + completedBuildCount,
            }
          : state.gameStatistics,

      lastDailyExpenses: dailyExpenses,

      lastDailyIncome: dailyIncome,

      bankruptcyState: bankruptcyResult.state,

      lastFinancialMessage: bankruptcyResult.message,

      gameEvents: [...state.gameEvents, ...newEvents],

      gladiators: state.gladiators.map((gladiator) => {
        /*
                ÖLÜ
              */

        if (gladiator.status === "dead") {
          return gladiator;
        }

        const newFatigue = Math.max(
          0,

          gladiator.fatigue - 15,
        );

        /*
                SAĞLIKLI
              */

        if (gladiator.status !== "injured") {
          return {
            ...gladiator,

            fatigue: newFatigue,

            hp: Math.min(
              gladiator.maxHp,

              gladiator.hp + 10,
            ),
          };
        }

        /*
                YARALI
              */

        let healingAmount = 18;

        if (gladiator.injurySeverity === "minor") {
          healingAmount = 25;
        }

        if (gladiator.injurySeverity === "moderate") {
          healingAmount = 18;
        }

        if (gladiator.injurySeverity === "severe") {
          healingAmount = 12;
        }

        const newHp = Math.min(
          gladiator.maxHp,

          gladiator.hp + healingAmount + medicusHealingBonus,
        );

        const newDaysRemaining = Math.max(
          0,

          gladiator.injuryDaysRemaining - 1,
        );

        /*
                İYİLEŞTİ
              */

        if (newDaysRemaining === 0) {
          return {
            ...gladiator,

            hp: newHp,

            fatigue: newFatigue,

            status: "active",

            injurySeverity: null,

            injuryDaysRemaining: 0,
          };
        }

        return {
          ...gladiator,

          hp: newHp,

          fatigue: newFatigue,

          status: "injured",

          injuryDaysRemaining: newDaysRemaining,
        };
      }),

      currentArenaOpponent: null,
      pendingTavernEvent: null,

      rewardedAdUsage: createInitialRewardedAdUsage(),

      twentyOneGame: {
        active: false,
        playerScore: 0,
        houseScore: 0,
        bet: 100,
        finished: false,
        result: null,
      },
    }));

    get().refreshAchievements();
  },

  resetGame: () => {
    void deleteGameSave().catch((error) => {
      console.error("Kayıt silinemedi:", error);
    });

    set({
      world: null,
      playerLudus: null,

      gladiators: [],
      aiLuduses: [],

      ludusBuildings: [],
      ludusStaff: [],
      ludusWorkers: [],

      inventory: [],

      currentArenaOpponent: null,

      lastDailyExpenses: null,

      lastDailyIncome: null,

      bankruptcyState: createInitialBankruptcyState(),

      lastFinancialMessage: null,

      dailyRewardAvailable: false,
      lastDailyReward: null,
      lastDailyRewardDate: null,

      rewardedAdUsage: createInitialRewardedAdUsage(),

      hasSavedGame: false,
      isSaveLoading: false,
      lastSaveAt: null,

      gameEvents: [],

      gameStatistics: {
        arenaWins: 0,
        gladiatorsPurchased: 0,
        trainingsCompleted: 0,
        buildingsBuilt: 0,
        staffHired: 0,
        workersHired: 0,
      },

      achievementProgress: createAchievementProgress(),

      pendingTavernEvent: null,

      twentyOneGame: {
        active: false,
        playerScore: 0,
        houseScore: 0,
        bet: 100,
        finished: false,
        result: null,
      },
    });
  },
}));

const AUTO_SAVE_DELAY_MS = 350;

let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

function didSaveableGameStateChange(
  state: GameState,
  previousState: GameState,
): boolean {
  return (
    state.world !== previousState.world ||
    state.playerLudus !== previousState.playerLudus ||
    state.aiLuduses !== previousState.aiLuduses ||
    state.gladiators !== previousState.gladiators ||
    state.ludusBuildings !== previousState.ludusBuildings ||
    state.ludusStaff !== previousState.ludusStaff ||
    state.ludusWorkers !== previousState.ludusWorkers ||
    state.inventory !== previousState.inventory ||
    state.currentArenaOpponent !== previousState.currentArenaOpponent ||
    state.lastDailyExpenses !== previousState.lastDailyExpenses ||
    state.lastDailyIncome !== previousState.lastDailyIncome ||
    state.bankruptcyState !== previousState.bankruptcyState ||
    state.lastFinancialMessage !== previousState.lastFinancialMessage ||
    state.dailyRewardAvailable !== previousState.dailyRewardAvailable ||
    state.lastDailyReward !== previousState.lastDailyReward ||
    state.lastDailyRewardDate !== previousState.lastDailyRewardDate ||
    state.rewardedAdUsage !== previousState.rewardedAdUsage ||
    state.gameEvents !== previousState.gameEvents ||
    state.gameStatistics !== previousState.gameStatistics ||
    state.achievementProgress !== previousState.achievementProgress ||
    state.pendingTavernEvent !== previousState.pendingTavernEvent ||
    state.twentyOneGame !== previousState.twentyOneGame
  );
}

useGameStore.subscribe((state, previousState) => {
  if (!state.world || !state.playerLudus) {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = null;
    }

    return;
  }

  if (state.isSaveLoading) {
    return;
  }

  if (!didSaveableGameStateChange(state, previousState)) {
    return;
  }

  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = setTimeout(() => {
    autoSaveTimeout = null;
    void useGameStore.getState().saveGame();
  }, AUTO_SAVE_DELAY_MS);
});
