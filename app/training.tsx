import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameModal from "../src/components/GameModal";
import { useGameStore } from "../src/store/gameStore";

type TrainingType = "strength" | "endurance" | "agility" | "attack" | "defense";

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const ludus = useGameStore((state) => state.playerLudus);
  const gladiators = useGameStore((state) => state.gladiators);
  const buildings = useGameStore((state) => state.ludusBuildings);
  const trainGladiator = useGameStore((state) => state.trainGladiator);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const trainingGround = buildings.find(
    (building) => building.type === "training_ground",
  );

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
      </View>
    );
  }

  const playerGladiators = gladiators.filter(
    (gladiator) =>
      gladiator.ludusId === ludus.id && gladiator.status === "active",
  );

  if (!trainingGround?.isBuilt) {
    return (
      <View
        style={[
          styles.lockedContainer,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.lockedBox}>
          <Text style={styles.lockedSymbol}>⚔</Text>

          <Text style={styles.lockedEyebrow}>EĞİTİM SİSTEMİ</Text>

          <Text style={styles.lockedTitle}>EĞİTİM ALANI GEREKLİ</Text>

          <Text style={styles.lockedText}>
            Gladyatörlerini eğitmek için Ludus'ta önce Eğitim Alanı inşa
            etmelisin.
          </Text>

          <Pressable
            style={styles.lockedBackButton}
            onPress={() => router.back()}>
            <Text style={styles.lockedBackText}>← LUDUSA DÖN</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleTraining = (gladiatorId: string, type: TrainingType) => {
    const success = trainGladiator(gladiatorId, type);

    if (!success) {
      showModal(
        "ANTRENMAN YAPILAMADI",
        "Aksiyon puanın yetersiz olabilir, gladyatör çok yorgun olabilir veya bu antrenmana uygun olmayabilir.",
      );

      return;
    }

    showModal("ANTRENMAN TAMAMLANDI", "Gladyatörün ilgili özelliği gelişti.");
  };

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

          <Text style={styles.title}>EĞİTİM</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>EĞİTİM ALANI</Text>

            <Text style={styles.contextValue}>LV. {trainingGround.level}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>AKTİF</Text>

            <Text style={styles.contextValue}>{playerGladiators.length}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          <Text style={styles.resource}>LV. {ludus.level}</Text>

          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

          <Text style={styles.resource}>🪙 {ludus.denarius}</Text>

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
          <Text style={styles.pageEyebrow}>GLADYATÖR GELİŞİMİ</Text>

          <Text style={styles.pageTitle}>EĞİTİM ALANI</Text>
        </View>

        <Text style={styles.pageInfo}>
          Bir antrenman aksiyon puanı tüketir.
        </Text>
      </View>

      {playerGladiators.length === 0 ? (
        <View
          style={[
            styles.emptyArea,
            {
              paddingLeft: safeLeft,
              paddingRight: safeRight,
            },
          ]}>
          <Text style={styles.emptySymbol}>◇</Text>

          <Text style={styles.emptyTitle}>AKTİF GLADYATÖR YOK</Text>

          <Text style={styles.emptyText}>
            Eğitim yapabilmek için aktif bir gladyatöre ihtiyacın var.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          bounces={false}
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={250}
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
          {playerGladiators.map((gladiator) => (
            <View key={gladiator.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.category}>
                  {gladiator.class.toUpperCase()}
                </Text>

                <View style={styles.fatigueBadge}>
                  <Text style={styles.fatigueBadgeText}>
                    YORGUNLUK {gladiator.fatigue}
                  </Text>
                </View>
              </View>

              <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                {gladiator.name.toUpperCase()}
              </Text>

              <Text style={styles.meta}>
                {gladiator.age} YAŞ · {gladiator.origin.toUpperCase()}
              </Text>

              <View style={styles.divider} />

              <View style={styles.statsArea}>
                <Stat label="Güç" value={gladiator.strength} />

                <Stat label="Dayanıklılık" value={gladiator.endurance} />

                <Stat label="Çeviklik" value={gladiator.agility} />

                <Stat label="Saldırı" value={gladiator.attack} />

                <Stat label="Savunma" value={gladiator.defense} />

                <Stat label="Potansiyel" value={gladiator.potential} />
              </View>

              <Text style={styles.trainingLabel}>ANTRENMAN SEÇ</Text>

              <View style={styles.trainingButtons}>
                <TrainingButton
                  label="GÜÇ"
                  onPress={() => handleTraining(gladiator.id, "strength")}
                />

                <TrainingButton
                  label="DAYANIKLILIK"
                  onPress={() => handleTraining(gladiator.id, "endurance")}
                />

                <TrainingButton
                  label="ÇEVİKLİK"
                  onPress={() => handleTraining(gladiator.id, "agility")}
                />

                <TrainingButton
                  label="SALDIRI"
                  onPress={() => handleTraining(gladiator.id, "attack")}
                />

                <TrainingButton
                  label="SAVUNMA"
                  onPress={() => handleTraining(gladiator.id, "defense")}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
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

function TrainingButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.trainingButton} onPress={onPress}>
      <Text
        style={styles.trainingButtonText}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {label}
      </Text>
    </Pressable>
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
    fontSize: 17,
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

  title: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    letterSpacing: 1.4,
    marginTop: 1,
  },

  contextArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  contextItem: {
    minWidth: 60,
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
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pageEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.7,
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

  list: {
    paddingTop: 4,
    paddingBottom: 14,
    gap: 10,
    alignItems: "flex-start",
  },

  card: {
    width: 240,
    height: 238,
    padding: 11,
    backgroundColor: "rgba(23,19,13,0.96)",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 4,
  },

  cardTop: {
    height: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  category: {
    color: "#8A784D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    letterSpacing: 1,
  },

  fatigueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#57482B",
    borderRadius: 3,
  },

  fatigueBadgeText: {
    color: "#A0874A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  name: {
    color: "#E5D9B9",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },

  meta: {
    color: "#8A8276",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    textAlign: "center",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 6,
  },

  statsArea: {
    height: 72,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1,
  },

  statLabel: {
    color: "#948B7D",
    fontSize: 8.5,
  },

  statValue: {
    color: "#E0D6BC",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8.5,
  },

  trainingLabel: {
    color: "#8A784D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    marginBottom: 4,
  },

  trainingButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },

  trainingButton: {
    width: "31.5%",
    height: 25,
    borderWidth: 1,
    borderColor: "#6B582F",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  trainingButtonText: {
    color: "#D0AD51",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  emptyArea: {
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
    color: "#C6A54D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 6,
  },

  emptyText: {
    color: "#80786D",
    fontSize: 8,
    marginTop: 5,
  },

  lockedContainer: {
    flex: 1,
    backgroundColor: "#0B0906",
    alignItems: "center",
    justifyContent: "center",
  },

  lockedBox: {
    width: "58%",
    maxWidth: 520,
    minHeight: 210,
    borderWidth: 1,
    borderColor: "#594728",
    backgroundColor: "#17140F",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  lockedSymbol: {
    color: "#6D5C37",
    fontSize: 27,
  },

  lockedEyebrow: {
    color: "#77653C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    letterSpacing: 1.6,
    marginTop: 5,
  },

  lockedTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 4,
  },

  lockedText: {
    color: "#8A8378",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 14,
    marginTop: 7,
    maxWidth: 350,
  },

  lockedBackButton: {
    height: 31,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  lockedBackText: {
    color: "#C1A14E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },
});
