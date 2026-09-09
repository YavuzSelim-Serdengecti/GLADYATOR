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

import { ACHIEVEMENTS } from "../src/features/achievements/achievements";
import { useGameStore } from "../src/store/gameStore";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const playerLudus = useGameStore((state) => state.playerLudus);

  const achievementProgress = useGameStore(
    (state) => state.achievementProgress,
  );

  const claimAchievementReward = useGameStore(
    (state) => state.claimAchievementReward,
  );

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const completedCount = achievementProgress.filter(
    (item) => item.completed,
  ).length;

  const claimedCount = achievementProgress.filter(
    (item) => item.claimed,
  ).length;

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
          <Text style={styles.eyebrow}>ROMA'NIN MİRASI</Text>

          <Text style={styles.topTitle}>BAŞARIMLAR</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>TAMAMLANAN</Text>

            <Text style={styles.contextValue}>
              {completedCount}/{ACHIEVEMENTS.length}
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>ÖDÜL ALINAN</Text>

            <Text style={styles.contextValue}>
              {claimedCount}/{ACHIEVEMENTS.length}
            </Text>
          </View>
        </View>

        <View style={styles.resources}>
          <View style={styles.prestigeBadge}>
            <Text style={styles.prestigeLabel}>PRESTİJ</Text>

            <Text style={styles.prestigeValue}>
              🏛 {playerLudus?.prestige ?? 0}
            </Text>
          </View>

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
          <Text style={styles.pageEyebrow}>ŞÖHRET VE MİRAS</Text>

          <Text style={styles.pageTitle}>ROMA'DA ADINI DUYUR</Text>
        </View>

        <Text style={styles.pageDescription}>
          Hedefleri tamamla, prestij kazan ve Ludus'unun mirasını büyüt.
        </Text>
      </View>

      {/* ACHIEVEMENTS */}
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
        {ACHIEVEMENTS.map((achievement) => {
          const progress = achievementProgress.find(
            (item) => item.achievementId === achievement.id,
          );

          const currentProgress = progress?.progress ?? 0;

          const completed = progress?.completed ?? false;

          const claimed = progress?.claimed ?? false;

          const percentage = Math.min(
            100,
            (currentProgress / achievement.target) * 100,
          );

          return (
            <View
              key={achievement.id}
              style={[styles.card, completed && styles.completedCard]}>
              {/* ICON */}
              <View
                style={[
                  styles.iconArea,
                  completed && styles.completedIconArea,
                ]}>
                <Text style={styles.icon}>
                  {claimed ? "✓" : completed ? "★" : "⚔"}
                </Text>
              </View>

              {/* INFO */}
              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      completed && styles.completedTitle,
                    ]}
                    numberOfLines={1}>
                    {achievement.title.toUpperCase()}
                  </Text>

                  {completed && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedLabel}>TAMAMLANDI</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {achievement.description}
                </Text>

                <View style={styles.progressArea}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      {Math.min(currentProgress, achievement.target)}/
                      {achievement.target}
                    </Text>

                    <Text style={styles.rewardText}>
                      +{achievement.prestigeReward} PRESTİJ
                    </Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${percentage}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* ACTION */}
              <View style={styles.actionArea}>
                {claimed ? (
                  <View style={styles.claimedBadge}>
                    <Text style={styles.claimedBadgeText}>ÖDÜL ALINDI</Text>
                  </View>
                ) : completed ? (
                  <Pressable
                    style={styles.claimButton}
                    onPress={() => claimAchievementReward(achievement.id)}>
                    <Text style={styles.claimButtonText}>ÖDÜLÜ AL</Text>
                  </Pressable>
                ) : (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedText}>DEVAM EDİYOR</Text>
                  </View>
                )}
              </View>
            </View>
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

  resources: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },

  prestigeBadge: {
    minWidth: 82,
    height: 30,
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 3,
    backgroundColor: "#17140F",
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  prestigeLabel: {
    color: "#806C35",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  prestigeValue: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
    marginTop: 1,
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
    letterSpacing: 1.1,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    letterSpacing: 0.8,
    marginTop: 1,
  },

  pageDescription: {
    width: 290,
    color: "#777065",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "right",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: 14,
    gap: 8,
  },

  card: {
    minHeight: 92,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  completedCard: {
    borderColor: "#80632F",
  },

  iconArea: {
    width: 52,
    height: 52,
    borderRadius: 4,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#3A3223",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  completedIconArea: {
    borderColor: "#80632F",
    backgroundColor: "#211A0F",
  },

  icon: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 20,
  },

  info: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  achievementTitle: {
    flexShrink: 1,
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 11,
  },

  completedTitle: {
    color: "#DDB936",
  },

  completedBadge: {
    height: 20,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#536744",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  completedLabel: {
    color: "#8FAF72",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  description: {
    color: "#8A857D",
    fontSize: 8,
    lineHeight: 11,
    marginTop: 3,
  },

  progressArea: {
    marginTop: 7,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  progressText: {
    color: "#A59D8D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  rewardText: {
    color: "#B99B4D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  progressBar: {
    height: 5,
    backgroundColor: "#302C26",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#DDB936",
  },

  actionArea: {
    width: 115,
    marginLeft: 14,
    alignItems: "center",
  },

  claimButton: {
    width: 105,
    height: 32,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  claimButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  claimedBadge: {
    width: 105,
    height: 32,
    borderWidth: 1,
    borderColor: "#536744",
    borderRadius: 3,
    backgroundColor: "#141A10",
    alignItems: "center",
    justifyContent: "center",
  },

  claimedBadgeText: {
    color: "#8FAF72",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  lockedBadge: {
    width: 105,
    height: 32,
    borderWidth: 1,
    borderColor: "#3D3524",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  lockedText: {
    color: "#676159",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },
});
