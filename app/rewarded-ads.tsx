import {
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    getRewardedAdRemainingCount,
    REWARDED_AD_REWARDS,
} from "../src/features/ads/rewardedAds";

import { useGameStore } from "../src/store/gameStore";

export default function RewardedAdsScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const ludus = useGameStore((state) => state.playerLudus);

  const rewardedAdUsage = useGameStore((state) => state.rewardedAdUsage);

  const claimRewardedAd = useGameStore((state) => state.claimRewardedAd);

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

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
        <Text style={styles.error}>AKTİF LUDUS BULUNAMADI</Text>

        <Pressable
          style={styles.menuButton}
          onPress={() => router.replace("/")}>
          <Text style={styles.menuButtonText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  const handleWatchAd = (type: "action_point" | "denarius") => {
    claimRewardedAd(type);
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
          <Text style={styles.eyebrow}>ROMA ÖDÜLLERİ</Text>

          <Text style={styles.topTitle}>ÖDÜLLÜ REKLAMLAR</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>DENARIUS</Text>

            <Text style={styles.contextValue}>🪙 {ludus.denarius}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>AKSİYON</Text>

            <Text style={styles.contextValue}>
              ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
            </Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← GERİ</Text>
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
          <Text style={styles.pageEyebrow}>EK KAYNAK</Text>

          <Text style={styles.pageTitle}>ROMA'NIN ÖDÜLLERİ</Text>
        </View>

        <Text style={styles.pageDescription}>
          Reklam izleyerek günlük ek kaynak kazan. Her ödülün ayrı kullanım
          limiti vardır.
        </Text>
      </View>

      {/* CARDS */}
      <View
        style={[
          styles.cards,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        {REWARDED_AD_REWARDS.map((reward) => {
          const remaining = getRewardedAdRemainingCount(
            rewardedAdUsage,
            reward.type,
          );

          const disabled = remaining <= 0;

          const isActionPoint = reward.type === "action_point";

          return (
            <View key={reward.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardEyebrow}>
                    {isActionPoint ? "AKSİYON DESTEĞİ" : "EKONOMİ DESTEĞİ"}
                  </Text>

                  <Text style={styles.cardTitle}>
                    {reward.title.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.iconArea}>
                  <Text style={styles.cardIcon}>
                    {isActionPoint ? "⚡" : "🪙"}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>{reward.description}</Text>

              <View style={styles.divider} />

              <View style={styles.limitSection}>
                <View>
                  <Text style={styles.limitLabel}>BUGÜNKÜ KALAN HAK</Text>

                  <Text style={styles.limitValue}>
                    {remaining}/{reward.dailyLimit}
                  </Text>
                </View>

                <View style={styles.limitVisual}>
                  {Array.from({
                    length: reward.dailyLimit,
                  }).map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.limitDot,
                        index < remaining && styles.limitDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.rewardInfo}>
                <Text style={styles.rewardInfoLabel}>ÖDÜL</Text>

                <Text style={styles.rewardInfoValue}>
                  {isActionPoint ? "⚡" : "🪙"} {reward.title}
                </Text>
              </View>

              <Pressable
                disabled={disabled}
                style={[styles.watchButton, disabled && styles.disabledButton]}
                onPress={() => handleWatchAd(reward.type)}>
                <Text
                  style={[
                    styles.watchButtonText,
                    disabled && styles.disabledButtonText,
                  ]}>
                  {disabled ? "GÜNLÜK LİMİT DOLDU" : "REKLAMI İZLE"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* TEST MODE */}
      <View
        style={[
          styles.infoBox,
          {
            marginLeft: safeLeft,
            marginRight: safeRight,
          },
        ]}>
        <View style={styles.infoBadge}>
          <Text style={styles.infoBadgeText}>TEST</Text>
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>TEST MODU</Text>

          <Text style={styles.infoText}>
            Şimdilik gerçek reklam gösterilmiyor. Butona bastığında reklam
            tamamlanmış kabul edilerek ödül doğrudan veriliyor.
          </Text>
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
    marginBottom: 14,
  },

  menuButton: {
    height: 34,
    paddingHorizontal: 20,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  menuButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
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
    width: 205,
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
    minWidth: 70,
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
    fontSize: 9,
    marginTop: 1,
  },

  contextDivider: {
    width: 1,
    height: 23,
    backgroundColor: "#332C1D",
  },

  topRight: {
    flex: 1,
    alignItems: "flex-end",
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
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pageEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    marginTop: 1,
  },

  pageDescription: {
    width: 300,
    color: "#777065",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "right",
  },

  cards: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    paddingBottom: 10,
  },

  card: {
    flex: 1,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.8,
  },

  cardTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 2,
  },

  iconArea: {
    width: 46,
    height: 46,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#3B3222",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  cardIcon: {
    fontSize: 22,
  },

  cardDescription: {
    color: "#8D8578",
    fontSize: 8,
    lineHeight: 11,
    marginTop: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 10,
  },

  limitSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  limitLabel: {
    color: "#71695D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  limitValue: {
    color: "#D8C88F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  limitVisual: {
    flexDirection: "row",
    gap: 5,
  },

  limitDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#302B24",
    borderWidth: 1,
    borderColor: "#423A2B",
  },

  limitDotActive: {
    backgroundColor: "#B99B4D",
    borderColor: "#DDB936",
  },

  rewardInfo: {
    marginTop: 10,
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#30291C",
    borderRadius: 3,
    padding: 8,
  },

  rewardInfoLabel: {
    color: "#726A5D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  rewardInfoValue: {
    color: "#D9CEAD",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    marginTop: 2,
  },

  watchButton: {
    height: 34,
    marginTop: "auto",
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  watchButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  disabledButton: {
    backgroundColor: "#29251D",
    borderWidth: 1,
    borderColor: "#3B362D",
  },

  disabledButtonText: {
    color: "#676159",
  },

  infoBox: {
    minHeight: 54,
    marginBottom: 10,
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#332C1D",
    borderRadius: 4,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  infoBadge: {
    width: 38,
    height: 26,
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoBadgeText: {
    color: "#B99B4D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#806C35",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  infoText: {
    color: "#77716A",
    fontSize: 7.5,
    lineHeight: 10,
    marginTop: 2,
  },
});
