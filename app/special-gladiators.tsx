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
  SPECIAL_GLADIATORS,
  SpecialGladiatorDefinition,
} from "../src/features/gladiators/specialGladiators";

import { useGameStore } from "../src/store/gameStore";

export default function SpecialGladiatorsScreen() {
  const playerLudus = useGameStore((state) => state.playerLudus);

  const gladiators = useGameStore((state) => state.gladiators);

  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const playerGladiators = playerLudus
    ? gladiators.filter((gladiator) => gladiator.ludusId === playerLudus.id)
    : [];

  const alreadyOwned = (special: SpecialGladiatorDefinition) => {
    return playerGladiators.some(
      (gladiator) =>
        gladiator.name.toLocaleLowerCase("tr-TR") ===
        special.name.toLocaleLowerCase("tr-TR"),
    );
  };

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
          <Text style={styles.eyebrow}>ROMA'NIN EFSANELERİ</Text>

          <Text style={styles.topTitle}>ÖZEL GLADYATÖRLER</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>EFSANE</Text>

            <Text style={styles.contextValue}>{SPECIAL_GLADIATORS.length}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>LUDUS'TA</Text>

            <Text style={styles.contextValue}>
              {
                SPECIAL_GLADIATORS.filter((special) => alreadyOwned(special))
                  .length
              }
            </Text>
          </View>
        </View>

        <View style={styles.resources}>
          {playerLudus && (
            <>
              <Text style={styles.resource}>LV. {playerLudus.level}</Text>

              <Text style={styles.resource}>🪙 {playerLudus.denarius}</Text>
            </>
          )}

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← PAZAR</Text>
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
          <Text style={styles.pageEyebrow}>NADİR SAVAŞÇILAR</Text>

          <Text style={styles.pageTitle}>ROMA'NIN EFSANELERİ</Text>
        </View>

        <Text style={styles.pageInfo}>
          Arenada ün kazanmış en güçlü ve nadir gladyatörler.
        </Text>
      </View>

      {/* CARDS */}
      <ScrollView
        horizontal
        bounces={false}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={260}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={[
          styles.cardsContainer,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        {SPECIAL_GLADIATORS.map((special) => {
          const owned = alreadyOwned(special);

          return (
            <View key={special.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.legendaryLabel}>EFSANEVİ GLADYATÖR</Text>

                  <Text style={styles.name} numberOfLines={1}>
                    {special.name.toUpperCase()}
                  </Text>

                  <Text style={styles.gladiatorTitle} numberOfLines={1}>
                    {special.title}
                  </Text>
                </View>

                <View
                  style={[
                    styles.legendBadge,
                    owned && styles.ownedLegendBadge,
                  ]}>
                  <Text
                    style={[
                      styles.legendBadgeText,
                      owned && styles.ownedLegendText,
                    ]}>
                    {owned ? "SAHİP" : "EFSANE"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>{special.age} YAŞ</Text>

                <Text style={styles.dot}>·</Text>

                <Text style={styles.infoText}>
                  {special.origin.toUpperCase()}
                </Text>

                <Text style={styles.dot}>·</Text>

                <Text style={styles.classText}>
                  {special.class.toUpperCase()}
                </Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.description} numberOfLines={3}>
                {special.description}
              </Text>

              <View style={styles.statsBox}>
                <Stat label="GÜÇ" value={special.strength} />

                <Stat label="DAYANIKLILIK" value={special.endurance} />

                <Stat label="ÇEVİKLİK" value={special.agility} />

                <Stat label="SALDIRI" value={special.attack} />

                <Stat label="SAVUNMA" value={special.defense} />

                <Stat label="CESARET" value={special.courage} />
              </View>

              <View style={styles.bottomInfo}>
                <View style={styles.valueBlock}>
                  <Text style={styles.smallLabel}>POTANSİYEL</Text>

                  <Text style={styles.highlightValue}>{special.potential}</Text>
                </View>

                <View style={styles.valueDivider} />

                <View style={styles.valueBlock}>
                  <Text style={styles.smallLabel}>PİYASA DEĞERİ</Text>

                  <Text style={styles.highlightValue}>
                    {special.marketValue} D
                  </Text>
                </View>
              </View>

              <View
                style={[styles.statusArea, owned && styles.statusAreaOwned]}>
                <Text
                  style={[styles.statusText, owned && styles.statusTextOwned]}>
                  {owned ? "LUDUS'TA" : "HENÜZ ELDE EDİLMEDİ"}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

type StatProps = {
  label: string;
  value: number;
};

function Stat({ label, value }: StatProps) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>

      <View style={styles.statTrack}>
        <View
          style={[
            styles.statFill,
            {
              width: `${Math.min(100, value)}%`,
            },
          ]}
        />
      </View>

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

  topBar: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#100D08",
    borderBottomWidth: 1,
    borderBottomColor: "#332A1A",
  },

  identity: {
    width: 210,
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
    minWidth: 48,
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
    maxWidth: 290,
    color: "#777065",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "right",
  },

  cardsContainer: {
    gap: 10,
    paddingBottom: 8,
    alignItems: "flex-start",
  },

  card: {
    width: 250,
    height: 248,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#6D5629",
    borderRadius: 5,
    padding: 11,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  legendaryLabel: {
    color: "#8F773D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  name: {
    maxWidth: 170,
    color: "#E5C34D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 2,
  },

  gladiatorTitle: {
    maxWidth: 170,
    color: "#B89A57",
    fontSize: 8,
    marginTop: 2,
  },

  legendBadge: {
    height: 23,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: "#80632F",
    backgroundColor: "#211B10",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  ownedLegendBadge: {
    borderColor: "#526446",
    backgroundColor: "#192016",
  },

  legendBadgeText: {
    color: "#DDB936",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  ownedLegendText: {
    color: "#8FAF72",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 5,
  },

  infoText: {
    color: "#AAA18D",
    fontSize: 7.5,
  },

  classText: {
    color: "#C3A34F",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
  },

  dot: {
    color: "#544831",
    fontSize: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 7,
  },

  description: {
    color: "#938B7A",
    fontSize: 8,
    lineHeight: 11,
    minHeight: 31,
  },

  statsBox: {
    marginTop: 7,
    gap: 4,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statLabel: {
    width: 72,
    color: "#8C836F",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  statTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#282319",
    overflow: "hidden",
  },

  statFill: {
    height: "100%",
    backgroundColor: "#B99B4D",
  },

  statValue: {
    width: 26,
    textAlign: "right",
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  bottomInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: "#332C1D",
  },

  valueBlock: {
    flex: 1,
  },

  valueDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#332C1D",
    marginHorizontal: 8,
  },

  smallLabel: {
    color: "#736B5B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  highlightValue: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    marginTop: 1,
  },

  statusArea: {
    height: 31,
    borderWidth: 1,
    borderColor: "#51452B",
    backgroundColor: "#211C13",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },

  statusAreaOwned: {
    borderColor: "#526446",
    backgroundColor: "#192016",
  },

  statusText: {
    color: "#8D7B4A",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  statusTextOwned: {
    color: "#8FAF72",
  },
});
