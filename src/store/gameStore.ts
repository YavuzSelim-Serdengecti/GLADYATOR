import { create } from "zustand";

import { generateGladiator } from "../features/gladiators/generateGladiator";
import { Gladiator, Ludus, World } from "../types/game";

interface GameState {
  world: World | null;
  playerLudus: Ludus | null;

  aiLuduses: Ludus[];
  gladiators: Gladiator[];

  createNewGame: (lanistaName: string, ludusName: string) => void;

  addGladiator: (gladiator: Gladiator) => void;

  buyGladiator: (gladiator: Gladiator, price?: number) => boolean;

  aiBuyGladiator: (
    gladiator: Gladiator,
    aiLudusId: string,
    price: number,
  ) => boolean;

  spendActionPoints: (amount: number) => boolean;

  endDay: () => void;

  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  world: null,
  playerLudus: null,

  aiLuduses: [],
  gladiators: [],

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

    /*
     * Her rakip Ludus oyuna
     * 1 başlangıç gladyatörü ile başlıyor.
     */
    const aiStartingGladiators = aiLuduses.map((aiLudus) => {
      return generateGladiator({
        worldId,
        ludusId: aiLudus.id,
        profile: "balanced",
      });
    });

    set({
      world: newWorld,
      playerLudus: newLudus,

      aiLuduses,

      gladiators: aiStartingGladiators,
    });
  },

  addGladiator: (gladiator) => {
    set((state) => ({
      gladiators: [...state.gladiators, gladiator],
    }));
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
      playerLudus: {
        ...ludus,

        denarius: ludus.denarius - finalPrice,
      },

      gladiators: [...state.gladiators, purchasedGladiator],
    }));

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

    set({
      world: {
        ...world,

        currentDay: world.currentDay + 1,
      },

      playerLudus: {
        ...ludus,

        actionPoints: ludus.maxActionPoints,
      },
    });
  },

  resetGame: () => {
    set({
      world: null,
      playerLudus: null,

      gladiators: [],
      aiLuduses: [],
    });
  },
}));
