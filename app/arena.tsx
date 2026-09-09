import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameModal from "../src/components/GameModal";
import { arenas } from "../src/data/arenas";
import { useGameStore } from "../src/store/gameStore";

const ARENA_ACTION_COST = 2;

export default function ArenaScreen() {
  const ludus = useGameStore((state) => state.playerLudus);

  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#DDB936" />
      </View>
    );
  }

  if (!ludus) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>LUDUS BULUNAMADI</Text>

        <Pressable
          style={styles.menuButton}
          onPress={() => router.replace("/")}>
          <Text style={styles.menuButtonText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  const unlockedArenaCount = arenas.filter(
    (arena) => ludus.level >= arena.requiredLudusLevel,
  ).length;

  const handleEnterArena = (arenaId: string) => {
    if (ludus.actionPoints < ARENA_ACTION_COST) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `Arena savaşı için ${ARENA_ACTION_COST} aksiyon puanı gerekiyor.\n\nKalan aksiyon: ${ludus.actionPoints}/${ludus.maxActionPoints}`,
      );

      return;
    }

    router.push({
      pathname: "/arena-select-gladiator",
      params: {
        arenaId,
      },
    });
  };

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
          <Text style={styles.eyebrow}>ROMA ARENALARI</Text>
          <Text style={styles.topTitle}>ARENA</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>SEVİYE</Text>
            <Text style={styles.contextValue}>{ludus.level}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>AÇIK</Text>
            <Text style={styles.contextValue}>
              {unlockedArenaCount}/{arenas.length}
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>MALİYET</Text>
            <Text style={styles.contextValue}>⚡ {ARENA_ACTION_COST}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

          <Text style={styles.resource}>★ {ludus.fame}</Text>

          <Text style={styles.resource}>🪙 {ludus.denarius}</Text>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← HARİTA</Text>
          </Pressable>
        </View>
      </View>

      {/* PAGE HEADER */}
      <View
        style={[
          styles.pageHeader,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View>
          <Text style={styles.pageEyebrow}>KAN VE ŞÖHRET</Text>
          <Text style={styles.pageTitle}>ARENANI SEÇ</Text>
        </View>

        <Text style={styles.pageInfo}>
          Daha büyük arenalar daha güçlü rakipler, daha yüksek ödüller ve daha
          fazla risk sunar.
        </Text>
      </View>

      {/* ARENAS */}
      <ScrollView
        horizontal
        bounces={false}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={230}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={[
          styles.list,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        {arenas.map((arena) => {
          const locked = ludus.level < arena.requiredLudusLevel;

          const insufficientActionPoints =
            ludus.actionPoints < ARENA_ACTION_COST;

          return (
            <View
              key={arena.id}
              style={[styles.card, locked && styles.lockedCard]}>
              <View style={styles.cardTop}>
                <View>
                  <Text
                    style={[
                      styles.cardEyebrow,
                      locked && styles.lockedSecondary,
                    ]}>
                    ROMA ARENASI
                  </Text>

                  <Text
                    style={[styles.arenaName, locked && styles.lockedTitle]}
                    numberOfLines={1}>
                    {arena.name.toUpperCase()}
                  </Text>
                </View>

                <View
                  style={[
                    styles.difficultyBadge,
                    locked && styles.lockedBadge,
                  ]}>
                  <Text
                    style={[
                      styles.difficulty,
                      locked && styles.lockedSecondary,
                    ]}>
                    {arena.difficulty.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoGrid}>
                <Info
                  label="ÖNERİLEN GÜÇ"
                  value={`${arena.recommendedPowerMin} - ${arena.recommendedPowerMax}`}
                  locked={locked}
                />

                <Info
                  label="ÖDÜL"
                  value={`${arena.rewardMin} - ${arena.rewardMax} D`}
                  locked={locked}
                />

                <Info
                  label="ŞÖHRET"
                  value={`+${arena.fameReward}`}
                  locked={locked}
                />

                <Info
                  label="ÖLÜM RİSKİ"
                  value={`${Math.round(arena.deathRisk * 100)}%`}
                  locked={locked}
                />

                <Info
                  label="AKSİYON"
                  value={`⚡ ${ARENA_ACTION_COST}`}
                  locked={locked}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.riskArea}>
                <Text
                  style={[styles.riskLabel, locked && styles.lockedSecondary]}>
                  ARENA RİSKİ
                </Text>

                <View style={styles.riskTrack}>
                  <View
                    style={[
                      styles.riskFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.max(8, arena.deathRisk * 100 * 4),
                        )}%`,
                      },
                      locked && styles.lockedRiskFill,
                    ]}
                  />
                </View>
              </View>

              {locked ? (
                <View style={styles.lockedArea}>
                  <View style={styles.lockIconBox}>
                    <Text style={styles.lockedIcon}>×</Text>
                  </View>

                  <View style={styles.lockedInfo}>
                    <Text style={styles.lockedLabel}>KİLİTLİ</Text>

                    <Text style={styles.lockedText}>
                      LUDUS LV. {arena.requiredLudusLevel} GEREKLİ
                    </Text>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={[
                    styles.enterButton,
                    insufficientActionPoints && styles.insufficientButton,
                  ]}
                  onPress={() => handleEnterArena(arena.id)}>
                  <Text
                    style={[
                      styles.enterButtonText,
                      insufficientActionPoints && styles.insufficientButtonText,
                    ]}>
                    {insufficientActionPoints
                      ? "YETERSİZ AP"
                      : `ARENAYA GİR · ${ARENA_ACTION_COST} AP`}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

function Info({
  label,
  value,
  locked,
}: {
  label: string;
  value: string;
  locked: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, locked && styles.lockedSecondary]}>
        {label}
      </Text>

      <Text style={[styles.infoValue, locked && styles.lockedValue]}>
        {value}
      </Text>
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

  menuButton: {
    height: 34,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  menuButtonText: {
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
    width: 180,
  },

  eyebrow: {
    color: "#75673E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.3,
  },

  topTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    letterSpacing: 1.2,
    marginTop: 1,
  },

  contextArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  contextItem: {
    minWidth: 45,
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
    fontSize: 10,
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
    gap: 10,
  },

  resource: {
    color: "#D9CFB5",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
  },

  backButton: {
    height: 30,
    paddingHorizontal: 12,
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

  pageHeader: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pageEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.4,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    letterSpacing: 1,
    marginTop: 1,
  },

  pageInfo: {
    maxWidth: 340,
    color: "#777065",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "right",
  },

  list: {
    gap: 10,
    paddingBottom: 14,
    alignItems: "flex-start",
  },

  card: {
    width: 220,
    height: 230,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 11,
  },

  lockedCard: {
    backgroundColor: "#12100D",
    borderColor: "#302B23",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  arenaName: {
    maxWidth: 125,
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  difficultyBadge: {
    minHeight: 23,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#65522B",
    borderRadius: 3,
    backgroundColor: "#211B10",
    alignItems: "center",
    justifyContent: "center",
  },

  difficulty: {
    color: "#C3A34F",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  lockedBadge: {
    backgroundColor: "#191714",
    borderColor: "#35312A",
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 7,
  },

  infoGrid: {
    gap: 2,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 18,
  },

  infoLabel: {
    color: "#817C74",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  infoValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  riskArea: {
    gap: 4,
  },

  riskLabel: {
    color: "#81796E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  riskTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "#282319",
    overflow: "hidden",
  },

  riskFill: {
    height: "100%",
    backgroundColor: "#A95C42",
  },

  lockedRiskFill: {
    backgroundColor: "#4C4740",
  },

  lockedArea: {
    height: 32,
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#37322A",
    borderRadius: 3,
    paddingHorizontal: 8,
  },

  lockIconBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#3B3730",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  lockedIcon: {
    color: "#6E6860",
    fontFamily: "Cinzel_700Bold",
    fontSize: 11,
  },

  lockedInfo: {
    flex: 1,
  },

  lockedLabel: {
    color: "#7B746B",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  lockedText: {
    color: "#625D57",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 1,
  },

  enterButton: {
    height: 32,
    marginTop: "auto",
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  enterButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7.5,
    letterSpacing: 0.3,
  },

  insufficientButton: {
    backgroundColor: "#29251D",
    borderWidth: 1,
    borderColor: "#4B4435",
  },

  insufficientButtonText: {
    color: "#716B5E",
  },

  lockedTitle: {
    color: "#77716A",
  },

  lockedSecondary: {
    color: "#5F5B55",
  },

  lockedValue: {
    color: "#77716A",
  },
});
