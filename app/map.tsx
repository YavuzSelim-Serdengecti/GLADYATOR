import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameModal from "../src/components/GameModal";

import {
  GameFeature,
  getFeatureRequiredLevel,
  isFeatureUnlocked,
} from "../src/features/progression/featureUnlocks";

import {
  getFinancialStatusLabel,
  MAX_DEBT_DAYS,
} from "../src/features/economy/bankruptcySystem";

import {
  getCurrentLevelRequirement,
  getLudusLevelProgress,
  getNextLevelRequirement,
  isMaxLudusLevel,
} from "../src/features/ludus/ludusLevel";

import { useGameStore } from "../src/store/gameStore";

const TEST_MODE = false;

type MapLocationProps = {
  title: string;
  subtitle?: string;
  feature: GameFeature;
  currentLevel: number;
  onPress?: () => void;
  style?: object;
};

function MapLocation({
  title,
  feature,
  currentLevel,
  onPress,
  style,
}: MapLocationProps) {
  const requiredLevel = getFeatureRequiredLevel(feature);
  const featureUnlocked = isFeatureUnlocked(feature, currentLevel);
  const locked = !TEST_MODE && !featureUnlocked;

  return (
    <Pressable
      disabled={locked || !onPress}
      onPress={onPress}
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.location,
        style,
        pressed && !locked && onPress && styles.locationPressed,
      ]}>
      {locked && (
        <View style={styles.lockIndicator}>
          <Text style={styles.lockIndicatorText}>🔒 LV. {requiredLevel}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [goToFinancialStatusAfterModal, setGoToFinancialStatusAfterModal] =
    useState(false);

  const world = useGameStore((state) => state.world);
  const ludus = useGameStore((state) => state.playerLudus);
  const endDay = useGameStore((state) => state.endDay);

  const bankruptcyState = useGameStore((state) => state.bankruptcyState);

  const dailyRewardAvailable = useGameStore(
    (state) => state.dailyRewardAvailable,
  );

  const checkDailyReward = useGameStore((state) => state.checkDailyReward);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const handleDailyReward = async () => {
    if (!ludus) {
      return;
    }

    const unlocked = isFeatureUnlocked("daily_reward", ludus.level);

    if (!TEST_MODE && !unlocked) {
      const requiredLevel = getFeatureRequiredLevel("daily_reward");

      setModalTitle("ÖZELLİK KİLİTLİ");
      setModalMessage(`Günlük Çark Lv. ${requiredLevel} seviyesinde açılır.`);
      setModalVisible(true);

      return;
    }

    await checkDailyReward();

    router.push("/daily-reward");
  };

  const handleRivals = () => {
    if (!ludus) {
      return;
    }

    const unlocked = isFeatureUnlocked("rivals", ludus.level);

    if (!TEST_MODE && !unlocked) {
      const requiredLevel = getFeatureRequiredLevel("rivals");

      setModalTitle("ÖZELLİK KİLİTLİ");

      setModalMessage(
        `Rakip Luduslar Lv. ${requiredLevel} seviyesinde açılır.`,
      );

      setModalVisible(true);

      return;
    }

    router.push("/rivals");
  };

  const handleEndDay = () => {
    if (!world || !ludus) {
      return;
    }

    if (bankruptcyState.bankrupt) {
      router.push("/financial-status");
      return;
    }

    const finishedDay = world.currentDay;
    const oldDenarius = ludus.denarius;

    endDay();

    const newState = useGameStore.getState();

    const newWorld = newState.world;
    const newLudus = newState.playerLudus;
    const dailyIncome = newState.lastDailyIncome;
    const dailyExpenses = newState.lastDailyExpenses;
    const financialState = newState.bankruptcyState;
    const financialMessage = newState.lastFinancialMessage;

    if (!newWorld || !newLudus) {
      return;
    }

    const income = dailyIncome?.totalIncome ?? 0;
    const expenses = dailyExpenses?.totalCost ?? 0;

    const net = income - expenses;

    const denariusDifference = newLudus.denarius - oldDenarius;

    const netText = net >= 0 ? `+${net} D` : `${net} D`;

    const moneyChangeText =
      denariusDifference >= 0
        ? `+${denariusDifference} D`
        : `${denariusDifference} D`;

    if (financialState.bankrupt) {
      setModalTitle("LUDUS İFLAS ETTİ");

      setModalMessage(
        [
          `Gelir: +${income} D`,
          `Gider: -${expenses} D`,
          `Net: ${netText}`,
          "",
          `Toplam Denarius: ${newLudus.denarius} D`,
          `Toplam Borç: ${financialState.totalDebt} D`,
          "",
          financialMessage ?? "Ludus borçlarını ödeyemedi.",
        ].join("\n"),
      );

      setGoToFinancialStatusAfterModal(true);
      setModalVisible(true);

      return;
    }

    if (
      financialState.status === "debt" ||
      financialState.status === "critical"
    ) {
      const remainingDays = Math.max(
        0,
        MAX_DEBT_DAYS - financialState.debtDays,
      );

      setModalTitle(
        financialState.status === "critical" ? "MALİ KRİZ" : "LUDUS BORÇTA",
      );

      setModalMessage(
        [
          `Gelir: +${income} D`,
          `Gider: -${expenses} D`,
          `Net: ${netText}`,
          "",
          `Kasa: ${newLudus.denarius} D`,
          `Borç: ${financialState.totalDebt} D`,
          `Borçlu gün: ${financialState.debtDays}/${MAX_DEBT_DAYS}`,
          "",
          `İflasa kalan süre: ${remainingDays} gün`,
          "",
          financialMessage ?? "Ekonomiyi toparlamalısın.",
        ].join("\n"),
      );

      setModalVisible(true);

      return;
    }

    if (financialMessage) {
      setModalTitle("EKONOMİ TOPARLANDI");

      setModalMessage(
        [
          `Gelir: +${income} D`,
          `Gider: -${expenses} D`,
          `Net: ${netText}`,
          "",
          `Kasa değişimi: ${moneyChangeText}`,
          `Toplam Denarius: ${newLudus.denarius} D`,
          "",
          financialMessage,
          "",
          `Yeni gün: ${newWorld.currentDay}`,
          `Aksiyon: ${newLudus.actionPoints}/${newLudus.maxActionPoints}`,
        ].join("\n"),
      );

      setModalVisible(true);

      return;
    }

    setModalTitle(`GÜN ${finishedDay} TAMAMLANDI`);

    setModalMessage(
      [
        `Gelir: +${income} D`,
        `Gider: -${expenses} D`,
        `Net: ${netText}`,
        "",
        `Kasa değişimi: ${moneyChangeText}`,
        `Toplam Denarius: ${newLudus.denarius} D`,
        "",
        `Mali Durum: ${getFinancialStatusLabel(financialState.status)}`,
        "",
        `Yeni gün: ${newWorld.currentDay}`,
        `Aksiyon: ${newLudus.actionPoints}/${newLudus.maxActionPoints}`,
      ].join("\n"),
    );

    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);

    if (goToFinancialStatusAfterModal) {
      setGoToFinancialStatusAfterModal(false);
      router.push("/financial-status");
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  if (!world || !ludus) {
    return (
      <View
        style={[
          styles.center,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <Text style={styles.errorTitle}>OYUN BULUNAMADI</Text>

        <Pressable
          style={styles.menuButton}
          onPress={() => router.replace("/")}>
          <Text style={styles.menuButtonText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  const dailyRewardUnlocked = isFeatureUnlocked("daily_reward", ludus.level);
  const rivalsUnlocked = isFeatureUnlocked("rivals", ludus.level);

  const financialStatusLabel = getFinancialStatusLabel(bankruptcyState.status);

  const currentLevelRequirement = getCurrentLevelRequirement(ludus.level);
  const nextLevelRequirement = getNextLevelRequirement(ludus.level);

  const levelProgress = getLudusLevelProgress(ludus.prestige, ludus.level);
  const maxLevel = isMaxLudusLevel(ludus.level);

  const earnedThisLevel = Math.max(0, ludus.prestige - currentLevelRequirement);

  const prestigeNeededThisLevel =
    nextLevelRequirement !== null
      ? nextLevelRequirement - currentLevelRequirement
      : 0;

  return (
    <View style={styles.container}>
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
          <Text numberOfLines={1} style={styles.ludusName}>
            {ludus.name}
          </Text>

          <Text numberOfLines={1} style={styles.lanista}>
            {ludus.lanistaName}
          </Text>
        </View>

        <View style={styles.levelSection}>
          <View style={styles.levelTopRow}>
            <Text style={styles.levelLabel}>LV. {ludus.level}</Text>

            <Text style={styles.levelProgressText}>
              {maxLevel
                ? "MAX"
                : `${earnedThisLevel} / ${prestigeNeededThisLevel}`}
            </Text>
          </View>

          <View style={styles.levelBarBackground}>
            <View
              style={[
                styles.levelBarFill,
                {
                  width: `${levelProgress}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.resources}>
          <Pressable onPress={() => router.push("/financial-status")}>
            <Text
              style={[
                styles.resource,
                ludus.denarius < 0 && styles.debtResource,
              ]}>
              🪙 {ludus.denarius}
            </Text>
          </Pressable>

          <Text style={styles.resource}>★ {ludus.fame}</Text>

          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

          {bankruptcyState.status !== "stable" && (
            <Pressable
              style={[
                styles.financialBadge,
                bankruptcyState.status === "warning" && styles.warningBadge,
                bankruptcyState.status === "debt" && styles.debtBadge,
                bankruptcyState.status === "critical" && styles.criticalBadge,
                bankruptcyState.status === "bankrupt" && styles.bankruptBadge,
              ]}
              onPress={() => router.push("/financial-status")}>
              <Text style={styles.financialBadgeText}>
                {financialStatusLabel}
              </Text>
            </Pressable>
          )}

          <View style={styles.resourceDivider} />

          <Text style={styles.day}>GÜN {world.currentDay}</Text>

          <Pressable
            style={[
              styles.endDayButton,
              bankruptcyState.bankrupt && styles.disabledEndDayButton,
            ]}
            onPress={handleEndDay}>
            <Text style={styles.endDayButtonText}>
              {bankruptcyState.bankrupt ? "İFLAS" : "GÜNÜ BİTİR"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* REAL ROME MAP */}
      <ImageBackground
        source={require("../assets/images/map/rome-map.jpeg")}
        resizeMode="cover"
        style={styles.map}
        imageStyle={styles.mapImage}>
        <View style={styles.mapShade} />

        <View
          pointerEvents="none"
          style={[
            styles.mapHeader,
            {
              left: safeLeft,
            },
          ]}>
          <Text style={styles.mapEyebrow}>ROMA</Text>
          <Text style={styles.mapTitle}>ŞEHİR HARİTASI</Text>
        </View>

        {/* TOP ACTIONS */}
        <View
          style={[
            styles.mapActions,
            {
              right: safeRight,
            },
          ]}>
          <Pressable
            style={styles.topAction}
            onPress={() => router.push("/rewarded-ads")}>
            <Text style={styles.topActionText}>ÖDÜLLER</Text>
          </Pressable>

          <Pressable
            style={styles.topAction}
            onPress={() => router.push("/achievements")}>
            <Text style={styles.topActionText}>BAŞARIMLAR</Text>
          </Pressable>

          <Pressable
            style={styles.topAction}
            onPress={() => router.push("/regions")}>
            <Text style={styles.topActionText}>BÖLGELER</Text>
          </Pressable>

          <Pressable
            style={[
              styles.topAction,
              dailyRewardAvailable && styles.activeTopAction,
              !TEST_MODE && !dailyRewardUnlocked && styles.lockedTopButton,
            ]}
            onPress={handleDailyReward}>
            <Text
              style={[
                styles.topActionText,
                dailyRewardAvailable && styles.activeTopActionText,
                !TEST_MODE && !dailyRewardUnlocked && styles.lockedTopText,
              ]}>
              {!TEST_MODE && !dailyRewardUnlocked ? "🔒 " : ""}
              GÜNLÜK ÇARK
            </Text>

            {dailyRewardAvailable && (TEST_MODE || dailyRewardUnlocked) && (
              <View style={styles.rewardDot} />
            )}
          </Pressable>

          <Pressable
            style={[
              styles.topAction,
              !TEST_MODE && !rivalsUnlocked && styles.lockedTopButton,
            ]}
            onPress={handleRivals}>
            <Text
              style={[
                styles.topActionText,
                !TEST_MODE && !rivalsUnlocked && styles.lockedTopText,
              ]}>
              {!TEST_MODE && !rivalsUnlocked ? "🔒 " : ""}
              RAKİPLER
            </Text>
          </Pressable>
        </View>

        {/* MAP LOCATIONS */}

        <MapLocation
          title="LUDUS"
          feature="ludus"
          currentLevel={ludus.level}
          onPress={() => router.push("/ludus")}
          style={styles.ludusLocation}
        />

        <MapLocation
          title="ARENA"
          feature="arena"
          currentLevel={ludus.level}
          onPress={() => router.push("/arena")}
          style={styles.arenaLocation}
        />

        <MapLocation
          title="GLADYATÖR PAZARI"
          feature="market"
          currentLevel={ludus.level}
          onPress={() => router.push("/market")}
          style={styles.marketLocation}
        />

        <MapLocation
          title="DEMİRCİ"
          feature="blacksmith"
          currentLevel={ludus.level}
          style={styles.blacksmithLocation}
        />

        <MapLocation
          title="TAVERNA"
          feature="tavern"
          currentLevel={ludus.level}
          onPress={() => router.push("/tavern")}
          style={styles.tavernLocation}
        />

        <MapLocation
          title="REVİR"
          feature="infirmary"
          currentLevel={ludus.level}
          style={styles.infirmaryLocation}
        />

        <MapLocation
          title="MADEN"
          feature="mine"
          currentLevel={ludus.level}
          style={styles.mineLocation}
        />

        <MapLocation
          title="OYUN EVİ"
          feature="gambling_house"
          currentLevel={ludus.level}
          onPress={() => router.push("/gambling-house")}
          style={styles.gamblingLocation}
        />
      </ImageBackground>

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B0906",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#0B0906",
  },

  center: {
    flex: 1,
    backgroundColor: "#0B0906",
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 20,
    letterSpacing: 2,
  },

  menuButton: {
    borderWidth: 1,
    borderColor: "#9B7C31",
    borderRadius: 3,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 20,
  },

  menuButtonText: {
    color: "#DDB936",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 10,
  },

  topBar: {
    height: 64,
    backgroundColor: "#100D08",
    borderBottomWidth: 1,
    borderBottomColor: "#332A1A",
    flexDirection: "row",
    alignItems: "center",
  },

  identity: {
    width: 165,
    paddingRight: 14,
  },

  ludusName: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    letterSpacing: 0.7,
  },

  lanista: {
    color: "#81796B",
    fontSize: 9,
    marginTop: 2,
  },

  levelSection: {
    width: 185,
    marginRight: 20,
  },

  levelTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  levelLabel: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    letterSpacing: 0.8,
  },

  levelProgressText: {
    color: "#9D927B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  levelBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#2B261C",
    borderWidth: 1,
    borderColor: "#4B4028",
    borderRadius: 3,
    overflow: "hidden",
  },

  levelBarFill: {
    height: "100%",
    backgroundColor: "#D4AF37",
    borderRadius: 2,
  },

  resources: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 11,
  },

  resource: {
    color: "#D9CFB5",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
  },

  resourceDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#3A3121",
  },

  debtResource: {
    color: "#D86E67",
  },

  financialBadge: {
    height: 25,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17140F",
  },

  warningBadge: {
    borderColor: "#8A7132",
  },

  debtBadge: {
    borderColor: "#9B5D31",
  },

  criticalBadge: {
    borderColor: "#9A4039",
    backgroundColor: "#211210",
  },

  bankruptBadge: {
    borderColor: "#B3453D",
    backgroundColor: "#2A100F",
  },

  financialBadgeText: {
    color: "#D7B86B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  day: {
    color: "#B99B4D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
  },

  endDayButton: {
    height: 31,
    paddingHorizontal: 12,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledEndDayButton: {
    backgroundColor: "#7E3934",
  },

  endDayButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    letterSpacing: 0.5,
  },

  map: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },

  mapImage: {
    width: "100%",
    height: "100%",
  },

  mapShade: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(6, 4, 2, 0.12)",
  },

  mapHeader: {
    position: "absolute",
    top: 12,
    zIndex: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 3,
    backgroundColor: "rgba(13, 10, 6, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(132, 105, 48, 0.45)",
  },

  mapEyebrow: {
    color: "#B99B4D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 2.5,
  },

  mapTitle: {
    color: "#E1C66E",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    letterSpacing: 1.5,
    marginTop: 1,
  },

  mapActions: {
    position: "absolute",
    top: 12,
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  topAction: {
    height: 29,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: "#75602F",
    borderRadius: 3,
    backgroundColor: "rgba(13, 10, 6, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  topActionText: {
    color: "#C6A653",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    letterSpacing: 0.3,
  },

  activeTopAction: {
    borderColor: "#DDB936",
    backgroundColor: "rgba(38, 30, 12, 0.9)",
  },

  activeTopActionText: {
    color: "#F1D46F",
  },

  lockedTopButton: {
    opacity: 0.55,
    borderColor: "#4B463D",
  },

  lockedTopText: {
    color: "#777168",
  },

  rewardDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#8FAF72",
    right: -3,
    top: -3,
  },

  location: {
    position: "absolute",
    width: 130,
    height: 72,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  locationPressed: {
    backgroundColor: "rgba(212, 175, 55, 0.10)",
    borderRadius: 10,
    transform: [{ scale: 0.97 }],
  },

  lockIndicator: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "rgba(10, 8, 5, 0.76)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.55)",
    borderRadius: 5,
  },

  lockIndicatorText: {
    color: "#C8B16A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    letterSpacing: 0.3,
  },

  /*
   * Şimdilik eski koordinatlar korunuyor.
   * Sonraki adımda ekran görüntüsüne göre
   * görseldeki gerçek bölgelerin üzerine oturtacağız.
   */

  ludusLocation: {
    left: "15%",
    top: "18%",
  },

  arenaLocation: {
    left: "51%",
    top: "13%",
  },

  marketLocation: {
    right: "8%",
    top: "34%",
  },

  blacksmithLocation: {
    left: "19%",
    top: "47%",
  },

  tavernLocation: {
    left: "39%",
    bottom: "9%",
  },

  infirmaryLocation: {
    left: "59%",
    bottom: "9%",
  },

  mineLocation: {
    left: "3%",
    bottom: "5%",
  },

  gamblingLocation: {
    right: "6%",
    bottom: "5%",
  },
});
