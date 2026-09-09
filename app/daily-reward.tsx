import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameModal from "../src/components/GameModal";
import { dailyRewards } from "../src/features/dailyReward/dailyReward";
import { useGameStore } from "../src/store/gameStore";

export default function DailyRewardScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [spinning, setSpinning] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;
  const spinRotation = useRef(0);

  const ludus = useGameStore((state) => state.playerLudus);

  const dailyRewardAvailable = useGameStore(
    (state) => state.dailyRewardAvailable,
  );

  const lastDailyReward = useGameStore((state) => state.lastDailyReward);

  const checkDailyReward = useGameStore((state) => state.checkDailyReward);

  const claimDailyReward = useGameStore((state) => state.claimDailyReward);

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  useEffect(() => {
    checkDailyReward();
  }, [checkDailyReward]);

  const totalWeight = useMemo(() => {
    return dailyRewards.reduce((total, reward) => total + reward.weight, 0);
  }, []);

  const wheelRotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#DDB936" />
      </View>
    );
  }

  if (!ludus) {
    return (
      <View
        style={[
          styles.center,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <Text style={styles.error}>LUDUS BULUNAMADI</Text>

        <Pressable
          style={styles.errorButton}
          onPress={() => router.replace("/")}>
          <Text style={styles.errorButtonText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  const handleSpin = async () => {
    if (spinning) {
      return;
    }

    if (!dailyRewardAvailable) {
      showModal(
        "GÜNLÜK ÖDÜL ALINDI",
        "Bugünkü günlük çark ödülünü zaten aldın.\n\nYarın tekrar gelebilirsin.",
      );

      return;
    }

    setSpinning(true);

    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const randomStop = Math.random();

    const startRotation = spinRotation.current;
    const targetRotation = startRotation + extraTurns + randomStop;

    spinValue.setValue(startRotation);

    await new Promise<void>((resolve) => {
      Animated.timing(spinValue, {
        toValue: targetRotation,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        spinRotation.current = targetRotation % 1;
        spinValue.setValue(spinRotation.current);
        resolve();
      });
    });

    const result = await claimDailyReward();

    setSpinning(false);

    showModal("GÜNLÜK ÖDÜL", result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <View
        style={[
          styles.topBar,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.identity}>
          <Text style={styles.eyebrow}>ROMA'NIN LÜTFU</Text>

          <Text style={styles.topTitle}>GÜNLÜK ÇARK</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>DURUM</Text>

            <Text
              style={[
                styles.contextValue,
                dailyRewardAvailable
                  ? styles.availableText
                  : styles.claimedText,
              ]}>
              {dailyRewardAvailable ? "HAZIR" : "ALINDI"}
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>ÇEVİRME</Text>

            <Text style={styles.contextValue}>1 / GÜN</Text>
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

      <View
        style={[
          styles.content,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.leftPanel}>
          <Text style={styles.romanSymbol}>SPQR</Text>

          <Text style={styles.panelTitle}>GÜNLÜK LÜTUF</Text>

          <Text style={styles.panelDescription}>
            Her gerçek gün bir kez çarkı çevirerek Ludus'un için ücretsiz ödül
            kazan.
          </Text>

          <View style={styles.divider} />

          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>BUGÜNKÜ DURUM</Text>

            <Text
              style={[
                styles.statusValue,
                dailyRewardAvailable
                  ? styles.availableText
                  : styles.claimedText,
              ]}>
              {dailyRewardAvailable ? "ÖDÜL HAZIR" : "ÖDÜL ALINDI"}
            </Text>
          </View>

          {lastDailyReward && (
            <View style={styles.lastRewardBox}>
              <Text style={styles.lastRewardLabel}>SON ÖDÜL</Text>

              <Text style={styles.lastRewardValue}>
                {getRewardIcon(lastDailyReward.type)}{" "}
                {lastDailyReward.label.toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.dailyRule}>
            <Text style={styles.dailyRuleTitle}>GERÇEK GÜN SİSTEMİ</Text>

            <Text style={styles.dailyRuleText}>
              Oyun içi gün bitirmek çarkı yenilemez.
            </Text>
          </View>
        </View>

        <View style={styles.wheelArea}>
          <Text style={styles.wheelEyebrow}>BUGÜNKÜ ÖDÜLÜN</Text>

          <View style={styles.pointer}>
            <Text style={styles.pointerText}>▼</Text>
          </View>

          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [
                  {
                    rotate: wheelRotate,
                  },
                ],
              },
            ]}>
            <View style={styles.innerRing} />

            <View style={styles.wheelCenter}>
              <Text style={styles.wheelIcon}>🏛</Text>

              <Text style={styles.wheelCenterText}>ROMA</Text>
            </View>

            {dailyRewards.map((reward, index) => {
              const angle = (360 / dailyRewards.length) * index;

              return (
                <View
                  key={reward.id}
                  style={[
                    styles.rewardItem,
                    {
                      transform: [
                        {
                          rotate: `${angle}deg`,
                        },
                        {
                          translateY: -82,
                        },
                        {
                          rotate: `${-angle}deg`,
                        },
                      ],
                    },
                  ]}>
                  <Text style={styles.rewardIcon}>
                    {getRewardIcon(reward.type)}
                  </Text>

                  <Text style={styles.rewardAmount}>
                    {reward.type === "denarius"
                      ? reward.amount
                      : `+${reward.amount}`}
                  </Text>
                </View>
              );
            })}
          </Animated.View>

          <Pressable
            style={[
              styles.spinButton,
              (!dailyRewardAvailable || spinning) && styles.disabledButton,
            ]}
            onPress={handleSpin}
            disabled={spinning}>
            <Text
              style={[
                styles.spinButtonText,
                (!dailyRewardAvailable || spinning) &&
                  styles.disabledButtonText,
              ]}>
              {spinning
                ? "ÇARK DÖNÜYOR..."
                : dailyRewardAvailable
                  ? "ÇARKI ÇEVİR"
                  : "BUGÜN ALINDI"}
            </Text>
          </Pressable>

          <Text style={styles.realDayText}>
            HER GERÇEK GÜN 1 ÜCRETSİZ ÇEVİRME
          </Text>
        </View>

        <View style={styles.rewardPanel}>
          <Text style={styles.rewardEyebrow}>ÖDÜL HAVUZU</Text>

          <Text style={styles.rewardTitle}>OLASI ÖDÜLLER</Text>

          <Text style={styles.rewardSubtitle}>
            Her ödülün çıkma ihtimali farklıdır.
          </Text>

          <View style={styles.divider} />

          <View style={styles.rewardList}>
            {dailyRewards.map((reward) => {
              const chance = (reward.weight / totalWeight) * 100;

              return (
                <View key={reward.id} style={styles.rewardRow}>
                  <View style={styles.rewardLeft}>
                    <View style={styles.rewardIconBox}>
                      <Text style={styles.listIcon}>
                        {getRewardIcon(reward.type)}
                      </Text>
                    </View>

                    <Text style={styles.rewardLabel} numberOfLines={1}>
                      {reward.label.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.chanceBadge}>
                    <Text style={styles.chance}>%{Math.round(chance)}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Text style={styles.note}>
            Gün bitirmek veya yeni oyun başlatmak günlük çarkı sıfırlamaz.
          </Text>
        </View>
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

function getRewardIcon(type: string) {
  if (type === "denarius") {
    return "🪙";
  }

  if (type === "action_points") {
    return "⚡";
  }

  if (type === "fame") {
    return "★";
  }

  return "🎁";
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
    width: 180,
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
    fontSize: 15,
    letterSpacing: 1,
    marginTop: 1,
  },

  contextArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  contextItem: {
    minWidth: 58,
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

  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 12,
  },

  leftPanel: {
    width: 205,
    height: 265,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 13,
  },

  romanSymbol: {
    color: "#806C35",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    letterSpacing: 3,
  },

  panelTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 4,
  },

  panelDescription: {
    color: "#817C74",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 9,
  },

  statusBox: {
    height: 50,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291C",
    borderRadius: 3,
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  statusLabel: {
    color: "#77716A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  statusValue: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    marginTop: 2,
  },

  availableText: {
    color: "#8FAF72",
  },

  claimedText: {
    color: "#966F54",
  },

  lastRewardBox: {
    marginTop: 9,
  },

  lastRewardLabel: {
    color: "#77716A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  lastRewardValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    marginTop: 2,
  },

  dailyRule: {
    marginTop: "auto",
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: "#30291C",
  },

  dailyRuleTitle: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  dailyRuleText: {
    color: "#6F6960",
    fontSize: 7.5,
    lineHeight: 10,
    marginTop: 2,
  },

  wheelArea: {
    width: 250,
    alignItems: "center",
    justifyContent: "center",
  },

  wheelEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
    marginBottom: 1,
  },

  pointer: {
    marginBottom: -3,
    zIndex: 5,
  },

  pointerText: {
    color: "#DDB936",
    fontSize: 20,
  },

  wheel: {
    width: 202,
    height: 202,
    borderRadius: 101,
    backgroundColor: "#19150F",
    borderWidth: 4,
    borderColor: "#80632F",
    alignItems: "center",
    justifyContent: "center",
  },

  innerRing: {
    position: "absolute",
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 1,
    borderColor: "#46391E",
  },

  wheelCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DDB936",
    borderWidth: 3,
    borderColor: "#433619",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },

  wheelIcon: {
    color: "#17140F",
    fontSize: 19,
  },

  wheelCenterText: {
    color: "#17140F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
    letterSpacing: 1.5,
    marginTop: 1,
  },

  rewardItem: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 45,
  },

  rewardIcon: {
    fontSize: 15,
  },

  rewardAmount: {
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
    marginTop: 1,
  },

  spinButton: {
    width: 170,
    height: 34,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  spinButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    letterSpacing: 0.5,
  },

  disabledButton: {
    backgroundColor: "#2A2721",
    borderWidth: 1,
    borderColor: "#3C372F",
  },

  disabledButtonText: {
    color: "#6A645B",
  },

  realDayText: {
    color: "#706B63",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 5,
  },

  rewardPanel: {
    width: 215,
    height: 265,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 12,
  },

  rewardEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  rewardTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  rewardSubtitle: {
    color: "#77716A",
    fontSize: 7.5,
    marginTop: 2,
  },

  rewardList: {
    gap: 4,
  },

  rewardRow: {
    minHeight: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rewardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
  },

  rewardIconBox: {
    width: 25,
    height: 25,
    backgroundColor: "#211D16",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  listIcon: {
    fontSize: 12,
  },

  rewardLabel: {
    flex: 1,
    color: "#D8CFB8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
  },

  chanceBadge: {
    minWidth: 31,
    height: 22,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#3A3223",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  chance: {
    color: "#A28D55",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  note: {
    color: "#6F6960",
    fontSize: 7,
    lineHeight: 10,
  },
});
