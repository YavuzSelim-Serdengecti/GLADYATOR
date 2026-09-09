import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { arenas } from "../src/data/arenas";

import {
  chooseEnemyAction,
  createBattleFighter,
  performAttack,
  performDefend,
} from "../src/features/arena/battleEngine";

import {
  applyEndgameRewardMultiplier,
  getEndgameScaling,
} from "../src/features/endgame/endgameScaling";

import { applyEquipmentBonuses } from "../src/features/equipment/getEquipmentBonuses";

import { useGameStore } from "../src/store/gameStore";
import { randomInt } from "../src/utils/random";

type BattleTurn = "player" | "enemy";

export default function ArenaBattleScreen() {
  const { arenaId, gladiatorId } = useLocalSearchParams<{
    arenaId: string;
    gladiatorId: string;
  }>();

  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const gladiators = useGameStore((state) => state.gladiators);
  const inventory = useGameStore((state) => state.inventory);
  const ludus = useGameStore((state) => state.playerLudus);

  const currentArenaOpponent = useGameStore(
    (state) => state.currentArenaOpponent,
  );

  const applyArenaResult = useGameStore((state) => state.applyArenaResult);

  const arena = arenas.find((item) => item.id === arenaId);

  const playerGladiator = gladiators.find((item) => item.id === gladiatorId);

  const initialPlayer = useMemo(() => {
    if (!playerGladiator) {
      return null;
    }

    const equippedGladiator = applyEquipmentBonuses(playerGladiator, inventory);

    return createBattleFighter(equippedGladiator);
  }, [playerGladiator?.id, inventory]);

  const initialEnemy = useMemo(() => {
    if (!currentArenaOpponent) {
      return null;
    }

    return createBattleFighter(currentArenaOpponent);
  }, [currentArenaOpponent?.id]);

  const [player, setPlayer] = useState(initialPlayer);
  const [enemy, setEnemy] = useState(initialEnemy);

  const [battleLog, setBattleLog] = useState<string[]>([
    "Dövüş başladı. İlk hamle senin.",
  ]);

  const [isFinished, setIsFinished] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);

  const [turn, setTurn] = useState<BattleTurn>("player");

  const [reward, setReward] = useState({
    denarius: 0,
    fame: 0,
    experience: 0,
  });

  const resultApplied = useRef(false);

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#DDB936" />
      </View>
    );
  }

  if (!arena || !playerGladiator || !player || !enemy || !ludus) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>DÖVÜŞ BİLGİLERİ BULUNAMADI</Text>

        <Pressable
          style={styles.errorButton}
          onPress={() => router.replace("/arena")}>
          <Text style={styles.errorButtonText}>ARENALARA DÖN</Text>
        </Pressable>
      </View>
    );
  }

  const endgameScaling = getEndgameScaling(ludus.prestige);

  const finishBattle = (won: boolean, remainingHp: number) => {
    if (resultApplied.current) {
      return;
    }

    resultApplied.current = true;

    const baseDenariusReward = won
      ? randomInt(arena.rewardMin, arena.rewardMax)
      : 0;

    const baseFameReward = won ? arena.fameReward : 0;
    const basePrestigeReward = won ? 10 : 0;

    const denariusReward = won
      ? applyEndgameRewardMultiplier(
          baseDenariusReward,
          endgameScaling.denariusRewardMultiplier,
        )
      : 0;

    const fameReward = won
      ? applyEndgameRewardMultiplier(
          baseFameReward,
          endgameScaling.fameRewardMultiplier,
        )
      : 0;

    const prestigeReward = won
      ? applyEndgameRewardMultiplier(
          basePrestigeReward,
          endgameScaling.prestigeRewardMultiplier,
        )
      : 0;

    const experienceReward = won ? 40 : 15;

    applyArenaResult(
      playerGladiator.id,
      won,
      Math.max(0, remainingHp),
      denariusReward,
      fameReward,
      experienceReward,
      arena.deathRisk,
    );

    if (prestigeReward > 0) {
      useGameStore.getState().addPrestige(prestigeReward);
    }

    setReward({
      denarius: denariusReward,
      fame: fameReward,
      experience: experienceReward,
    });

    setPlayerWon(won);
    setIsFinished(true);

    setBattleLog((current) => [
      ...current,
      won
        ? `${playerGladiator.name} dövüşü kazandı!`
        : `${playerGladiator.name} dövüşü kaybetti.`,
    ]);

    if (won && endgameScaling.active) {
      setBattleLog((current) => [
        ...current,
        `Hanedan bonusu uygulandı: +${prestigeReward} Prestij.`,
      ]);
    }
  };

  const runEnemyTurn = (
    updatedPlayer: NonNullable<typeof player>,
    updatedEnemy: NonNullable<typeof enemy>,
  ) => {
    setTurn("enemy");

    setTimeout(() => {
      if (
        updatedPlayer.currentHp <= 0 ||
        updatedEnemy.currentHp <= 0 ||
        resultApplied.current
      ) {
        return;
      }

      const action = chooseEnemyAction(updatedEnemy);

      let message = "";

      if (action === "attack") {
        const result = performAttack(updatedEnemy, updatedPlayer);

        message = result.message;
      } else {
        const result = performDefend(updatedEnemy);
        message = result.message;
      }

      setBattleLog((current) => [...current, message]);

      setPlayer({
        ...updatedPlayer,
      });

      setEnemy({
        ...updatedEnemy,
      });

      if (updatedPlayer.currentHp <= 0) {
        finishBattle(false, updatedPlayer.currentHp);
        return;
      }

      setTurn("player");

      setBattleLog((current) => [...current, "Sıra tekrar sende."]);
    }, 800);
  };

  const handleAttack = () => {
    if (isFinished || turn !== "player") {
      return;
    }

    const updatedPlayer = {
      ...player,
    };

    const updatedEnemy = {
      ...enemy,
    };

    const result = performAttack(updatedPlayer, updatedEnemy);

    setBattleLog((current) => [...current, result.message]);

    setPlayer(updatedPlayer);
    setEnemy(updatedEnemy);

    if (updatedEnemy.currentHp <= 0) {
      finishBattle(true, updatedPlayer.currentHp);
      return;
    }

    runEnemyTurn(updatedPlayer, updatedEnemy);
  };

  const handleDefend = () => {
    if (isFinished || turn !== "player") {
      return;
    }

    const updatedPlayer = {
      ...player,
    };

    const updatedEnemy = {
      ...enemy,
    };

    const result = performDefend(updatedPlayer);

    setBattleLog((current) => [...current, result.message]);

    setPlayer(updatedPlayer);

    runEnemyTurn(updatedPlayer, updatedEnemy);
  };

  const buttonsDisabled = isFinished || turn !== "player";

  const playerHpPercent = Math.max(
    0,
    Math.min(100, (player.currentHp / player.gladiator.maxHp) * 100),
  );

  const enemyHpPercent = Math.max(
    0,
    Math.min(100, (enemy.currentHp / enemy.gladiator.maxHp) * 100),
  );

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
          <Text style={styles.eyebrow}>KAN VE ŞÖHRET</Text>

          <Text style={styles.topTitle}>ARENA DÖVÜŞÜ</Text>
        </View>

        <View style={styles.arenaInfo}>
          <Text style={styles.arenaLabel}>ARENA</Text>

          <Text style={styles.arenaName}>{arena.name.toUpperCase()}</Text>
        </View>

        <View style={styles.turnArea}>
          {!isFinished ? (
            <View
              style={[
                styles.turnBadge,
                turn === "enemy" && styles.enemyTurnBadge,
              ]}>
              <Text
                style={[
                  styles.turnText,
                  turn === "enemy" && styles.enemyTurnText,
                ]}>
                {turn === "player" ? "SENİN TURUN" : "RAKİBİN TURU"}
              </Text>
            </View>
          ) : (
            <View style={styles.finishedBadge}>
              <Text style={styles.finishedText}>DÖVÜŞ TAMAMLANDI</Text>
            </View>
          )}
        </View>
      </View>

      {/* MAIN */}
      <View
        style={[
          styles.mainContent,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.fightArea}>
          {/* PLAYER */}
          <View
            style={[
              styles.fighter,
              turn === "player" && !isFinished && styles.activePlayer,
            ]}>
            <View style={styles.fighterTop}>
              <Text style={styles.playerLabel}>SENİN GLADYATÖRÜN</Text>

              <Text style={styles.className}>
                {player.gladiator.class.toUpperCase()}
              </Text>
            </View>

            <View style={styles.portrait}>
              <Text style={styles.portraitIcon}>⚔</Text>
            </View>

            <Text style={styles.name} numberOfLines={1}>
              {player.gladiator.name.toUpperCase()}
            </Text>

            <View style={styles.divider} />

            <View style={styles.hpSection}>
              <Text style={styles.barLabel}>SAĞLIK</Text>

              <Text style={styles.barValue}>
                {player.currentHp}/{player.gladiator.maxHp}
              </Text>
            </View>

            <View style={styles.hpBar}>
              <View
                style={[
                  styles.playerHpFill,
                  {
                    width: `${playerHpPercent}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.hpSection}>
              <Text style={styles.barLabel}>STAMINA</Text>

              <Text style={styles.barValue}>{player.stamina}</Text>
            </View>

            <View style={styles.staminaBar}>
              <View
                style={[
                  styles.staminaFill,
                  {
                    width: `${Math.max(0, Math.min(100, player.stamina))}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.stateArea}>
              <Text style={styles.stateLabel}>DURUM</Text>

              <Text
                style={[
                  styles.stateText,
                  player.defending && styles.defendingText,
                ]}>
                {player.defending ? "SAVUNMADA" : "HAZIR"}
              </Text>
            </View>
          </View>

          {/* CENTER */}
          <View style={styles.centerArea}>
            {!isFinished ? (
              <>
                <Text style={styles.vs}>VS</Text>

                <Text style={styles.turnLabel}>
                  {turn === "player" ? "HAMLE YAP" : "RAKİP HAMLESİNİ YAPIYOR"}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    disabled={buttonsDisabled}
                    style={[
                      styles.attackButton,
                      buttonsDisabled && styles.disabledAttack,
                    ]}
                    onPress={handleAttack}>
                    <Text
                      style={[
                        styles.attackText,
                        buttonsDisabled && styles.disabledActionText,
                      ]}>
                      SALDIR
                    </Text>
                  </Pressable>

                  <Pressable
                    disabled={buttonsDisabled}
                    style={[
                      styles.defendButton,
                      buttonsDisabled && styles.disabledDefend,
                    ]}
                    onPress={handleDefend}>
                    <Text
                      style={[
                        styles.defendText,
                        buttonsDisabled && styles.disabledActionText,
                      ]}>
                      SAVUN
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.resultArea}>
                <Text style={styles.resultEyebrow}>ARENA SONUCU</Text>

                <Text
                  style={[
                    styles.resultTitle,
                    !playerWon && styles.defeatTitle,
                  ]}>
                  {playerWon ? "ZAFER" : "MAĞLUBİYET"}
                </Text>

                {playerWon ? (
                  <View style={styles.rewards}>
                    <Text style={styles.reward}>🪙 +{reward.denarius} D</Text>

                    <Text style={styles.reward}>★ +{reward.fame} ŞÖHRET</Text>

                    <Text style={styles.expText}>+{reward.experience} XP</Text>

                    {endgameScaling.active && (
                      <Text style={styles.endgameReward}>HANEDAN BONUSU</Text>
                    )}
                  </View>
                ) : (
                  <>
                    <Text style={styles.lossText}>
                      Para veya şöhret kazanamadın.
                    </Text>

                    <Text style={styles.expText}>+{reward.experience} XP</Text>
                  </>
                )}

                <Pressable
                  style={styles.continueButton}
                  onPress={() => router.replace("/arena")}>
                  <Text style={styles.continueText}>DEVAM ET</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* ENEMY */}
          <View
            style={[
              styles.fighter,
              turn === "enemy" && !isFinished && styles.activeEnemy,
              endgameScaling.active && styles.endgameEnemy,
            ]}>
            <View style={styles.fighterTop}>
              <Text style={styles.enemyLabel}>
                {endgameScaling.active ? "HANEDAN RAKİBİ" : "RAKİP"}
              </Text>

              <Text style={styles.className}>
                {enemy.gladiator.class.toUpperCase()}
              </Text>
            </View>

            <View style={styles.portrait}>
              <Text style={styles.portraitIcon}>🛡</Text>
            </View>

            <Text style={styles.name} numberOfLines={1}>
              {enemy.gladiator.name.toUpperCase()}
            </Text>

            <View style={styles.divider} />

            <View style={styles.hpSection}>
              <Text style={styles.barLabel}>SAĞLIK</Text>

              <Text style={styles.barValue}>
                {enemy.currentHp}/{enemy.gladiator.maxHp}
              </Text>
            </View>

            <View style={styles.hpBar}>
              <View
                style={[
                  styles.enemyHpFill,
                  {
                    width: `${enemyHpPercent}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.hpSection}>
              <Text style={styles.barLabel}>STAMINA</Text>

              <Text style={styles.barValue}>{enemy.stamina}</Text>
            </View>

            <View style={styles.staminaBar}>
              <View
                style={[
                  styles.staminaFill,
                  {
                    width: `${Math.max(0, Math.min(100, enemy.stamina))}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.stateArea}>
              <Text style={styles.stateLabel}>DURUM</Text>

              <Text
                style={[
                  styles.stateText,
                  enemy.defending && styles.defendingText,
                ]}>
                {enemy.defending ? "SAVUNMADA" : "HAZIR"}
              </Text>
            </View>
          </View>
        </View>

        {/* BATTLE LOG */}
        <View style={styles.logArea}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>DÖVÜŞ KAYDI</Text>

            <Text style={styles.logCount}>{battleLog.length} HAMLE</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.logContent}>
            {battleLog
              .slice()
              .reverse()
              .map((message, index) => (
                <Text
                  key={`${message}-${index}`}
                  style={[styles.logText, index === 0 && styles.latestLogText]}>
                  {index === 0 ? "›" : "·"} {message}
                </Text>
              ))}
          </ScrollView>
        </View>
      </View>
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
    width: 190,
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

  arenaInfo: {
    alignItems: "center",
  },

  arenaLabel: {
    color: "#6E6658",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  arenaName: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    marginTop: 1,
  },

  turnArea: {
    flex: 1,
    alignItems: "flex-end",
  },

  turnBadge: {
    minWidth: 110,
    height: 29,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#526142",
    borderRadius: 3,
    backgroundColor: "#141A10",
    alignItems: "center",
    justifyContent: "center",
  },

  enemyTurnBadge: {
    borderColor: "#70483E",
    backgroundColor: "#1B120F",
  },

  turnText: {
    color: "#8FAF72",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    letterSpacing: 0.6,
  },

  enemyTurnText: {
    color: "#C17765",
  },

  finishedBadge: {
    minWidth: 125,
    height: 29,
    borderWidth: 1,
    borderColor: "#65522B",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  finishedText: {
    color: "#B99B4D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  mainContent: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 10,
  },

  fightArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },

  fighter: {
    width: 215,
    height: 195,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 10,
  },

  activePlayer: {
    borderColor: "#70855A",
  },

  activeEnemy: {
    borderColor: "#89564A",
  },

  endgameEnemy: {
    borderColor: "#80632F",
  },

  fighterTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  playerLabel: {
    color: "#8FAF72",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.7,
  },

  enemyLabel: {
    color: "#B56D5C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.7,
  },

  className: {
    color: "#A88D49",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  portrait: {
    height: 31,
    marginTop: 5,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291C",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  portraitIcon: {
    color: "#B99B4D",
    fontSize: 16,
  },

  name: {
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 6,
  },

  hpSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },

  barLabel: {
    color: "#817C74",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  barValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  hpBar: {
    height: 6,
    backgroundColor: "#302C26",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 3,
  },

  playerHpFill: {
    height: "100%",
    backgroundColor: "#8FAF72",
  },

  enemyHpFill: {
    height: "100%",
    backgroundColor: "#B56D5C",
  },

  staminaBar: {
    height: 5,
    backgroundColor: "#302C26",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 3,
  },

  staminaFill: {
    height: "100%",
    backgroundColor: "#B99B4D",
  },

  stateArea: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stateLabel: {
    color: "#716A60",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  stateText: {
    color: "#8F897E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  defendingText: {
    color: "#C3A34F",
  },

  centerArea: {
    width: 175,
    alignItems: "center",
  },

  vs: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 28,
  },

  turnLabel: {
    color: "#827A6E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    textAlign: "center",
    marginTop: 5,
  },

  actions: {
    width: "100%",
    gap: 7,
    marginTop: 10,
  },

  attackButton: {
    height: 34,
    backgroundColor: "#A84F3C",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  attackText: {
    color: "#F2E7D6",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  defendButton: {
    height: 34,
    borderWidth: 1,
    borderColor: "#B99B4D",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  defendText: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  disabledAttack: {
    backgroundColor: "#382823",
  },

  disabledDefend: {
    borderColor: "#3A352D",
  },

  disabledActionText: {
    color: "#665F56",
  },

  resultArea: {
    width: "100%",
    alignItems: "center",
  },

  resultEyebrow: {
    color: "#75673E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  resultTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 19,
    marginTop: 2,
  },

  defeatTitle: {
    color: "#B56D5C",
  },

  rewards: {
    alignItems: "center",
    marginTop: 5,
  },

  reward: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    marginTop: 2,
  },

  endgameReward: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
    marginTop: 3,
  },

  expText: {
    color: "#B99B4D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    marginTop: 4,
  },

  lossText: {
    color: "#77716A",
    fontSize: 8,
    textAlign: "center",
    marginTop: 5,
  },

  continueButton: {
    width: "100%",
    height: 31,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  continueText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  logArea: {
    height: 82,
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#2C261C",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },

  logTitle: {
    color: "#9C8243",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
    letterSpacing: 1,
  },

  logCount: {
    color: "#625D54",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  logContent: {
    paddingBottom: 4,
  },

  logText: {
    color: "#807A72",
    fontSize: 7.5,
    lineHeight: 11,
  },

  latestLogText: {
    color: "#D1C7AE",
  },
});
