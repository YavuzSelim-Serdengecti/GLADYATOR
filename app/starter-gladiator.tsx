import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GladiatorPortrait from "../src/components/GladiatorPortrait";
import { generateGladiator } from "../src/features/gladiators/generateGladiator";
import { useGameStore } from "../src/store/gameStore";
export default function StarterGladiatorScreen() {
  const insets = useSafeAreaInsets();

  const world = useGameStore((state) => state.world);
  const ludus = useGameStore((state) => state.playerLudus);
  const addGladiator = useGameStore((state) => state.addGladiator);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { width, height } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(26, insets.left + 12);
  const safeRight = Math.max(26, insets.right + 12);

  const candidates = useMemo(() => {
    if (!world || !ludus) {
      return [];
    }

    return [
      generateGladiator({
        worldId: world.id,
        ludusId: ludus.id,
        profile: "strong",
      }),
      generateGladiator({
        worldId: world.id,
        ludusId: ludus.id,
        profile: "fast",
      }),
      generateGladiator({
        worldId: world.id,
        ludusId: ludus.id,
        profile: "balanced",
      }),
    ];
  }, [world?.id, ludus?.id]);

  const selectedGladiator = candidates.find(
    (gladiator) => gladiator.id === selectedId,
  );

  const gap = 18;

  const usableWidth = width - safeLeft - safeRight;

  const cardWidth = Math.min(250, Math.max(205, (usableWidth - gap * 2) / 3));

  const cardHeight = Math.min(290, Math.max(245, height - 145));

  const handleConfirm = () => {
    if (!selectedGladiator) {
      return;
    }

    addGladiator(selectedGladiator);

    router.replace("/map");
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  if (!world || !ludus) {
    return (
      <View
        style={[
          styles.center,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <Text style={styles.errorTitle}>OYUN BULUNAMADI</Text>

        <Pressable onPress={() => router.replace("/")}>
          <Text style={styles.backText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <View style={styles.overlay} />

      <View
        style={[
          styles.safeContent,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>İLK SAVAŞÇIN</Text>

          <Text style={styles.title}>GLADYATÖRÜNÜ SEÇ</Text>

          <View style={styles.titleLine} />
        </View>

        <View style={styles.cardsArea}>
          {candidates.map((gladiator, index) => {
            const selected = selectedId === gladiator.id;

            const roleLabel =
              index === 0 ? "GÜÇLÜ" : index === 1 ? "HIZLI" : "DENGELİ";

            return (
              <Pressable
                key={gladiator.id}
                onPress={() => setSelectedId(gladiator.id)}
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    height: cardHeight,
                  },
                  selected && styles.selectedCard,
                ]}>
                <View style={styles.portrait}>
                  <GladiatorPortrait style={styles.portraitImage} />

                  <Text style={styles.roleLabel}>{roleLabel}</Text>

                  {selected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>SEÇİLDİ</Text>
                    </View>
                  )}
                </View>

                <View style={styles.identity}>
                  <Text numberOfLines={1} style={styles.name}>
                    {gladiator.name}
                  </Text>

                  <Text style={styles.meta}>
                    {gladiator.age} YAŞ · {gladiator.origin.toUpperCase()}
                  </Text>

                  <Text style={styles.className}>
                    {gladiator.class.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statsGrid}>
                  <Stat label="GÜÇ" value={gladiator.strength} />

                  <Stat label="DAYANIKLILIK" value={gladiator.endurance} />

                  <Stat label="ÇEVİKLİK" value={gladiator.agility} />

                  <Stat label="SALDIRI" value={gladiator.attack} />

                  <Stat label="SAVUNMA" value={gladiator.defense} />

                  <Stat label="CESARET" value={gladiator.courage} />
                </View>

                <View style={styles.potentialRow}>
                  <Text style={styles.potentialLabel}>POTANSİYEL</Text>

                  <Text style={styles.potentialValue}>???</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            disabled={!selectedGladiator}
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              !selectedGladiator && styles.disabledButton,
            ]}>
            <Text
              style={[
                styles.confirmButtonText,
                !selectedGladiator && styles.disabledText,
              ]}>
              {selectedGladiator ? "LUDUSA KAT" : "BİR GLADYATÖR SEÇ"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>

      <Text style={styles.statValue}>{value}</Text>
    </View>
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
    backgroundColor: "#100D08",
    overflow: "hidden",
  },

  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#17120B",
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },

  safeContent: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },

  center: {
    flex: 1,
    backgroundColor: "#100D08",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    color: "#8D753B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
    letterSpacing: 2.5,
  },

  title: {
    color: "#DAB63F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 22,
    letterSpacing: 2.7,
    marginTop: 5,

    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: {
      width: 1,
      height: 2,
    },
    textShadowRadius: 4,
  },

  titleLine: {
    width: 55,
    height: 2,
    backgroundColor: "#B58D31",
    marginTop: 6,
  },

  cardsArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },

  card: {
    backgroundColor: "rgba(20, 17, 12, 0.93)",
    borderWidth: 1,
    borderColor: "#443820",
    borderRadius: 5,
    padding: 9,
  },

  selectedCard: {
    borderColor: "#D8B13C",
    borderWidth: 2,
    backgroundColor: "rgba(27, 22, 13, 0.96)",
  },

  portrait: {
    height: 68,
    backgroundColor: "rgba(44, 36, 23, 0.75)",
    borderWidth: 1,
    borderColor: "#3B311E",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  portraitImage: {
    width: "100%",
    height: "100%",
  },

  roleLabel: {
    position: "absolute",
    top: 7,
    left: 8,
    color: "#AD9149",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.1,
  },

  selectedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    borderWidth: 1,
    borderColor: "#D6B03A",
    backgroundColor: "#211B10",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 2,
  },

  selectedBadgeText: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
    letterSpacing: 0.7,
  },

  identity: {
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    color: "#ECE0C1",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  meta: {
    color: "#766F62",
    fontSize: 8,
    marginTop: 3,
  },

  className: {
    color: "#B99B4D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#342B1B",
  },

  statsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  statItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  statLabel: {
    color: "#82796B",
    fontSize: 8,
  },

  statValue: {
    color: "#E0D3B0",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
  },

  potentialRow: {
    height: 27,
    borderTopWidth: 1,
    borderTopColor: "#342B1B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  potentialLabel: {
    color: "#81796D",
    fontSize: 8,
    letterSpacing: 0.5,
  },

  potentialValue: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },

  footer: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButton: {
    minWidth: 180,
    height: 34,
    paddingHorizontal: 22,
    backgroundColor: "#D4AF37",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    backgroundColor: "#29261F",
    borderWidth: 1,
    borderColor: "#3A352A",
  },

  confirmButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    letterSpacing: 1,
  },

  disabledText: {
    color: "#69635A",
  },

  errorTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    letterSpacing: 2,
    marginBottom: 18,
  },

  backText: {
    color: "#A98C47",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
    letterSpacing: 1,
  },
});
