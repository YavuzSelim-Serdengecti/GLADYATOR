import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameModal from "../src/components/GameModal";
import { arenas } from "../src/data/arenas";
import { generateArenaOpponent } from "../src/features/arena/generateArenaOpponent";

import {
  applyEndgameRewardMultiplier,
  getEndgameScaling,
} from "../src/features/endgame/endgameScaling";

import { getDynastyRank } from "../src/features/ludus/ludusLevel";
import { useGameStore } from "../src/store/gameStore";

const ARENA_ACTION_COST = 2;

export default function ArenaOpponentScreen() {
  const { arenaId, gladiatorId } = useLocalSearchParams<{
    arenaId: string;
    gladiatorId: string;
  }>();

  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const world = useGameStore((state) => state.world);
  const ludus = useGameStore((state) => state.playerLudus);
  const gladiators = useGameStore((state) => state.gladiators);

  const setCurrentArenaOpponent = useGameStore(
    (state) => state.setCurrentArenaOpponent,
  );

  const spendActionPoints = useGameStore((state) => state.spendActionPoints);

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const arena = arenas.find((item) => item.id === arenaId);

  const playerGladiator = gladiators.find((item) => item.id === gladiatorId);

  const playerPrestige = ludus?.prestige ?? 0;

  const enemy = useMemo(() => {
    if (!world || !arena || !playerGladiator) {
      return null;
    }

    return generateArenaOpponent({
      worldId: world.id,
      arena,
      playerGladiator,
      playerPrestige,
    });
  }, [world?.id, arena?.id, playerGladiator?.id, playerPrestige]);

  useEffect(() => {
    if (enemy) {
      setCurrentArenaOpponent(enemy);
    }
  }, [enemy?.id]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#DDB936" />
      </View>
    );
  }

  if (!world || !arena || !playerGladiator || !enemy || !ludus) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>DÖVÜŞ BİLGİLERİ BULUNAMADI</Text>

        <Pressable style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>GERİ DÖN</Text>
        </Pressable>
      </View>
    );
  }

  const playerPower = calculatePower(playerGladiator);
  const enemyPower = calculatePower(enemy);

  const endgameScaling = getEndgameScaling(ludus.prestige);
  const dynastyRank = getDynastyRank(ludus.prestige);

  const displayedRewardMin = applyEndgameRewardMultiplier(
    arena.rewardMin,
    endgameScaling.denariusRewardMultiplier,
  );

  const displayedRewardMax = applyEndgameRewardMultiplier(
    arena.rewardMax,
    endgameScaling.denariusRewardMultiplier,
  );

  const displayedFameReward = applyEndgameRewardMultiplier(
    arena.fameReward,
    endgameScaling.fameRewardMultiplier,
  );

  const handleStartBattle = () => {
    const success = spendActionPoints(ARENA_ACTION_COST);

    if (!success) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `Arena savaşı için ${ARENA_ACTION_COST} aksiyon puanı gerekiyor.\n\nKalan aksiyon: ${ludus.actionPoints}/${ludus.maxActionPoints}`,
      );

      return;
    }

    router.push({
      pathname: "/arena-battle",
      params: {
        arenaId: arena.id,
        gladiatorId: playerGladiator.id,
      },
    });
  };

  const insufficientActionPoints = ludus.actionPoints < ARENA_ACTION_COST;

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      {/* TOP BAR */}
      <View
        style={[
          styles.topBar,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.identity}>
          <Text style={styles.eyebrow}>ARENA KARŞILAŞMASI</Text>
          <Text style={styles.topTitle}>RAKİBİN HAZIR</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>ARENA</Text>
            <Text style={styles.contextValue} numberOfLines={1}>
              {arena.name.toUpperCase()}
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>ZORLUK</Text>
            <Text style={styles.contextValue}>
              {arena.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.resources}>
          {endgameScaling.active && dynastyRank && (
            <View style={styles.dynastyBadge}>
              <Text style={styles.dynastyBadgeText}>
                HANEDAN {dynastyRank.rank}
              </Text>
            </View>
          )}

          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

          <Text style={styles.resource}>🪙 {ludus.denarius}</Text>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← SEÇİM</Text>
          </Pressable>
        </View>
      </View>

      {/* ENDGAME BAR */}
      {endgameScaling.active && dynastyRank && (
        <View
          style={[
            styles.endgameBar,
            {
              marginLeft: safeLeft,
              marginRight: safeRight,
            },
          ]}>
          <View>
            <Text style={styles.endgameTitle}>HANEDAN ARENASI</Text>

            <Text style={styles.endgameSubtitle}>{dynastyRank.rank}</Text>
          </View>

          <View style={styles.endgameStats}>
            <Text style={styles.endgameText}>
              RAKİP +{endgameScaling.opponentStatBonus}
            </Text>

            <Text style={styles.endgameSeparator}>•</Text>

            <Text style={styles.endgameText}>
              ÖDÜL ×{endgameScaling.denariusRewardMultiplier.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* BATTLE AREA */}
      <View
        style={[
          styles.battleArea,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <FighterCard
          side="SENİN GLADYATÖRÜN"
          fighter={playerGladiator}
          power={playerPower}
          player
        />

        <View style={styles.vsArea}>
          <Text style={styles.vsEyebrow}>{arena.name.toUpperCase()}</Text>

          <Text style={styles.vs}>VS</Text>

          <Text style={styles.arenaDifficulty}>
            {arena.difficulty.toUpperCase()}
          </Text>

          {endgameScaling.active && (
            <Text style={styles.endgameDifficulty}>
              HANEDAN D{endgameScaling.dynastyRank}
            </Text>
          )}

          <View style={styles.costBadge}>
            <Text style={styles.actionCost}>⚡ {ARENA_ACTION_COST} AP</Text>
          </View>
        </View>

        <FighterCard
          side={endgameScaling.active ? "HANEDAN RAKİBİ" : "RAKİP"}
          fighter={enemy}
          power={enemyPower}
          enemy
          endgame={endgameScaling.active}
        />
      </View>

      {/* FOOTER */}
      <View
        style={[
          styles.footer,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.rewardArea}>
          <Text style={styles.rewardTitle}>
            {endgameScaling.active ? "HANEDAN ÖDÜLÜ" : "OLASI ÖDÜL"}
          </Text>

          <View style={styles.rewardValues}>
            <Text style={styles.rewardText}>
              🪙 {displayedRewardMin} - {displayedRewardMax} D
            </Text>

            <Text style={styles.rewardSeparator}>•</Text>

            <Text style={styles.rewardText}>★ +{displayedFameReward}</Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.fightButton,
            insufficientActionPoints && styles.disabledFightButton,
          ]}
          onPress={handleStartBattle}>
          <Text
            style={[
              styles.fightButtonText,
              insufficientActionPoints && styles.disabledFightButtonText,
            ]}>
            {insufficientActionPoints
              ? "YETERSİZ AP"
              : `DÖVÜŞÜ BAŞLAT · ${ARENA_ACTION_COST} AP`}
          </Text>
        </Pressable>
      </View>

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

function FighterCard({
  side,
  fighter,
  power,
  player = false,
  enemy = false,
  endgame = false,
}: {
  side: string;
  fighter: {
    name: string;
    age: number;
    origin: string;
    class: string;
    strength: number;
    endurance: number;
    agility: number;
    attack: number;
    defense: number;
    courage: number;
  };
  power: number;
  player?: boolean;
  enemy?: boolean;
  endgame?: boolean;
}) {
  return (
    <View style={[styles.fighterCard, endgame && styles.endgameEnemyCard]}>
      <View style={styles.fighterTop}>
        <Text
          style={[
            styles.sideLabel,
            player && styles.playerSideLabel,
            enemy && styles.enemySideLabel,
          ]}>
          {side}
        </Text>

        <Text style={styles.fighterClass}>{fighter.class.toUpperCase()}</Text>
      </View>

      <View style={styles.portrait}>
        <Text style={styles.portraitIcon}>{player ? "⚔" : "🛡"}</Text>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {fighter.name.toUpperCase()}
      </Text>

      <Text style={styles.meta}>
        {fighter.age} YAŞ · {fighter.origin.toUpperCase()}
      </Text>

      <View style={styles.divider} />

      <View style={styles.statsGrid}>
        <Stat label="GÜÇ" value={fighter.strength} />
        <Stat label="DAYANIKLILIK" value={fighter.endurance} />
        <Stat label="ÇEVİKLİK" value={fighter.agility} />
        <Stat label="SALDIRI" value={fighter.attack} />
        <Stat label="SAVUNMA" value={fighter.defense} />
        <Stat label="CESARET" value={fighter.courage} />
      </View>

      <View style={styles.powerArea}>
        <Text style={styles.powerLabel}>ORTALAMA GÜÇ</Text>

        <Text style={styles.powerValue}>{power}</Text>
      </View>
    </View>
  );
}

function calculatePower(gladiator: {
  strength: number;
  endurance: number;
  agility: number;
  attack: number;
  defense: number;
  courage: number;
}) {
  return Math.round(
    (gladiator.strength +
      gladiator.endurance +
      gladiator.agility +
      gladiator.attack +
      gladiator.defense +
      gladiator.courage) /
      6,
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0906",
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#15110C",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B0906",
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    backgroundColor: "#0B0906",
    alignItems: "center",
    justifyContent: "center",
  },

  error: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    marginBottom: 12,
  },

  errorButton: {
    height: 34,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  errorButtonText: {
    color: "#C1A14E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  topBar: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#100D08",
    borderBottomWidth: 1,
    borderBottomColor: "#332A1A",
  },

  identity: {
    width: 200,
  },

  eyebrow: {
    color: "#75673E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.2,
  },

  topTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 1,
  },

  contextArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  contextItem: {
    minWidth: 60,
    maxWidth: 115,
    alignItems: "center",
  },

  contextLabel: {
    color: "#6E6658",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  contextValue: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    marginTop: 1,
  },

  contextDivider: {
    width: 1,
    height: 23,
    backgroundColor: "#332C1D",
  },

  resources: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 9,
  },

  resource: {
    color: "#D9CFB5",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
  },

  dynastyBadge: {
    height: 27,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 3,
    backgroundColor: "#1C170E",
    alignItems: "center",
    justifyContent: "center",
  },

  dynastyBadgeText: {
    color: "#DDB936",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  backButton: {
    height: 30,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#C1A14E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  endgameBar: {
    height: 38,
    marginTop: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#5E4E29",
    borderRadius: 4,
    backgroundColor: "#17130C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  endgameTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    letterSpacing: 1,
  },

  endgameSubtitle: {
    color: "#837249",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 1,
  },

  endgameStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  endgameText: {
    color: "#B89A52",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  endgameSeparator: {
    color: "#65583B",
    fontSize: 8,
  },

  battleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 7,
  },

  fighterCard: {
    width: 220,
    height: 238,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 10,
  },

  endgameEnemyCard: {
    borderColor: "#80632F",
  },

  fighterTop: {
    height: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sideLabel: {
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.8,
  },

  playerSideLabel: {
    color: "#8FAF72",
  },

  enemySideLabel: {
    color: "#B56D5C",
  },

  fighterClass: {
    color: "#9C8243",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  portrait: {
    height: 38,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291C",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  portraitIcon: {
    color: "#B99B4D",
    fontSize: 18,
  },

  name: {
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },

  meta: {
    color: "#77716A",
    fontSize: 7,
    textAlign: "center",
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 6,
  },

  statsGrid: {
    gap: 1,
  },

  statRow: {
    minHeight: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statLabel: {
    color: "#817C74",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  statValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  powerArea: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#332C1D",
    paddingTop: 5,
  },

  powerLabel: {
    color: "#77716A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  powerValue: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
  },

  vsArea: {
    width: 92,
    alignItems: "center",
  },

  vsEyebrow: {
    maxWidth: 90,
    color: "#6F6656",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    textAlign: "center",
  },

  vs: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 28,
    marginTop: 2,
  },

  arenaDifficulty: {
    color: "#8A8172",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 2,
  },

  endgameDifficulty: {
    color: "#DDB936",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 4,
  },

  costBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#5E4E29",
    borderRadius: 3,
    backgroundColor: "#17130C",
  },

  actionCost: {
    color: "#B99B4D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  footer: {
    height: 50,
    borderTopWidth: 1,
    borderTopColor: "#332C1D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rewardArea: {
    flex: 1,
  },

  rewardTitle: {
    color: "#77716A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  rewardValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },

  rewardText: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
  },

  rewardSeparator: {
    color: "#65583B",
    fontSize: 8,
  },

  fightButton: {
    width: 190,
    height: 34,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  fightButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    letterSpacing: 0.4,
  },

  disabledFightButton: {
    backgroundColor: "#29251D",
    borderWidth: 1,
    borderColor: "#4B4435",
  },

  disabledFightButtonText: {
    color: "#716B5E",
  },
});
