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

export default function TavernScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const ludus = useGameStore((state) => state.playerLudus);
  const gladiators = useGameStore((state) => state.gladiators);
  const visitTavern = useGameStore((state) => state.visitTavern);

  const pendingTavernEvent = useGameStore((state) => state.pendingTavernEvent);

  const resolveTavernChoice = useGameStore(
    (state) => state.resolveTavernChoice,
  );

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

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
      </View>
    );
  }

  const playerGladiators = gladiators.filter(
    (gladiator) => gladiator.ludusId === ludus.id,
  );

  const activeGladiators = playerGladiators.filter(
    (gladiator) => gladiator.status === "active",
  );

  const pendingGladiator = pendingTavernEvent
    ? gladiators.find(
        (gladiator) => gladiator.id === pendingTavernEvent.gladiatorId,
      )
    : null;

  const handleVisit = (gladiatorId: string) => {
    const result = visitTavern(gladiatorId);

    showModal("TAVERNA", result);
  };

  const handleChoice = (optionId: string) => {
    const result = resolveTavernChoice(optionId);

    showModal("KARAR SONUCU", result);
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
          <Text style={styles.eyebrow}>ROMA GECELERİ</Text>
          <Text style={styles.topTitle}>TAVERNA</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>AKTİF</Text>
            <Text style={styles.contextValue}>{activeGladiators.length}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>ZİYARET</Text>
            <Text style={styles.contextValue}>50 D</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>AKSİYON</Text>
            <Text style={styles.contextValue}>⚡ 1</Text>
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

      {/* INFO BAR */}
      <View
        style={[
          styles.infoBar,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <InfoBox label="TAVERNA ZİYARETİ" value="50 DENARIUS + 1 AP" />

        <View style={styles.infoDivider} />

        <InfoBox label="GARANTİ ETKİ" value="+10 MORAL" />

        <View style={styles.infoDivider} />

        <InfoBox label="RASTGELE OLAY" value="BAHİS · KAVGA · SÖYLENTİ" />
      </View>

      {/* PENDING EVENT */}
      {pendingTavernEvent && (
        <View
          style={[
            styles.eventCard,
            {
              marginLeft: safeLeft,
              marginRight: safeRight,
            },
          ]}>
          <View style={styles.eventLeft}>
            <View style={styles.eventIconBox}>
              <Text style={styles.eventIcon}>🍺</Text>
            </View>

            <View style={styles.eventMain}>
              <Text style={styles.eventEyebrow}>KARAR GEREKİYOR</Text>

              <Text style={styles.eventTitle} numberOfLines={1}>
                {pendingTavernEvent.event.title.toUpperCase()}
              </Text>

              <Text style={styles.eventDescription} numberOfLines={2}>
                {pendingTavernEvent.event.description}
              </Text>
            </View>
          </View>

          {pendingGladiator && (
            <View style={styles.eventGladiator}>
              <Text style={styles.eventGladiatorName} numberOfLines={1}>
                {pendingGladiator.name.toUpperCase()}
              </Text>

              <Text style={styles.eventGladiatorStats}>
                MORAL {pendingGladiator.morale}/100
                {"  "}·{"  "}
                SADAKAT {pendingGladiator.loyalty}/100
              </Text>
            </View>
          )}

          <View style={styles.eventOptions}>
            {pendingTavernEvent.event.options.map((option) => (
              <Pressable
                key={option.id}
                style={styles.choiceButton}
                onPress={() => handleChoice(option.id)}>
                <Text style={styles.choiceButtonText} numberOfLines={1}>
                  {option.label.toUpperCase()}
                </Text>

                <Text style={styles.choiceEffects} numberOfLines={1}>
                  {formatOptionEffects(option)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* GLADIATORS */}
      {activeGladiators.length === 0 ? (
        <View style={styles.emptyArea}>
          <Text style={styles.emptyIcon}>🍺</Text>

          <Text style={styles.emptyTitle}>UYGUN GLADYATÖR YOK</Text>

          <Text style={styles.emptyText}>
            Taverna'ya yalnızca aktif gladyatörler gidebilir.
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
          {activeGladiators.map((gladiator) => {
            const maxMorale = gladiator.morale >= 100;

            const cantAfford = ludus.denarius < 50 || ludus.actionPoints < 1;

            const hasPendingEvent = !!pendingTavernEvent;

            const disabled = maxMorale || cantAfford || hasPendingEvent;

            const moralePercent = Math.max(0, Math.min(100, gladiator.morale));

            const loyaltyPercent = Math.max(
              0,
              Math.min(100, gladiator.loyalty),
            );

            return (
              <View key={gladiator.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardEyebrow}>AKTİF GLADYATÖR</Text>

                  <Text style={styles.statusText}>HAZIR</Text>
                </View>

                <View style={styles.portrait}>
                  <Text style={styles.portraitIcon}>⚔</Text>
                </View>

                <Text style={styles.name} numberOfLines={1}>
                  {gladiator.name.toUpperCase()}
                </Text>

                <Text style={styles.meta}>
                  {gladiator.age} YAŞ · {gladiator.origin.toUpperCase()}
                </Text>

                <View style={styles.divider} />

                <ProgressStat
                  label="MORAL"
                  value={gladiator.morale}
                  percent={moralePercent}
                />

                <ProgressStat
                  label="SADAKAT"
                  value={gladiator.loyalty}
                  percent={loyaltyPercent}
                />

                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>MALİYET</Text>

                  <Text style={styles.costValue}>🪙 50 · ⚡ 1</Text>
                </View>

                <Pressable
                  disabled={disabled}
                  style={[
                    styles.visitButton,
                    disabled && styles.disabledButton,
                  ]}
                  onPress={() => handleVisit(gladiator.id)}>
                  <Text
                    style={[
                      styles.visitButtonText,
                      disabled && styles.disabledButtonText,
                    ]}
                    numberOfLines={1}>
                    {hasPendingEvent
                      ? "ÖNCE OLAYI ÇÖZ"
                      : maxMorale
                        ? "MORAL MAKSİMUM"
                        : cantAfford
                          ? "KAYNAK YETERSİZ"
                          : "TAVERNA'YA GÖNDER"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoTitle}>{label}</Text>
      <Text style={styles.infoText}>{value}</Text>
    </View>
  );
}

function ProgressStat({
  label,
  value,
  percent,
}: {
  label: string;
  value: number;
  percent: number;
}) {
  return (
    <View style={styles.progressStat}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>

        <Text style={styles.progressValue}>{value}/100</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percent}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

function formatOptionEffects(option: {
  moraleChange: number;
  loyaltyChange: number;
  denariusChange: number;
  fameChange: number;
}) {
  const effects: string[] = [];

  if (option.moraleChange !== 0) {
    effects.push(`Moral ${formatChange(option.moraleChange)}`);
  }

  if (option.loyaltyChange !== 0) {
    effects.push(`Sadakat ${formatChange(option.loyaltyChange)}`);
  }

  if (option.denariusChange !== 0) {
    effects.push(`Denarius ${formatChange(option.denariusChange)}`);
  }

  if (option.fameChange !== 0) {
    effects.push(`Şöhret ${formatChange(option.fameChange)}`);
  }

  return effects.length > 0 ? effects.join(" • ") : "Ek etki yok";
}

function formatChange(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
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
    minWidth: 50,
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

  infoBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#272218",
  },

  infoBox: {
    flex: 1,
  },

  infoDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
    backgroundColor: "#332C1D",
  },

  infoTitle: {
    color: "#8D773E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.5,
  },

  infoText: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    marginTop: 2,
  },

  eventCard: {
    minHeight: 108,
    marginTop: 8,
    backgroundColor: "#1A1510",
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 5,
    padding: 10,
  },

  eventLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  eventIconBox: {
    width: 38,
    height: 38,
    backgroundColor: "#221C11",
    borderWidth: 1,
    borderColor: "#594723",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  eventIcon: {
    fontSize: 18,
  },

  eventMain: {
    flex: 1,
  },

  eventEyebrow: {
    color: "#9E7B34",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  eventTitle: {
    color: "#E3C968",
    fontFamily: "Cinzel_700Bold",
    fontSize: 11,
    marginTop: 1,
  },

  eventDescription: {
    color: "#AAA196",
    fontSize: 8,
    lineHeight: 11,
    marginTop: 2,
  },

  eventGladiator: {
    position: "absolute",
    top: 10,
    right: 10,
    minWidth: 130,
    alignItems: "flex-end",
  },

  eventGladiatorName: {
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  eventGladiatorStats: {
    color: "#837B70",
    fontSize: 7,
    marginTop: 2,
  },

  eventOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  choiceButton: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 3,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  choiceButtonText: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7.5,
    textAlign: "center",
  },

  choiceEffects: {
    color: "#847D72",
    fontSize: 7,
    textAlign: "center",
    marginTop: 2,
  },

  list: {
    gap: 10,
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: "flex-start",
  },

  card: {
    width: 220,
    height: 225,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 10,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardEyebrow: {
    color: "#8D773E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.7,
  },

  statusText: {
    color: "#8FAF72",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  portrait: {
    height: 36,
    marginTop: 5,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291C",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  portraitIcon: {
    color: "#B99B4D",
    fontSize: 17,
  },

  name: {
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },

  meta: {
    color: "#77716A",
    fontSize: 7.5,
    textAlign: "center",
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 6,
  },

  progressStat: {
    marginBottom: 6,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },

  progressLabel: {
    color: "#817C74",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  progressValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  progressTrack: {
    height: 5,
    backgroundColor: "#302C26",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#9B8246",
  },

  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 1,
  },

  costLabel: {
    color: "#756F65",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  costValue: {
    color: "#B99B4D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  visitButton: {
    height: 31,
    marginTop: "auto",
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  visitButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7.5,
  },

  disabledButton: {
    backgroundColor: "#292620",
    borderWidth: 1,
    borderColor: "#3C372F",
  },

  disabledButtonText: {
    color: "#69635A",
  },

  emptyArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    fontSize: 30,
  },

  emptyTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 7,
  },

  emptyText: {
    color: "#77716A",
    fontSize: 8,
    marginTop: 4,
  },
});
