import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGameStore } from "../src/store/gameStore";

const TEST_GLADIATOR_PORTRAIT = require("../assets/images/faces/face_1_olive.png");

export default function GladiatorsScreen() {
  const insets = useSafeAreaInsets();

  const gladiators = useGameStore((state) => state.gladiators);
  const ludus = useGameStore((state) => state.playerLudus);

  const { width, height } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const playerGladiators = ludus
    ? gladiators.filter((gladiator) => gladiator.ludusId === ludus.id)
    : [];

  const activeCount = playerGladiators.filter(
    (gladiator) => gladiator.status === "active",
  ).length;

  const injuredCount = playerGladiators.filter(
    (gladiator) => gladiator.status === "injured",
  ).length;

  const pages = [];

  for (let i = 0; i < playerGladiators.length; i += 4) {
    pages.push(playerGladiators.slice(i, i + 4));
  }

  const contentWidth = width - safeLeft - safeRight;

  const columnGap = 10;
  const rowGap = 10;

  const cardWidth = (contentWidth - columnGap) / 2;

  const topBarHeight = 58;
  const pageHeaderHeight = 60;
  const verticalPadding = 18;

  const availableHeight =
    height - topBarHeight - pageHeaderHeight - verticalPadding;

  const cardHeight = Math.max(150, (availableHeight - rowGap) / 2);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

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
          <Text style={styles.eyebrow}>LUDUS YÖNETİMİ</Text>
          <Text style={styles.topTitle}>GLADYATÖRLER</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>TOPLAM</Text>
            <Text style={styles.contextValue}>{playerGladiators.length}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>HAZIR</Text>
            <Text style={styles.contextValue}>{activeCount}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>YARALI</Text>
            <Text style={styles.contextValue}>{injuredCount}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          {ludus && (
            <>
              <Text style={styles.resource}>LV. {ludus.level}</Text>

              <Text style={styles.resource}>
                ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
              </Text>

              <Text style={styles.resource}>🪙 {ludus.denarius}</Text>
            </>
          )}

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← LUDUS</Text>
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
        <View>
          <Text style={styles.pageEyebrow}>SAVAŞÇILARIN</Text>

          <Text style={styles.pageTitle}>
            {ludus?.name?.toUpperCase() ?? "LUDUS"}
          </Text>
        </View>

        <Text style={styles.pageInfo}>
          Gladyatörlerinin sağlık, kariyer ve durumlarını yönet.
        </Text>
      </View>

      {playerGladiators.length === 0 ? (
        <View
          style={[
            styles.emptyContainer,
            {
              paddingLeft: safeLeft,
              paddingRight: safeRight,
            },
          ]}>
          <Text style={styles.emptySymbol}>⚔</Text>

          <Text style={styles.emptyTitle}>HENÜZ GLADYATÖRÜN YOK</Text>

          <Text style={styles.emptyText}>
            Pazardan veya açık artırmadan yeni savaşçılar edinebilirsin.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          bounces={false}
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          style={styles.pageScroll}>
          {pages.map((page, pageIndex) => (
            <View
              key={pageIndex}
              style={[
                styles.page,
                {
                  width,
                  paddingLeft: safeLeft,
                  paddingRight: safeRight,
                },
              ]}>
              {page.map((gladiator) => {
                const hpPercentage =
                  gladiator.maxHp > 0
                    ? Math.max(
                        0,
                        Math.min(100, (gladiator.hp / gladiator.maxHp) * 100),
                      )
                    : 0;

                return (
                  <View
                    key={gladiator.id}
                    style={[
                      styles.card,
                      gladiator.status === "dead" && styles.deadCard,
                      gladiator.status === "injured" && styles.injuredCard,
                      {
                        width: cardWidth,
                        height: cardHeight,
                      },
                    ]}>
                    <View
                      style={[
                        styles.portrait,
                        gladiator.status === "dead" && styles.deadPortrait,
                      ]}>
                      <Image
                        source={TEST_GLADIATOR_PORTRAIT}
                        style={styles.portraitImage}
                        resizeMode="cover"
                      />

                      {gladiator.status === "dead" && (
                        <View style={styles.deadPortraitOverlay}>
                          <Text style={styles.deadPortraitIcon}>☠</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.middle}>
                      <View style={styles.nameRow}>
                        <View style={styles.nameArea}>
                          <Text
                            style={[
                              styles.name,
                              gladiator.status === "dead" && styles.deadName,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit>
                            {gladiator.name.toUpperCase()}
                          </Text>

                          <Text style={styles.meta}>
                            {gladiator.age} YAŞ ·{" "}
                            {gladiator.origin.toUpperCase()}
                          </Text>
                        </View>

                        <Text style={styles.className}>
                          {gladiator.class.toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.stats}>
                        <Stat label="Güç" value={gladiator.strength} />

                        <Stat
                          label="Dayanıklılık"
                          value={gladiator.endurance}
                        />

                        <Stat label="Çeviklik" value={gladiator.agility} />

                        <Stat label="Saldırı" value={gladiator.attack} />

                        <Stat label="Savunma" value={gladiator.defense} />

                        <Stat label="Cesaret" value={gladiator.courage} />
                      </View>
                    </View>

                    <View style={styles.rightArea}>
                      <View
                        style={[
                          styles.statusBadge,
                          gladiator.status === "injured" && styles.injuredBadge,
                          gladiator.status === "dead" && styles.deadBadge,
                        ]}>
                        <Text
                          style={[
                            styles.status,
                            gladiator.status === "injured" &&
                              styles.injuredStatus,
                            gladiator.status === "dead" && styles.deadStatus,
                          ]}>
                          {getStatusLabel(gladiator.status)}
                        </Text>
                      </View>

                      <View style={styles.healthArea}>
                        <View style={styles.healthHeader}>
                          <Text style={styles.smallLabel}>SAĞLIK</Text>

                          <Text style={styles.hp}>
                            {gladiator.hp}/{gladiator.maxHp}
                          </Text>
                        </View>

                        <View style={styles.hpBar}>
                          <View
                            style={[
                              styles.hpFill,
                              gladiator.status === "injured" &&
                                styles.injuredHpFill,
                              gladiator.status === "dead" && styles.deadHpFill,
                              {
                                width: `${hpPercentage}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>

                      {gladiator.status === "injured" && (
                        <View style={styles.injuryArea}>
                          <Text style={styles.smallLabel}>YARALANMA</Text>

                          <Text style={styles.injuryText}>
                            {getInjuryLabel(gladiator.injurySeverity)} ·{" "}
                            {gladiator.injuryDaysRemaining} GÜN
                          </Text>
                        </View>
                      )}

                      {gladiator.status === "dead" && (
                        <Text style={styles.deadText}>
                          ARENA'DA HAYATINI KAYBETTİ
                        </Text>
                      )}

                      <View style={styles.infoGrid}>
                        <Info
                          label="KARİYER"
                          value={`${gladiator.wins}G · ${gladiator.losses}M`}
                        />

                        <Info
                          label="MORAL"
                          value={`${gladiator.morale}/100`}
                          state={getConditionLabel(gladiator.morale)}
                          critical={gladiator.morale < 20}
                          low={gladiator.morale >= 20 && gladiator.morale < 40}
                        />

                        <Info
                          label="SADAKAT"
                          value={`${gladiator.loyalty}/100`}
                          state={getConditionLabel(gladiator.loyalty)}
                          critical={gladiator.loyalty < 20}
                          low={
                            gladiator.loyalty >= 20 && gladiator.loyalty < 40
                          }
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function Info({
  label,
  value,
  state,
  low = false,
  critical = false,
}: {
  label: string;
  value: string;
  state?: string;
  low?: boolean;
  critical?: boolean;
}) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.smallLabel}>{label}</Text>

      <Text
        style={[
          styles.infoValue,
          low && styles.lowValue,
          critical && styles.criticalValue,
        ]}
        numberOfLines={1}>
        {value}
        {state ? ` · ${state}` : ""}
      </Text>
    </View>
  );
}

function getStatusLabel(status: string) {
  if (status === "active") return "HAZIR";
  if (status === "injured") return "YARALI";
  if (status === "dead") return "ÖLDÜ";
  if (status === "retired") return "EMEKLİ";
  if (status === "auction") return "AÇIK ARTIRMA";
  if (status === "free") return "SERBEST";

  return status.toUpperCase();
}

function getInjuryLabel(severity: "minor" | "moderate" | "severe" | null) {
  if (severity === "minor") return "HAFİF";
  if (severity === "moderate") return "ORTA";
  if (severity === "severe") return "AĞIR";

  return "-";
}

function getConditionLabel(value: number) {
  if (value >= 80) return "ÇOK İYİ";
  if (value >= 60) return "İYİ";
  if (value >= 40) return "NORMAL";
  if (value >= 20) return "DÜŞÜK";

  return "KRİTİK";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0906",
  },

  background: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
    width: 190,
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
    gap: 11,
  },

  contextItem: {
    minWidth: 43,
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
    gap: 12,
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
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pageEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.6,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 16,
    letterSpacing: 1.1,
    marginTop: 2,
  },

  pageInfo: {
    color: "#777065",
    fontSize: 8,
  },

  pageScroll: {
    flex: 1,
  },

  page: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 10,
    alignContent: "center",
    paddingVertical: 9,
  },

  card: {
    backgroundColor: "rgba(23,19,13,0.96)",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 9,
    flexDirection: "row",
    overflow: "hidden",
  },

  injuredCard: {
    borderColor: "#70552F",
  },

  deadCard: {
    borderColor: "#54322E",
    opacity: 0.75,
  },

  portrait: {
    width: "21%",
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291D",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },

  portraitImage: {
    width: "100%",
    height: "100%",
  },

  deadPortrait: {
    backgroundColor: "#171313",
  },

  deadPortraitOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  deadPortraitIcon: {
    color: "#A65E54",
    fontSize: 30,
  },

  middle: {
    width: "47%",
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  nameRow: {
    minHeight: 35,
  },

  nameArea: {
    paddingRight: 3,
  },

  name: {
    color: "#E8DCBD",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
  },

  deadName: {
    color: "#8B7772",
  },

  meta: {
    color: "#8A8276",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    marginTop: 1,
  },

  className: {
    color: "#B7984B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    letterSpacing: 0.7,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 5,
  },

  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statRow: {
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1,
  },

  statLabel: {
    color: "#958D80",
    fontSize: 8,
  },

  statValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  rightArea: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#332C1D",
    paddingLeft: 9,
    justifyContent: "space-between",
  },

  statusBadge: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#536744",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },

  injuredBadge: {
    borderColor: "#795A35",
  },

  deadBadge: {
    borderColor: "#6A3832",
  },

  status: {
    color: "#8FAF72",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  injuredStatus: {
    color: "#C48A4A",
  },

  deadStatus: {
    color: "#A65E54",
  },

  healthArea: {
    marginTop: 2,
  },

  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  smallLabel: {
    color: "#777066",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.3,
  },

  hp: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  hpBar: {
    height: 4,
    backgroundColor: "#302C26",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 3,
  },

  hpFill: {
    height: "100%",
    backgroundColor: "#8FAF72",
  },

  injuredHpFill: {
    backgroundColor: "#B58546",
  },

  deadHpFill: {
    backgroundColor: "#7A3F39",
  },

  injuryArea: {
    marginTop: 3,
  },

  injuryText: {
    color: "#C48A4A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 1,
  },

  deadText: {
    color: "#A65E54",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 3,
  },

  infoGrid: {
    gap: 2,
  },

  infoItem: {
    minHeight: 20,
  },

  infoValue: {
    color: "#A59D8F",
    fontSize: 7.5,
    marginTop: 1,
  },

  lowValue: {
    color: "#C48A4A",
  },

  criticalValue: {
    color: "#A65E54",
    fontFamily: "Cinzel_600SemiBold",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

  emptySymbol: {
    color: "#65573A",
    fontSize: 30,
  },

  emptyTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 6,
  },

  emptyText: {
    color: "#80786D",
    fontSize: 8.5,
    marginTop: 6,
  },
});
