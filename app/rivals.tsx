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

import { useGameStore } from "../src/store/gameStore";

export default function RivalsScreen() {
  const aiLuduses = useGameStore((state) => state.aiLuduses);
  const gladiators = useGameStore((state) => state.gladiators);
  const playerLudus = useGameStore((state) => state.playerLudus);

  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#DDB936" />
      </View>
    );
  }

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
          <Text style={styles.eyebrow}>ROMA'NIN GÜÇLERİ</Text>
          <Text style={styles.topTitle}>RAKİP LUDUSLAR</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>RAKİP</Text>
            <Text style={styles.contextValue}>{aiLuduses.length}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>SEVİYE</Text>
            <Text style={styles.contextValue}>{playerLudus?.level ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          {playerLudus && (
            <>
              <Text style={styles.resource}>★ {playerLudus.fame}</Text>
              <Text style={styles.resource}>🪙 {playerLudus.denarius}</Text>
            </>
          )}

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
          <Text style={styles.pageEyebrow}>HANEDANLAR</Text>
          <Text style={styles.pageTitle}>ROMA'DAKİ RAKİPLERİN</Text>
        </View>

        <Text style={styles.pageInfo}>
          Rakip Ludusların ekonomisini, seviyesini ve savaşçı kadrosunu takip
          et.
        </Text>
      </View>

      {/* RIVAL CARDS */}
      <ScrollView
        horizontal
        bounces={false}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={240}
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
        {aiLuduses.map((ludus) => {
          const ludusGladiators = gladiators.filter(
            (gladiator) => gladiator.ludusId === ludus.id,
          );

          return (
            <View key={ludus.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.nameArea}>
                  <Text style={styles.cardEyebrow}>RAKİP LUDUS</Text>

                  <Text style={styles.ludusName} numberOfLines={1}>
                    {ludus.name.toUpperCase()}
                  </Text>

                  <Text style={styles.lanista} numberOfLines={1}>
                    LANISTA · {ludus.lanistaName}
                  </Text>
                </View>

                <View style={styles.personalityBadge}>
                  <Text style={styles.personality}>
                    {ludus.aiPersonality?.toUpperCase() ?? "BİLİNMİYOR"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoGrid}>
                <Info label="DENARIUS" value={`${ludus.denarius} D`} />
                <Info label="SEVİYE" value={`${ludus.level}`} />
                <Info label="ŞÖHRET" value={`${ludus.fame}`} />
                <Info label="GLADYATÖR" value={`${ludusGladiators.length}`} />
              </View>

              <View style={styles.divider} />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>GLADYATÖRLER</Text>

                <Text style={styles.sectionCount}>
                  {ludusGladiators.length}
                </Text>
              </View>

              {ludusGladiators.length === 0 ? (
                <View style={styles.emptyArea}>
                  <Text style={styles.emptyText}>Henüz gladyatörü yok.</Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.gladiatorList}
                  contentContainerStyle={styles.gladiatorListContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled>
                  {ludusGladiators.map((gladiator) => (
                    <View key={gladiator.id} style={styles.gladiatorRow}>
                      <View style={styles.gladiatorIdentity}>
                        <Text style={styles.gladiatorName} numberOfLines={1}>
                          {gladiator.name.toUpperCase()}
                        </Text>

                        <Text style={styles.gladiatorMeta}>
                          {gladiator.class.toUpperCase()} · {gladiator.age} YAŞ
                        </Text>
                      </View>

                      <Text style={styles.gladiatorValue}>
                        {gladiator.marketValue} D
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    minWidth: 46,
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
    fontSize: 11,
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
    gap: 11,
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
    maxWidth: 310,
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
    width: 230,
    height: 240,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 11,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  nameArea: {
    flex: 1,
    paddingRight: 8,
  },

  cardEyebrow: {
    color: "#77653B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  ludusName: {
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  lanista: {
    color: "#827B70",
    fontSize: 7.5,
    marginTop: 2,
  },

  personalityBadge: {
    minHeight: 22,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#65522B",
    borderRadius: 3,
    backgroundColor: "#211B10",
    alignItems: "center",
    justifyContent: "center",
  },

  personality: {
    color: "#C3A34F",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 7,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  infoItem: {
    width: "48%",
    marginVertical: 2,
  },

  infoLabel: {
    color: "#777067",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  infoValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    marginTop: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#A88D49",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1,
  },

  sectionCount: {
    color: "#716957",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  gladiatorList: {
    flex: 1,
    marginTop: 4,
  },

  gladiatorListContent: {
    paddingBottom: 4,
  },

  gladiatorRow: {
    minHeight: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#28231B",
  },

  gladiatorIdentity: {
    flex: 1,
    paddingRight: 8,
  },

  gladiatorName: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  gladiatorMeta: {
    color: "#706A62",
    fontSize: 7,
    marginTop: 1,
  },

  gladiatorValue: {
    color: "#B99B4D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  emptyArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#676159",
    fontSize: 8,
  },
});
