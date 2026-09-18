import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GladiatorPortrait from "../src/components/GladiatorPortrait";
import { arenas } from "../src/data/arenas";
import { useGameStore } from "../src/store/gameStore";
export default function ArenaSelectGladiatorScreen() {
  const { arenaId } = useLocalSearchParams<{
    arenaId: string;
  }>();

  const ludus = useGameStore((state) => state.playerLudus);
  const gladiators = useGameStore((state) => state.gladiators);

  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const arena = arenas.find((item) => item.id === arenaId);

  const playerGladiators = ludus
    ? gladiators.filter(
        (gladiator) =>
          gladiator.ludusId === ludus.id &&
          gladiator.status === "active" &&
          gladiator.hp > 0,
      )
    : [];

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#DDB936" />
      </View>
    );
  }

  if (!arena || !ludus) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>ARENA BİLGİSİ BULUNAMADI</Text>

        <Pressable style={styles.backButtonLarge} onPress={() => router.back()}>
          <Text style={styles.backButtonLargeText}>GERİ DÖN</Text>
        </Pressable>
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
          <Text style={styles.eyebrow}>ARENA HAZIRLIĞI</Text>
          <Text style={styles.topTitle}>GLADYATÖR SEÇİMİ</Text>
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
            <Text style={styles.contextLabel}>UYGUN</Text>
            <Text style={styles.contextValue}>{playerGladiators.length}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

          <Text style={styles.resource}>🪙 {ludus.denarius}</Text>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← ARENALAR</Text>
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
          <Text style={styles.pageEyebrow}>SAVAŞÇINI BELİRLE</Text>
          <Text style={styles.pageTitle}>GLADYATÖRÜNÜ SEÇ</Text>
        </View>

        <Text style={styles.pageInfo}>
          Arenaya göndereceğin savaşçının gücünü, sağlığını ve mevcut durumunu
          karşılaştır.
        </Text>
      </View>

      {playerGladiators.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>DÖVÜŞEBİLECEK GLADYATÖR YOK</Text>

          <Text style={styles.emptyText}>
            Aktif durumda ve HP değeri 0'ın üzerinde bir gladyatörün bulunmuyor.
          </Text>
        </View>
      ) : (
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
          {playerGladiators.map((gladiator) => {
            const averagePower = Math.round(
              (gladiator.strength +
                gladiator.endurance +
                gladiator.agility +
                gladiator.attack +
                gladiator.defense +
                gladiator.courage) /
                6,
            );

            const hpPercent =
              gladiator.maxHp > 0
                ? Math.max(
                    0,
                    Math.min(100, (gladiator.hp / gladiator.maxHp) * 100),
                  )
                : 0;

            return (
              <View key={gladiator.id} style={styles.card}>
                <GladiatorPortrait style={styles.portrait} />

                <View style={styles.identityArea}>
                  <Text style={styles.cardEyebrow}>
                    {gladiator.class.toUpperCase()}
                  </Text>

                  <Text style={styles.name} numberOfLines={1}>
                    {gladiator.name.toUpperCase()}
                  </Text>

                  <Text style={styles.meta}>
                    {gladiator.age} YAŞ · {gladiator.origin.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.powerRow}>
                  <View>
                    <Text style={styles.powerLabel}>ORTALAMA GÜÇ</Text>
                    <Text style={styles.powerValue}>{averagePower}</Text>
                  </View>

                  <View style={styles.careerArea}>
                    <Text style={styles.powerLabel}>KARİYER</Text>
                    <Text style={styles.careerValue}>
                      {gladiator.wins}G · {gladiator.losses}M
                    </Text>
                  </View>
                </View>

                <View style={styles.healthSection}>
                  <View style={styles.healthHeader}>
                    <Text style={styles.healthLabel}>SAĞLIK</Text>

                    <Text style={styles.healthValue}>
                      {gladiator.hp}/{gladiator.maxHp}
                    </Text>
                  </View>

                  <View style={styles.healthTrack}>
                    <View
                      style={[
                        styles.healthFill,
                        {
                          width: `${hpPercent}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <SmallStat label="YORGUNLUK" value={`${gladiator.fatigue}`} />

                  <View style={styles.statDivider} />

                  <SmallStat label="MORAL" value={`${gladiator.morale}`} />
                </View>

                <Pressable
                  style={styles.selectButton}
                  onPress={() =>
                    router.push({
                      pathname: "/arena-opponent",
                      params: {
                        arenaId: arena.id,
                        gladiatorId: gladiator.id,
                      },
                    })
                  }>
                  <Text style={styles.selectButtonText}>
                    BU GLADYATÖRLE DEVAM ET
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.smallStat}>
      <Text style={styles.smallStatLabel}>{label}</Text>
      <Text style={styles.smallStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0906",
  },

  background: {
    ...StyleSheet.absoluteFill,
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

  backButtonLarge: {
    height: 34,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonLargeText: {
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
    minWidth: 55,
    maxWidth: 125,
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
    letterSpacing: 1.3,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    letterSpacing: 1,
    marginTop: 1,
  },

  pageInfo: {
    maxWidth: 330,
    color: "#777065",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "right",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 35,
  },

  emptyTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
  },

  emptyText: {
    maxWidth: 400,
    color: "#77716A",
    fontSize: 9,
    lineHeight: 13,
    textAlign: "center",
    marginTop: 7,
  },

  list: {
    gap: 10,
    paddingBottom: 14,
    alignItems: "flex-start",
  },

  card: {
    width: 220,
    height: 235,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 10,
  },

  portrait: {
    height: 60,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291C",
    borderRadius: 3,
  },

  identityArea: {
    alignItems: "center",
    marginTop: 6,
  },

  cardEyebrow: {
    color: "#9C8243",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  name: {
    maxWidth: "100%",
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 1,
  },

  meta: {
    color: "#77716A",
    fontSize: 7.5,
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 6,
  },

  powerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  powerLabel: {
    color: "#756F65",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  powerValue: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 1,
  },

  careerArea: {
    alignItems: "flex-end",
  },

  careerValue: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    marginTop: 2,
  },

  healthSection: {
    marginTop: 6,
  },

  healthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  healthLabel: {
    color: "#756F65",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  healthValue: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  healthTrack: {
    height: 5,
    backgroundColor: "#292319",
    borderRadius: 3,
    overflow: "hidden",
  },

  healthFill: {
    height: "100%",
    backgroundColor: "#7C8C52",
  },

  statsRow: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  smallStat: {
    flex: 1,
    alignItems: "center",
  },

  smallStatLabel: {
    color: "#716B61",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  smallStatValue: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    marginTop: 1,
  },

  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#332C1D",
  },

  selectButton: {
    height: 31,
    marginTop: "auto",
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  selectButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7.5,
    letterSpacing: 0.2,
  },
});
