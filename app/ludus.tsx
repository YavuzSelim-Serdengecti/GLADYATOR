import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getCurrentLevelRequirement,
  getLudusLevelProgress,
  getNextLevelRequirement,
  isMaxLudusLevel,
} from "../src/features/ludus/ludusLevel";

import { useGameStore } from "../src/store/gameStore";

export default function LudusScreen() {
  const insets = useSafeAreaInsets();

  const ludus = useGameStore((state) => state.playerLudus);

  const gladiators = useGameStore((state) => state.gladiators);

  const buildings = useGameStore((state) => state.ludusBuildings);

  const lastDailyExpenses = useGameStore((state) => state.lastDailyExpenses);

  const lastDailyIncome = useGameStore((state) => state.lastDailyIncome);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#D4AF37" />
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

  const playerGladiators = gladiators.filter(
    (gladiator) => gladiator.ludusId === ludus.id,
  );

  const healthyGladiators = playerGladiators.filter(
    (gladiator) => gladiator.hp > 0 && gladiator.status === "active",
  );

  const trainingGround = buildings.find(
    (building) => building.type === "training_ground",
  );

  const trainingUnlocked = !!trainingGround?.isBuilt;

  const totalIncome = lastDailyIncome?.totalIncome ?? 0;

  const totalExpense = lastDailyExpenses?.totalCost ?? 0;

  const net = totalIncome - totalExpense;

  const hasDailyReport = !!lastDailyExpenses || !!lastDailyIncome;

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
          <Text numberOfLines={1} style={styles.ludusName}>
            {ludus.name}
          </Text>

          <Text numberOfLines={1} style={styles.lanista}>
            LANISTA · {ludus.lanistaName}
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

        <View style={styles.contextInfo}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>GLADYATÖR</Text>

            <Text style={styles.contextValue}>{playerGladiators.length}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>HAZIR</Text>

            <Text style={styles.contextValue}>{healthyGladiators.length}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          <Text style={styles.resource}>🪙 {ludus.denarius}</Text>

          <Text style={styles.resource}>★ {ludus.fame}</Text>

          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← HARİTA</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.pageHeader,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <Text style={styles.eyebrow}>SENİN LUDUSUN</Text>

        <Text style={styles.pageTitle}>LUDUS YÖNETİMİ</Text>
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.leftColumn}>
          <View style={styles.ludusVisual}>
            <View style={styles.visualOverlay} />

            <View style={styles.visualContent}>
              <Text style={styles.visualMark}>◆</Text>

              <Text style={styles.visualTitle}>{ludus.name}</Text>

              <Text style={styles.visualSubtitle}>HANEDANININ MERKEZİ</Text>
            </View>
          </View>

          <View style={styles.economyCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEyebrow}>MALİ DURUM</Text>

              <Text style={styles.cardTitle}>SON GÜN</Text>
            </View>

            {hasDailyReport ? (
              <View style={styles.economyContent}>
                <EconomyRow
                  label="Maden Geliri"
                  value={lastDailyIncome?.mineIncome ?? 0}
                  positive
                />

                <View style={styles.economyDivider} />

                <EconomyRow
                  label="Ludus"
                  value={lastDailyExpenses?.baseCost ?? 0}
                />

                <EconomyRow
                  label="Gladyatörler"
                  value={lastDailyExpenses?.gladiatorCost ?? 0}
                />

                <EconomyRow
                  label="Personel"
                  value={lastDailyExpenses?.staffCost ?? 0}
                />

                <EconomyRow
                  label="İşçiler"
                  value={lastDailyExpenses?.workerCost ?? 0}
                />

                <View style={styles.economyDivider} />

                <View style={styles.netRow}>
                  <Text style={styles.netLabel}>NET</Text>

                  <Text
                    style={[
                      styles.netValue,
                      net >= 0 ? styles.positiveText : styles.negativeText,
                    ]}>
                    {net >= 0 ? "+" : ""}
                    {net} D
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noReportText}>
                Henüz gün sonu raporu yok.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.menuArea}>
          <Text style={styles.sectionEyebrow}>YÖNETİM</Text>

          <Text style={styles.sectionTitle}>LUDUS İŞLEMLERİ</Text>

          <View style={styles.menuGrid}>
            <MenuButton
              title="GLADYATÖRLER"
              description={`${playerGladiators.length} savaşçı`}
              onPress={() => router.push("/gladiators")}
            />

            <MenuButton
              title="EĞİTİM ALANI"
              description={
                trainingUnlocked
                  ? "Gladyatörlerini geliştir"
                  : "Eğitim Alanı gerekli"
              }
              locked={!trainingUnlocked}
              onPress={
                trainingUnlocked ? () => router.push("/training") : undefined
              }
            />

            <MenuButton
              title="BİNALAR"
              description="Ludusunu geliştir"
              onPress={() => router.push("/ludus-buildings")}
            />

            <MenuButton
              title="PERSONEL"
              description="Medicus ve çalışanlar"
              onPress={() => router.push("/staff")}
            />

            <MenuButton
              title="OLAYLAR"
              description="İsyan, kaçış ve özgürlük"
              onPress={() => router.push("/events")}
            />

            <MenuButton
              title="ENVANTER"
              description="Silah ve zırhlar"
              onPress={() => router.push("/inventory")}
            />

            <MenuButton
              title="LUDUS BİLGİLERİ"
              description="Prestij ve gelişim"
              onPress={() => router.push("/ludus-info")}
              wide
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function EconomyRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <View style={styles.economyRow}>
      <Text style={styles.economyLabel}>{label}</Text>

      <Text
        style={[
          styles.economyValue,
          positive ? styles.positiveText : styles.negativeText,
        ]}>
        {positive ? "+" : "-"}
        {value} D
      </Text>
    </View>
  );
}

