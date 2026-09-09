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
  DYNASTY_RANK_REQUIREMENTS,
  getCurrentLevelRequirement,
  getDynastyRank,
  getDynastyRankProgress,
  getLegacyInfo,
  getLudusLevelProgress,
  getNextLevelRequirement,
  getPrestigeToNextDynastyRank,
  getPrestigeToNextLevel,
  isMaxLudusLevel,
  LUDUS_LEVEL_REQUIREMENTS,
  MAX_LUDUS_LEVEL,
} from "../src/features/ludus/ludusLevel";

import { useGameStore } from "../src/store/gameStore";

export default function LudusInfoScreen() {
  const insets = useSafeAreaInsets();

  const ludus = useGameStore((state) => state.playerLudus);

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
          style={styles.menuButton}
          onPress={() => router.replace("/")}>
          <Text style={styles.menuButtonText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  const maxLevel = isMaxLudusLevel(ludus.level);

  const normalProgress = getLudusLevelProgress(ludus.prestige, ludus.level);

  const currentRequirement = getCurrentLevelRequirement(ludus.level);

  const nextRequirement = getNextLevelRequirement(ludus.level);

  const prestigeToNextLevel = getPrestigeToNextLevel(
    ludus.prestige,
    ludus.level,
  );

  const dynastyRank = getDynastyRank(ludus.prestige);

  const dynastyProgress = getDynastyRankProgress(ludus.prestige);

  const prestigeToNextDynasty = getPrestigeToNextDynastyRank(ludus.prestige);

  const legacy = getLegacyInfo(ludus.prestige);

  let progress = normalProgress;

  if (maxLevel) {
    progress = dynastyProgress;
  }

  if (legacy.unlocked) {
    progress = legacy.progress;
  }

  const progressEyebrow = legacy.unlocked
    ? "SONSUZ İLERLEME"
    : maxLevel
      ? "ENDGAME İLERLEMESİ"
      : "OYUNCU İLERLEMESİ";

  const progressTitle = legacy.unlocked
    ? `MİRAS SEVİYESİ ${legacy.level}`
    : maxLevel
      ? (dynastyRank?.rank ?? "HANEDAN")
      : `LV. ${ludus.level} → LV. ${ludus.level + 1}`;

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

          <Text style={styles.topTitle} numberOfLines={1}>
            {ludus.name.toUpperCase()}
          </Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>SEVİYE</Text>

            <Text style={styles.contextValue}>{ludus.level}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>PRESTİJ</Text>

            <Text style={styles.contextValue}>{ludus.prestige}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>ŞÖHRET</Text>

            <Text style={styles.contextValue}>{ludus.fame}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          {dynastyRank && (
            <Text style={styles.rankText}>{dynastyRank.rank}</Text>
          )}

          {legacy.unlocked && (
            <Text style={styles.legacyTopText}>MİRAS {legacy.level}</Text>
          )}

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← LUDUS</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageEyebrow}>LUDUS GELİŞİMİ</Text>

            <Text style={styles.pageTitle}>GÜÇ VE İTİBAR</Text>
          </View>

          <Text style={styles.pageInfo}>
            Roma'daki hanedanının gelişimini, prestijini ve ilerlemesini takip
            et.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="LUDUS SEVİYESİ"
            value={`${ludus.level}`}
            description={`Maksimum ${MAX_LUDUS_LEVEL}`}
          />

          <StatCard
            label="PRESTİJ"
            value={`${ludus.prestige}`}
            description={
              legacy.unlocked
                ? "Miras seviyesini geliştirir"
                : maxLevel
                  ? "Hanedan derecesini geliştirir"
                  : "Ludus seviyesini geliştirir"
            }
          />

          <StatCard
            label="ŞÖHRET"
            value={`${ludus.fame}`}
            description="Roma'daki tanınırlığın"
          />

          <StatCard
            label={
              legacy.unlocked ? "MİRAS" : dynastyRank ? "HANEDAN" : "DÜZEN"
            }
            value={
              legacy.unlocked
                ? `M${legacy.level}`
                : dynastyRank
                  ? `D${dynastyRank.rankNumber}`
                  : `${ludus.order}`
            }
            description={
              legacy.unlocked
                ? "Sonsuz ilerleme"
                : dynastyRank
                  ? dynastyRank.rank
                  : "Ludus düzeni"
            }
          />
        </View>

        <View
          style={[
            styles.progressCard,
            maxLevel && styles.dynastyProgressCard,
            legacy.unlocked && styles.legacyProgressCard,
          ]}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>{progressEyebrow}</Text>

              <Text style={styles.sectionTitle}>{progressTitle}</Text>
            </View>

            <Text style={styles.progressPercent}>%{Math.round(progress)}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                legacy.unlocked && styles.legacyProgressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          {legacy.unlocked ? (
            <>
              <View style={styles.progressNumbers}>
                <Text style={styles.progressText}>
                  {ludus.prestige} Prestij
                </Text>

                <Text style={styles.progressText}>
                  {legacy.nextRequirement} Prestij
                </Text>
              </View>

              <Text style={styles.remainingText}>
                Miras {legacy.level + 1} seviyesine{" "}
                <Text style={styles.goldText}>
                  {legacy.prestigeToNextLevel} Prestij
                </Text>{" "}
                kaldı.
              </Text>
            </>
          ) : maxLevel && dynastyRank ? (
            <>
              <View style={styles.progressNumbers}>
                <Text style={styles.progressText}>
                  {ludus.prestige} Prestij
                </Text>

                <Text style={styles.progressText}>
                  {dynastyRank.nextRequirement
                    ? `${dynastyRank.nextRequirement} Prestij`
                    : "MİRAS BAŞLANGICI"}
                </Text>
              </View>

              {dynastyRank.nextRequirement ? (
                <Text style={styles.remainingText}>
                  Sonraki hanedan derecesine{" "}
                  <Text style={styles.goldText}>
                    {prestigeToNextDynasty} Prestij
                  </Text>{" "}
                  kaldı.
                </Text>
              ) : (
                <Text style={styles.legendaryText}>
                  Roma'nın Efendisi oldun. Bundan sonra ilerleme Miras
                  sistemiyle devam eder.
                </Text>
              )}
            </>
          ) : (
            <>
              <View style={styles.progressNumbers}>
                <Text style={styles.progressText}>
                  {ludus.prestige} Prestij
                </Text>

                <Text style={styles.progressText}>
                  {nextRequirement} Prestij
                </Text>
              </View>

              <Text style={styles.remainingText}>
                Sonraki seviyeye{" "}
                <Text style={styles.goldText}>
                  {prestigeToNextLevel} Prestij
                </Text>{" "}
                kaldı.
              </Text>
            </>
          )}
        </View>

        {legacy.unlocked && (
          <View style={styles.legacyCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>MİRAS SİSTEMİ</Text>

                <Text style={styles.legacyTitle}>ROMA'NIN ÖTESİNDE</Text>
              </View>

              <View style={styles.legacyBadge}>
                <Text style={styles.badgeLabel}>MİRAS</Text>

                <Text style={styles.legacyBadgeNumber}>{legacy.level}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.legacyStatsRow}>
              <LegacyStat label="MEVCUT" value={`M${legacy.level}`} />

              <LegacyStat
                label="BAŞLANGIÇ"
                value={`${legacy.currentRequirement}`}
              />

              <LegacyStat label="SONRAKİ" value={`${legacy.nextRequirement}`} />

              <LegacyStat
                label="KALAN"
                value={`${legacy.prestigeToNextLevel}`}
              />
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                Her 5.000 Prestij yeni bir Miras Seviyesi kazandırır. Miras
                seviyesi sınırsızdır ve ilerleme devam eder.
              </Text>
            </View>
          </View>
        )}

        {maxLevel && dynastyRank && (
          <View style={styles.dynastyCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>HANEDAN SİSTEMİ</Text>

                <Text style={styles.dynastyTitle}>ROMA'DAKİ MİRASIN</Text>
              </View>

              <View style={styles.dynastyBadge}>
                <Text style={styles.badgeLabel}>DERECE</Text>

                <Text style={styles.dynastyBadgeNumber}>
                  {dynastyRank.rankNumber}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {DYNASTY_RANK_REQUIREMENTS.map((rank, index) => {
              const reached = ludus.prestige >= rank.prestige;

              const current = dynastyRank.rank === rank.rank;

              return (
                <View
                  key={rank.rank}
                  style={[
                    styles.dynastyRow,
                    current && styles.currentDynastyRow,
                  ]}>
                  <View style={styles.dynastyRowLeft}>
                    <View
                      style={[
                        styles.dynastyCircle,
                        reached && styles.reachedDynastyCircle,
                        current && styles.currentDynastyCircle,
                      ]}>
                      <Text
                        style={[
                          styles.dynastyNumber,
                          reached && styles.reachedDynastyNumber,
                          current && styles.currentDynastyNumber,
                        ]}>
                        {index + 1}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.dynastyName,
                          current && styles.currentDynastyName,
                        ]}>
                        {rank.rank}
                      </Text>

                      {current && (
                        <Text style={styles.currentLabel}>MEVCUT DERECE</Text>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.dynastyRequirement,
                      reached && styles.reachedDynastyRequirement,
                    ]}>
                    {rank.prestige} PRESTİJ
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>PRESTİJ VE ŞÖHRET</Text>

            <View style={styles.divider} />

            <InfoRow
              icon="🏛"
              title="Prestij"
              description={
                legacy.unlocked
                  ? "Miras Seviyeni yükselten sınırsız ilerleme değeridir."
                  : maxLevel
                    ? "Hanedan Dereceni yükselten ana ilerleme değeridir."
                    : "Ludus seviyeni yükselten ana ilerleme değeridir."
              }
              value={`${ludus.prestige}`}
            />

            <InfoRow
              icon="★"
              title="Şöhret"
              description="Arena başarılarıyla Roma'daki tanınırlığını temsil eder."
              value={`${ludus.fame}`}
            />

            {legacy.unlocked && (
              <InfoRow
                icon="♛"
                title="Miras"
                description="Maksimum ilerlemeden sonraki sonsuz seviyendir."
                value={`M${legacy.level}`}
              />
            )}

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                {legacy.unlocked
                  ? "Kazandığın Prestij artık Miras seviyeni yükseltir."
                  : maxLevel
                    ? "Maksimum Ludus seviyesinden sonra Prestij, Hanedan Dereceni yükseltir."
                    : "Yeni Ludus seviyeleri yeni sistemlerin ve bölgelerin açılmasını sağlar."}
              </Text>
            </View>
          </View>

          <View style={styles.levelCard}>
            <Text style={styles.infoTitle}>SEVİYE YOLU</Text>

            <View style={styles.divider} />

            {Array.from(
              {
                length: MAX_LUDUS_LEVEL,
              },
              (_, index) => index + 1,
            ).map((level) => {
              const requirement = LUDUS_LEVEL_REQUIREMENTS[level];

              const reached = ludus.level >= level;

              const current = ludus.level === level;

              return (
                <View
                  key={level}
                  style={[styles.levelRow, current && styles.currentLevelRow]}>
                  <View style={styles.levelLeft}>
                    <View
                      style={[
                        styles.levelCircle,
                        reached && styles.reachedCircle,
                        current && styles.currentCircle,
                      ]}>
                      <Text
                        style={[
                          styles.levelNumber,
                          reached && styles.reachedNumber,
                          current && styles.currentNumber,
                        ]}>
                        {level}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.levelLabel,
                        current && styles.currentLevelLabel,
                      ]}>
                      LV. {level}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.requirement,
                      reached && styles.reachedRequirement,
                    ]}>
                    {level === 1 ? "BAŞLANGIÇ" : `${requirement} PRESTİJ`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.currentInfo}>
          <View>
            <Text style={styles.currentInfoLabel}>
              {legacy.unlocked
                ? "MEVCUT MİRAS"
                : maxLevel
                  ? "MEVCUT HANEDAN"
                  : "MEVCUT SEVİYE ARALIĞI"}
            </Text>

            <Text style={styles.currentInfoSub}>ROMA'DAKİ MEVCUT KONUMUN</Text>
          </View>

          <Text style={styles.currentInfoValue}>
            {legacy.unlocked
              ? `Miras ${legacy.level} · ${ludus.prestige} Prestij`
              : maxLevel && dynastyRank
                ? `${dynastyRank.rank} · ${ludus.prestige} Prestij`
                : `${currentRequirement} – ${nextRequirement} Prestij`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statDescription} numberOfLines={2}>
        {description}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  title,
  description,
  value,
}: {
  icon: string;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>

      <View style={styles.infoTextArea}>
        <Text style={styles.infoRowTitle}>{title.toUpperCase()}</Text>

        <Text style={styles.infoDescription}>{description}</Text>
      </View>

      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function LegacyStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.legacyStat}>
      <Text style={styles.legacyStatLabel}>{label}</Text>

      <Text style={styles.legacyStatValue}>{value}</Text>
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
    width: 200,
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
    letterSpacing: 1.2,
    marginTop: 1,
  },

  contextArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
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
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },

  rankText: {
    color: "#C2A354",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  legacyTopText: {
    color: "#C9A7EB",
    fontFamily: "Cinzel_600SemiBold",
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
    paddingBottom: 28,
  },

  pageHeader: {
    height: 64,
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
    maxWidth: 300,
    color: "#777065",
    fontSize: 8,
    lineHeight: 12,
    textAlign: "right",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 86,
    backgroundColor: "#17140F",
    borderWidth: 1,
    borderColor: "#403624",
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 10,
    justifyContent: "center",
  },

  statLabel: {
    color: "#81796D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    letterSpacing: 0.5,
  },

  statValue: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 19,
    marginTop: 2,
  },

  statDescription: {
    color: "#777065",
    fontSize: 7.5,
    lineHeight: 10,
    marginTop: 2,
  },

  progressCard: {
    marginTop: 10,
    backgroundColor: "#17140F",
    borderWidth: 1,
    borderColor: "#4B4028",
    borderRadius: 5,
    padding: 14,
  },

  dynastyProgressCard: {
    borderColor: "#80632F",
    backgroundColor: "#19150D",
  },

  legacyProgressCard: {
    borderColor: "#70518D",
    backgroundColor: "#18121C",
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionEyebrow: {
    color: "#806C35",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    letterSpacing: 1,
  },

  sectionTitle: {
    color: "#D8C88F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  progressPercent: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 17,
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#29241B",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 12,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#DDB936",
    borderRadius: 4,
  },

  legacyProgressFill: {
    backgroundColor: "#B98ADE",
  },

  progressNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  progressText: {
    color: "#8C8477",
    fontSize: 8,
  },

  remainingText: {
    color: "#9A9284",
    fontSize: 8,
    textAlign: "center",
    marginTop: 8,
  },

  goldText: {
    color: "#DDB936",
    fontFamily: "Cinzel_600SemiBold",
  },

  legendaryText: {
    color: "#8FAF72",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    textAlign: "center",
    marginTop: 8,
  },

  legacyCard: {
    marginTop: 10,
    backgroundColor: "#141018",
    borderWidth: 1,
    borderColor: "#70518D",
    borderRadius: 5,
    padding: 12,
  },

  dynastyCard: {
    marginTop: 10,
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 5,
    padding: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  legacyTitle: {
    color: "#C9A7EB",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  dynastyTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 2,
  },

  legacyBadge: {
    width: 58,
    height: 44,
    borderWidth: 1,
    borderColor: "#70518D",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#201627",
  },

  dynastyBadge: {
    width: 58,
    height: 44,
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C170E",
  },

  badgeLabel: {
    color: "#887B69",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  legacyBadgeNumber: {
    color: "#C9A7EB",
    fontFamily: "Cinzel_700Bold",
    fontSize: 16,
  },

  dynastyBadgeNumber: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 16,
  },

  legacyStatsRow: {
    flexDirection: "row",
    gap: 8,
  },

  legacyStat: {
    flex: 1,
    minHeight: 50,
    backgroundColor: "#1C1521",
    borderWidth: 1,
    borderColor: "#3B2A47",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 7,
    justifyContent: "center",
  },

  legacyStatLabel: {
    color: "#8C7897",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  legacyStatValue: {
    color: "#C9A7EB",
    fontFamily: "Cinzel_700Bold",
    fontSize: 11,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 9,
  },

  dynastyRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 7,
    borderRadius: 4,
  },

  currentDynastyRow: {
    backgroundColor: "#211B10",
  },

  dynastyRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dynastyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#49433A",
    alignItems: "center",
    justifyContent: "center",
  },

  reachedDynastyCircle: {
    borderColor: "#80632F",
  },

  currentDynastyCircle: {
    backgroundColor: "#DDB936",
  },

  dynastyNumber: {
    color: "#777067",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  reachedDynastyNumber: {
    color: "#D8C88F",
  },

  currentDynastyNumber: {
    color: "#11100D",
  },

  dynastyName: {
    color: "#817A70",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  currentDynastyName: {
    color: "#DDB936",
  },

  currentLabel: {
    color: "#806C35",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 1,
  },

  dynastyRequirement: {
    color: "#70695F",
    fontSize: 7.5,
  },

  reachedDynastyRequirement: {
    color: "#A08746",
  },

  bottomRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    alignItems: "flex-start",
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#332C1D",
    borderRadius: 5,
    padding: 12,
  },

  levelCard: {
    flex: 1,
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#332C1D",
    borderRadius: 5,
    padding: 12,
  },

  infoTitle: {
    color: "#A48A45",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    letterSpacing: 0.8,
  },

  infoRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#272218",
  },

  infoIconBox: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  infoIcon: {
    color: "#B99B4D",
    fontSize: 16,
  },

  infoTextArea: {
    flex: 1,
  },

  infoRowTitle: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  infoDescription: {
    color: "#7C756B",
    fontSize: 7.5,
    lineHeight: 11,
    marginTop: 2,
    paddingRight: 8,
  },

  infoValue: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 12,
  },

  noteBox: {
    backgroundColor: "#1A1712",
    borderWidth: 1,
    borderColor: "#292319",
    borderRadius: 4,
    padding: 9,
    marginTop: 9,
  },

  noteText: {
    color: "#827A6F",
    fontSize: 7.5,
    lineHeight: 11,
  },

  levelRow: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    borderRadius: 4,
  },

  currentLevelRow: {
    backgroundColor: "#201B12",
  },

  levelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  levelCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#49433A",
    alignItems: "center",
    justifyContent: "center",
  },

  reachedCircle: {
    borderColor: "#80632F",
  },

  currentCircle: {
    backgroundColor: "#DDB936",
  },

  levelNumber: {
    color: "#777067",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
  },

  reachedNumber: {
    color: "#E1D5AE",
  },

  currentNumber: {
    color: "#11100D",
  },

  levelLabel: {
    color: "#817A70",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  currentLevelLabel: {
    color: "#DDB936",
  },

  requirement: {
    color: "#70695F",
    fontSize: 7.5,
  },

  reachedRequirement: {
    color: "#A08746",
  },

  currentInfo: {
    marginTop: 10,
    minHeight: 50,
    backgroundColor: "#15120E",
    borderWidth: 1,
    borderColor: "#3A3121",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  currentInfoLabel: {
    color: "#94845F",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  currentInfoSub: {
    color: "#686159",
    fontSize: 7,
    marginTop: 2,
  },

  currentInfoValue: {
    color: "#D8C88F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
  },
});
