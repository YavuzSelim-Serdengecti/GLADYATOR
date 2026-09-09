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
  getFinancialStatusLabel,
  MAX_DEBT_DAYS,
} from "../src/features/economy/bankruptcySystem";

import { useGameStore } from "../src/store/gameStore";

export default function FinancialStatusScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const ludus = useGameStore((state) => state.playerLudus);

  const bankruptcyState = useGameStore((state) => state.bankruptcyState);

  const lastDailyExpenses = useGameStore((state) => state.lastDailyExpenses);

  const lastDailyIncome = useGameStore((state) => state.lastDailyIncome);

  const lastFinancialMessage = useGameStore(
    (state) => state.lastFinancialMessage,
  );

  const resetGame = useGameStore((state) => state.resetGame);

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

  const totalIncome = lastDailyIncome?.totalIncome ?? 0;

  const totalExpenses = lastDailyExpenses?.totalCost ?? 0;

  const netDaily = totalIncome - totalExpenses;

  const debtDaysRemaining = Math.max(
    0,
    MAX_DEBT_DAYS - bankruptcyState.debtDays,
  );

  const statusLabel = getFinancialStatusLabel(bankruptcyState.status);

  const handleBankruptcyExit = () => {
    resetGame();

    router.replace("/");
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
          <Text style={styles.eyebrow}>LUDUS EKONOMİSİ</Text>

          <Text style={styles.topTitle}>MALİ DURUM</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>KASA</Text>

            <Text
              style={[
                styles.contextValue,
                ludus.denarius < 0 && styles.dangerText,
              ]}>
              {ludus.denarius} D
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>NET</Text>

            <Text
              style={[styles.contextValue, netDaily < 0 && styles.dangerText]}>
              {netDaily > 0 ? "+" : ""}
              {netDaily} D
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>BORÇLU GÜN</Text>

            <Text style={styles.contextValue}>
              {bankruptcyState.debtDays}/{MAX_DEBT_DAYS}
            </Text>
          </View>
        </View>

        <View style={styles.topRight}>
          <Text
            style={[
              styles.statusTopText,
              bankruptcyState.status === "bankrupt" && styles.dangerText,
            ]}>
            {statusLabel.toUpperCase()}
          </Text>

          {!bankruptcyState.bankrupt && (
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← GERİ</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        {bankruptcyState.bankrupt && (
          <View style={styles.bankruptBanner}>
            <Text style={styles.bankruptEyebrow}>OYUN BİTTİ</Text>

            <Text style={styles.bankruptTitle}>LUDUS İFLAS ETTİ</Text>

            <Text style={styles.bankruptDescription}>
              Borçlarını uzun süre ödeyemediğin için Ludus'un mali faaliyetleri
              sona erdi.
            </Text>
          </View>
        )}

        {/* DAILY STATS */}
        <View style={styles.statsRow}>
          <StatCard
            label="KASA"
            value={`${ludus.denarius} D`}
            description={
              ludus.denarius < 0 ? "Borç bakiyesi" : "Mevcut Denarius"
            }
            danger={ludus.denarius < 0}
          />

          <StatCard
            label="GÜNLÜK GELİR"
            value={`+${totalIncome} D`}
            description="Son günün pasif geliri"
          />

          <StatCard
            label="GÜNLÜK GİDER"
            value={`-${totalExpenses} D`}
            description="Son günün toplam gideri"
            danger={totalExpenses > totalIncome}
          />

          <StatCard
            label="GÜNLÜK NET"
            value={`${netDaily > 0 ? "+" : ""}${netDaily} D`}
            description={netDaily >= 0 ? "Ekonomi büyüyor" : "Günlük açık"}
            danger={netDaily < 0}
          />
        </View>

        {/* STATUS */}
        <View
          style={[
            styles.statusCard,
            bankruptcyState.status === "warning" && styles.warningCard,
            bankruptcyState.status === "debt" && styles.debtCard,
            bankruptcyState.status === "critical" && styles.criticalCard,
            bankruptcyState.status === "bankrupt" && styles.bankruptCard,
          ]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>FİNANSAL SAĞLIK</Text>

              <Text
                style={[
                  styles.statusTitle,
                  bankruptcyState.status === "bankrupt" && styles.dangerText,
                ]}>
                {statusLabel.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.ludusName}>{ludus.name.toUpperCase()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusGrid}>
            <StatusItem
              label="TOPLAM BORÇ"
              value={`${bankruptcyState.totalDebt} D`}
            />

            <StatusItem
              label="BORÇLU GÜN"
              value={`${bankruptcyState.debtDays}`}
            />

            <StatusItem label="İFLAS SINIRI" value={`${MAX_DEBT_DAYS} GÜN`} />

            <StatusItem
              label="KALAN SÜRE"
              value={
                bankruptcyState.bankrupt ? "0 GÜN" : `${debtDaysRemaining} GÜN`
              }
            />
          </View>

          {lastFinancialMessage && (
            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>SON MALİ RAPOR</Text>

              <Text style={styles.messageText}>{lastFinancialMessage}</Text>
            </View>
          )}
        </View>

        {/* RULES */}
        {!bankruptcyState.bankrupt && (
          <View style={styles.explanationCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>EKONOMİK BAŞARISIZLIK</Text>

                <Text style={styles.explanationTitle}>BORÇ NASIL ÇALIŞIR?</Text>
              </View>

              <Text style={styles.ruleCounter}>4 KURAL</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.rulesGrid}>
              <Rule
                number="01"
                title="BORÇ"
                text="Gün sonunda giderlerin gelir ve kasandaki paradan fazlaysa Denarius negatif değere düşer."
              />

              <Rule
                number="02"
                title="TOPARLANMA"
                text="Borçtayken Arena, işçiler ve diğer gelir kaynaklarıyla kasanı yeniden pozitife çıkarabilirsin."
              />

              <Rule
                number="03"
                title="MALİ KRİZ"
                text="Borç 3 gün sürerse veya borç miktarı çok büyürse Ludus düzen ve prestij kaybetmeye başlar."
              />

              <Rule
                number="04"
                title="İFLAS"
                text={`Ludus ${MAX_DEBT_DAYS} gün arka arkaya negatif kasada kalırsa iflas eder ve oyun sona erer.`}
              />
            </View>
          </View>
        )}

        {/* GAME OVER */}
        {bankruptcyState.bankrupt && (
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverEyebrow}>SON</Text>

            <Text style={styles.gameOverTitle}>ROMA SENİ UNUTMAYACAK</Text>

            <Text style={styles.gameOverText}>
              {ludus.name} artık faaliyetlerine devam edemiyor. Yeni bir Ludus
              kurarak Roma'da yeniden yükselmeyi deneyebilirsin.
            </Text>

            <Pressable
              style={styles.newGameButton}
              onPress={handleBankruptcyExit}>
              <Text style={styles.newGameButtonText}>ANA MENÜYE DÖN</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  description,
  danger = false,
}: {
  label: string;
  value: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>

      <Text style={[styles.statValue, danger && styles.dangerText]}>
        {value}
      </Text>

      <Text style={styles.statDescription}>{description}</Text>
    </View>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusItem}>
      <Text style={styles.statusItemLabel}>{label}</Text>

      <Text style={styles.statusItemValue}>{value}</Text>
    </View>
  );
}

function Rule({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.rule}>
      <View style={styles.ruleNumber}>
        <Text style={styles.ruleNumberText}>{number}</Text>
      </View>

      <View style={styles.ruleText}>
        <Text style={styles.ruleTitle}>{title}</Text>

        <Text style={styles.ruleDescription}>{text}</Text>
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

  topRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },

  statusTopText: {
    color: "#BDA45C",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
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

  scroll: {
    flex: 1,
  },

  content: {
    paddingTop: 10,
    paddingBottom: 18,
    gap: 9,
  },

  bankruptBanner: {
    backgroundColor: "#21100E",
    borderWidth: 1,
    borderColor: "#8B3530",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  bankruptEyebrow: {
    color: "#A55751",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1.5,
  },

  bankruptTitle: {
    color: "#D86E67",
    fontFamily: "Cinzel_700Bold",
    fontSize: 17,
    marginTop: 2,
  },

  bankruptDescription: {
    maxWidth: 420,
    color: "#A58D88",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "center",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
  },

  statCard: {
    flex: 1,
    minHeight: 72,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  statLabel: {
    color: "#77716A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.5,
  },

  statValue: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  statDescription: {
    color: "#6F6960",
    fontSize: 7,
    marginTop: 2,
  },

  statusCard: {
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#4B4028",
    borderRadius: 5,
    padding: 12,
  },

  warningCard: {
    borderColor: "#8A7132",
  },

  debtCard: {
    borderColor: "#9B5D31",
  },

  criticalCard: {
    borderColor: "#9A4039",
    backgroundColor: "#1D1210",
  },

  bankruptCard: {
    borderColor: "#B3453D",
    backgroundColor: "#24100F",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionEyebrow: {
    color: "#806C35",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  statusTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  ludusName: {
    color: "#777065",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  dangerText: {
    color: "#D86E67",
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 8,
  },

  statusGrid: {
    flexDirection: "row",
    gap: 7,
  },

  statusItem: {
    flex: 1,
    minHeight: 47,
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#2C261C",
    borderRadius: 3,
    paddingHorizontal: 8,
    justifyContent: "center",
  },

  statusItemLabel: {
    color: "#6F6961",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  statusItemValue: {
    color: "#D8C88F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    marginTop: 2,
  },

  messageBox: {
    marginTop: 8,
    backgroundColor: "#211A11",
    borderWidth: 1,
    borderColor: "#382E1D",
    borderRadius: 3,
    padding: 8,
  },

  messageLabel: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginBottom: 2,
  },

  messageText: {
    color: "#BAA875",
    fontSize: 7.5,
    lineHeight: 10,
  },

  explanationCard: {
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#332C1D",
    borderRadius: 5,
    padding: 12,
  },

  explanationTitle: {
    color: "#D8C88F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 11,
    marginTop: 2,
  },

  ruleCounter: {
    color: "#6F6759",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  rulesGrid: {
    flexDirection: "row",
    gap: 8,
  },

  rule: {
    flex: 1,
    minHeight: 78,
    flexDirection: "row",
    backgroundColor: "#17140F",
    borderWidth: 1,
    borderColor: "#2F291E",
    borderRadius: 4,
    padding: 8,
  },

  ruleNumber: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#80632F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  ruleNumberText: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  ruleText: {
    flex: 1,
  },

  ruleTitle: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7.5,
  },

  ruleDescription: {
    color: "#706A62",
    fontSize: 7,
    lineHeight: 10,
    marginTop: 3,
  },

  gameOverCard: {
    backgroundColor: "#17100F",
    borderWidth: 1,
    borderColor: "#8B3530",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },

  gameOverEyebrow: {
    color: "#8F4B46",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1.5,
  },

  gameOverTitle: {
    color: "#D86E67",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 2,
  },

  gameOverText: {
    maxWidth: 430,
    color: "#927F7A",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "center",
    marginTop: 5,
  },

  newGameButton: {
    width: 170,
    height: 34,
    marginTop: 12,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  newGameButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },
});