function MenuButton({
  title,
  description,
  onPress,
  locked = false,
  wide = false,
}: {
  title: string;
  description: string;
  onPress?: () => void;
  locked?: boolean;
  wide?: boolean;
}) {
  return (
    <Pressable
      disabled={locked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuButton,
        wide && styles.wideMenuButton,
        locked && styles.lockedButton,
        pressed && !locked && styles.menuButtonPressed,
      ]}>
      <View style={styles.menuAccent} />

      <View style={styles.menuTextArea}>
        <Text style={[styles.menuTitle, locked && styles.lockedText]}>
          {title}
        </Text>

        <Text numberOfLines={1} style={styles.menuDescription}>
          {description}
        </Text>
      </View>

      <Text style={[styles.menuArrow, locked && styles.lockedText]}>
        {locked ? "◆" : "›"}
      </Text>
    </Pressable>
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

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#15110C",
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
    fontSize: 18,
    letterSpacing: 1.5,
  },

  errorButton: {
    borderWidth: 1,
    borderColor: "#8F7331",
    borderRadius: 3,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },

  errorButtonText: {
    color: "#C6A549",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
  },

  topBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#100D08",
    borderBottomWidth: 1,
    borderBottomColor: "#332A1A",
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
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 2,
    letterSpacing: 0.4,
  },

  levelSection: {
    width: 165,
    marginRight: 18,
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

  contextInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    gap: 12,
  },

  contextItem: {
    alignItems: "center",
  },

  contextLabel: {
    color: "#6E6658",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.5,
  },

  contextValue: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    marginTop: 2,
  },

  contextDivider: {
    width: 1,
    height: 25,
    backgroundColor: "#332C1D",
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

  backButton: {
    height: 31,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#C1A14E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 0.4,
  },

  pageHeader: {
    paddingTop: 15,
    paddingBottom: 8,
  },

  eyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 2,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 18,
    letterSpacing: 1.5,
    marginTop: 2,
  },

  contentScroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
    paddingTop: 8,
    paddingBottom: 25,
  },

  leftColumn: {
    width: "31%",
    gap: 10,
  },

  ludusVisual: {
    height: 142,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1B160E",
    borderWidth: 1,
    borderColor: "#4C3E24",
    borderRadius: 4,
  },

  visualOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 12, 8, 0.35)",
  },

  visualContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  visualMark: {
    color: "#9D7D32",
    fontSize: 18,
    marginBottom: 7,
  },

  visualTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    letterSpacing: 1.6,
    textAlign: "center",
    paddingHorizontal: 10,
  },

  visualSubtitle: {
    color: "#797064",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
    marginTop: 5,
  },

  economyCard: {
    minHeight: 145,
    backgroundColor: "rgba(17, 14, 10, 0.92)",
    borderWidth: 1,
    borderColor: "#332C1D",
    borderRadius: 4,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  cardHeader: {
    marginBottom: 7,
  },

  cardEyebrow: {
    color: "#6D624B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  cardTitle: {
    color: "#B6984D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 1,
  },

  economyContent: {
    flex: 1,
  },

  economyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  economyLabel: {
    color: "#827A6C",
    fontSize: 8,
  },

  economyValue: {
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  positiveText: {
    color: "#8FAF72",
  },

  negativeText: {
    color: "#C77D68",
  },

  economyDivider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 5,
  },

  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  netLabel: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  netValue: {
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
  },

  noReportText: {
    color: "#6E675C",
    fontSize: 8,
    marginTop: 7,
  },

  menuArea: {
    flex: 1,
  },

  sectionEyebrow: {
    color: "#75673E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1.5,
  },

  sectionTitle: {
    color: "#C4A34A",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    letterSpacing: 1.1,
    marginTop: 2,
    marginBottom: 10,
  },

  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  menuButton: {
    width: "48.8%",
    height: 65,
    backgroundColor: "rgba(23, 19, 13, 0.94)",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 4,
    paddingRight: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  wideMenuButton: {
    width: "98.6%",
  },

  menuButtonPressed: {
    borderColor: "#B5933C",
    backgroundColor: "rgba(35, 28, 17, 0.97)",
  },

  lockedButton: {
    opacity: 0.42,
    borderColor: "#302C25",
  },

  menuAccent: {
    width: 3,
    height: "100%",
    backgroundColor: "#765E28",
    marginRight: 12,
  },

  menuTextArea: {
    flex: 1,
  },

  menuTitle: {
    color: "#D5C38C",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    letterSpacing: 0.5,
  },

  lockedText: {
    color: "#666158",
  },

  menuDescription: {
    color: "#7E7669",
    fontSize: 8,
    marginTop: 4,
  },

  menuArrow: {
    color: "#B99B4D",
    fontSize: 18,
    marginLeft: 8,
  },
});
