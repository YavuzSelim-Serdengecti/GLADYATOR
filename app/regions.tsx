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
  GAME_REGIONS,
  getNextRegionUnlock,
  isRegionUnlocked,
} from "../src/features/map/regions";

import { useGameStore } from "../src/store/gameStore";

export default function RegionsScreen() {
  const ludus = useGameStore((state) => state.playerLudus);

  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
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

  const nextRegion = getNextRegionUnlock(ludus.level);

  const unlockedCount = GAME_REGIONS.filter((region) =>
    isRegionUnlocked(region.id, ludus.level),
  ).length;

  const horizontalPadding = Math.max(24, insets.left, insets.right);

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      {/* TOP BAR */}
      <View
        style={[
          styles.topBar,
          {
            paddingLeft: Math.max(24, insets.left + 12),
            paddingRight: Math.max(24, insets.right + 12),
          },
        ]}>
        <View style={styles.identity}>
          <Text style={styles.eyebrow}>ROMA DÜNYASI</Text>

          <Text style={styles.topTitle}>BÖLGELER</Text>
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
              {unlockedCount}/{GAME_REGIONS.length}
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>PRESTİJ</Text>
            <Text style={styles.contextValue}>{ludus.prestige}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

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
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
          },
        ]}>
        <View>
          <Text style={styles.pageEyebrow}>ROMA'NIN TOPRAKLARI</Text>

          <Text style={styles.pageTitle}>BÖLGE İLERLEMESİ</Text>
        </View>

        <Text style={styles.pageInfo}>
          Ludus seviyen yükseldikçe Roma dünyasında yeni bölgeler açılır.
        </Text>
      </View>

      {/* NEXT REGION */}
      {nextRegion && (
        <View
          style={[
            styles.nextUnlockCard,
            {
              marginLeft: horizontalPadding,
              marginRight: horizontalPadding,
            },
          ]}>
          <View style={styles.nextUnlockLeft}>
            <View style={styles.nextIconBox}>
              <Text style={styles.nextIcon}>⌖</Text>
            </View>

            <View>
              <Text style={styles.nextUnlockLabel}>SONRAKİ BÖLGE</Text>

              <Text style={styles.nextUnlockTitle}>
                {nextRegion.name.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.nextUnlockRight}>
            <Text style={styles.nextLevelLabel}>GEREKLİ SEVİYE</Text>

            <Text style={styles.nextLevelValue}>
              LV. {nextRegion.requiredLevel}
            </Text>
          </View>
        </View>
      )}

      {/* REGION CARDS */}
      <ScrollView
        horizontal
        bounces={false}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={220}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={[
          styles.list,
          {
            paddingLeft: horizontalPadding,
            paddingRight: horizontalPadding,
          },
        ]}>
        {GAME_REGIONS.map((region) => {
          const unlocked = isRegionUnlocked(region.id, ludus.level);
          const current = region.id === "roma";

          return (
            <Pressable
              key={region.id}
              disabled={!unlocked}
              style={[
                styles.regionCard,
                current && styles.currentCard,
                !unlocked && styles.lockedCard,
              ]}>
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.regionIconBox,
                    current && styles.currentIconBox,
                    !unlocked && styles.lockedIconBox,
                  ]}>
                  <Text
                    style={[styles.regionIcon, !unlocked && styles.lockedIcon]}>
                    {unlocked ? "⌖" : "×"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    unlocked ? styles.openBadge : styles.closedBadge,
                    current && styles.currentBadge,
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      unlocked ? styles.openText : styles.closedText,
                      current && styles.currentStatusText,
                    ]}>
                    {unlocked
                      ? current
                        ? "MEVCUT"
                        : "AÇIK"
                      : `LV. ${region.requiredLevel}`}
                  </Text>
                </View>
              </View>

              <View style={styles.regionTitleArea}>
                <Text
                  style={[styles.regionName, !unlocked && styles.lockedName]}
                  numberOfLines={1}>
                  {region.name.toUpperCase()}
                </Text>

                <Text
                  style={[
                    styles.regionSubtitle,
                    !unlocked && styles.lockedSecondaryText,
                  ]}
                  numberOfLines={1}>
                  {region.subtitle}
                </Text>
              </View>

              <View style={styles.divider} />

              <Text
                style={[
                  styles.regionDescription,
                  !unlocked && styles.lockedSecondaryText,
                ]}
                numberOfLines={3}>
                {region.description}
              </Text>

              <View style={styles.cardBottom}>
                {current ? (
                  <View style={styles.currentArea}>
                    <View style={styles.currentDot} />

                    <Text style={styles.currentText}>ŞU ANKİ BÖLGEN</Text>
                  </View>
                ) : unlocked ? (
                  <View style={styles.availableArea}>
                    <View style={styles.availableDot} />

                    <Text style={styles.availableText}>ERİŞİME AÇIK</Text>
                  </View>
                ) : (
                  <View style={styles.lockArea}>
                    <Text style={styles.lockLabel}>KİLİTLİ</Text>

                    <Text style={styles.lockRequirement}>
                      LV. {region.requiredLevel}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
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
    width: 185,
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
    letterSpacing: 1.4,
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
    height: 56,
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
    maxWidth: 300,
    color: "#777065",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "right",
  },

  nextUnlockCard: {
    height: 46,
    marginBottom: 10,
    paddingHorizontal: 11,
    backgroundColor: "#17140F",
    borderWidth: 1,
    borderColor: "#4B4028",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  nextUnlockLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  nextIconBox: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#65522B",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  nextIcon: {
    color: "#C9A74C",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
  },

  nextUnlockLabel: {
    color: "#806C35",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.8,
  },

  nextUnlockTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    marginTop: 1,
  },

  nextUnlockRight: {
    alignItems: "flex-end",
  },

  nextLevelLabel: {
    color: "#756E63",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  nextLevelValue: {
    color: "#D8C88F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    marginTop: 1,
  },

  list: {
    gap: 10,
    paddingBottom: 14,
    alignItems: "flex-start",
  },

  regionCard: {
    width: 210,
    height: 188,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 11,
  },

  currentCard: {
    borderColor: "#A88A3E",
    backgroundColor: "#19150E",
  },

  lockedCard: {
    borderColor: "#302B23",
    backgroundColor: "#12100D",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  regionIconBox: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#544626",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  currentIconBox: {
    borderColor: "#A88A3E",
    backgroundColor: "#211B10",
  },

  lockedIconBox: {
    borderColor: "#38332B",
  },

  regionIcon: {
    color: "#B99B4D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
  },

  lockedIcon: {
    color: "#55514B",
  },

  statusBadge: {
    minHeight: 21,
    paddingHorizontal: 7,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  openBadge: {
    backgroundColor: "#182015",
    borderColor: "#405037",
  },

  closedBadge: {
    backgroundColor: "#1A1815",
    borderColor: "#37332C",
  },

  currentBadge: {
    backgroundColor: "#241E10",
    borderColor: "#80632F",
  },

  statusText: {
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  openText: {
    color: "#8FAF72",
  },

  closedText: {
    color: "#746E65",
  },

  currentStatusText: {
    color: "#DDB936",
  },

  regionTitleArea: {
    marginTop: 9,
  },

  regionName: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
  },

  lockedName: {
    color: "#7B756D",
  },

  regionSubtitle: {
    color: "#A38F5C",
    fontSize: 8,
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 7,
  },

  regionDescription: {
    color: "#918A80",
    fontSize: 8,
    lineHeight: 11,
  },

  lockedSecondaryText: {
    color: "#625E58",
  },

  cardBottom: {
    flex: 1,
    justifyContent: "flex-end",
  },

  currentArea: {
    height: 23,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#332C1D",
    marginTop: 4,
  },

  currentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDB936",
    marginRight: 6,
  },

  currentText: {
    color: "#B99B4D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  availableArea: {
    height: 23,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#332C1D",
    marginTop: 4,
  },

  availableDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#7E9A68",
    marginRight: 6,
  },

  availableText: {
    color: "#829D6D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  lockArea: {
    height: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#2C2822",
    marginTop: 4,
  },

  lockLabel: {
    color: "#67625C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  lockRequirement: {
    color: "#82796C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },
});
