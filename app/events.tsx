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
import { GameEvent, GameEventDecision } from "../src/types/game";

export default function EventsScreen() {
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const gameEvents = useGameStore((state) => state.gameEvents);
  const gladiators = useGameStore((state) => state.gladiators);
  const ludus = useGameStore((state) => state.playerLudus);
  const resolveEvent = useGameStore((state) => state.resolveEvent);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const pendingEvents = gameEvents.filter(
    (event) => event.status === "pending",
  );

  const freedomCount = pendingEvents.filter(
    (event) => event.type === "freedom_request",
  ).length;

  const escapeCount = pendingEvents.filter(
    (event) => event.type === "escape_attempt",
  ).length;

  const rebellionCount = pendingEvents.filter(
    (event) => event.type === "rebellion",
  ).length;

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleDecision = (event: GameEvent, decision: GameEventDecision) => {
    const result = resolveEvent(event.id, decision);

    showModal("KARAR SONUCU", result);
  };

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

          <Text style={styles.topTitle}>OLAYLAR</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>BEKLEYEN</Text>

            <Text style={styles.contextValue}>{pendingEvents.length}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>KAÇIŞ</Text>

            <Text style={styles.contextValue}>{escapeCount}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>İSYAN</Text>

            <Text style={styles.contextValue}>{rebellionCount}</Text>
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
          <Text style={styles.pageEyebrow}>LUDUS KARARLARI</Text>

          <Text style={styles.pageTitle}>BEKLEYEN OLAYLAR</Text>
        </View>

        <View style={styles.pageHeaderRight}>
          <Text style={styles.pageInfo}>
            Verdiğin kararlar gladyatörlerini ve Ludus'u etkiler.
          </Text>

          {freedomCount > 0 && (
            <Text style={styles.freedomInfo}>
              {freedomCount} ÖZGÜRLÜK TALEBİ
            </Text>
          )}
        </View>
      </View>

      {pendingEvents.length === 0 ? (
        <View
          style={[
            styles.emptyArea,
            {
              paddingLeft: safeLeft,
              paddingRight: safeRight,
            },
          ]}>
          <Text style={styles.emptyIcon}>◇</Text>

          <Text style={styles.emptyEyebrow}>LUDUS SAKİN</Text>

          <Text style={styles.emptyTitle}>BEKLEYEN OLAY YOK</Text>

          <Text style={styles.emptyText}>
            Şu anda karar vermeni gerektiren bir olay bulunmuyor.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          bounces={false}
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={270}
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
          {pendingEvents.map((event) => {
            const gladiator = gladiators.find(
              (item) => item.id === event.gladiatorId,
            );

            const eventLevel = getEventLevel(event.type);

            return (
              <View
                key={event.id}
                style={[
                  styles.card,
                  event.type === "escape_attempt" && styles.warningCard,
                  event.type === "rebellion" && styles.dangerCard,
                ]}>
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.iconBox,
                      event.type === "escape_attempt" && styles.warningIconBox,
                      event.type === "rebellion" && styles.dangerIconBox,
                    ]}>
                    <Text style={styles.eventIcon}>
                      {getEventIcon(event.type)}
                    </Text>
                  </View>

                  <View style={styles.eventMeta}>
                    <Text
                      style={[
                        styles.eventType,
                        event.type === "escape_attempt" && styles.warningText,
                        event.type === "rebellion" && styles.dangerText,
                      ]}>
                      {getEventTypeLabel(event.type)}
                    </Text>

                    <Text style={styles.dayText}>GÜN {event.createdDay}</Text>
                  </View>

                  <View
                    style={[
                      styles.levelBadge,
                      event.type === "escape_attempt" && styles.warningBadge,
                      event.type === "rebellion" && styles.dangerBadge,
                    ]}>
                    <Text
                      style={[
                        styles.levelBadgeText,
                        event.type === "escape_attempt" && styles.warningText,
                        event.type === "rebellion" && styles.dangerText,
                      ]}>
                      {eventLevel}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.eventTitle,
                    event.type === "escape_attempt" && styles.warningTitle,
                    event.type === "rebellion" && styles.dangerTitle,
                  ]}
                  numberOfLines={2}>
                  {event.title.toUpperCase()}
                </Text>

                <Text style={styles.description} numberOfLines={3}>
                  {event.description}
                </Text>

                {gladiator && (
                  <View style={styles.gladiatorArea}>
                    <View style={styles.gladiatorTop}>
                      <View>
                        <Text style={styles.gladiatorLabel}>
                          İLGİLİ GLADYATÖR
                        </Text>

                        <Text style={styles.gladiatorName} numberOfLines={1}>
                          {gladiator.name.toUpperCase()}
                        </Text>
                      </View>

                      <Text style={styles.gladiatorClass}>
                        {gladiator.class.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.statsRow}>
                      <Condition label="MORAL" value={gladiator.morale} />

                      <View style={styles.statDivider} />

                      <Condition label="SADAKAT" value={gladiator.loyalty} />
                    </View>
                  </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.decisionLabel}>KARARINI VER</Text>

                <DecisionButtons
                  event={event}
                  onDecision={(decision) => handleDecision(event, decision)}
                />
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

function Condition({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.condition}>
      <Text style={styles.conditionLabel}>{label}</Text>

      <Text
        style={[
          styles.conditionValue,
          value < 40 && styles.warningText,
          value < 20 && styles.dangerText,
        ]}>
        {value}/100
      </Text>
    </View>
  );
}

function DecisionButtons({
  event,
  onDecision,
}: {
  event: GameEvent;
  onDecision: (decision: GameEventDecision) => void;
}) {
  if (event.type === "freedom_request") {
    return (
      <View style={styles.buttons}>
        <Pressable
          style={styles.positiveButton}
          onPress={() => onDecision("grant_freedom")}>
          <Text style={styles.positiveButtonText}>ÖZGÜRLÜĞÜNÜ VER</Text>
        </Pressable>

        <Pressable
          style={styles.negativeButton}
          onPress={() => onDecision("deny_freedom")}>
          <Text style={styles.negativeButtonText}>REDDET</Text>
        </Pressable>
      </View>
    );
  }

  if (event.type === "escape_attempt") {
    return (
      <View style={styles.buttons}>
        <Pressable
          style={styles.positiveButton}
          onPress={() => onDecision("forgive_escape")}>
          <Text style={styles.positiveButtonText}>AFFET</Text>
        </Pressable>

        <Pressable
          style={styles.negativeButton}
          onPress={() => onDecision("punish_escape")}>
          <Text style={styles.negativeButtonText}>CEZALANDIR</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttons}>
      <Pressable
        style={styles.dangerButton}
        onPress={() => onDecision("suppress_rebellion")}>
        <Text style={styles.dangerButtonText}>İSYANI BASTIR</Text>
      </Pressable>

      <Pressable
        style={styles.positiveButton}
        onPress={() => onDecision("release_rebel")}>
        <Text style={styles.positiveButtonText}>SERBEST BIRAK</Text>
      </Pressable>
    </View>
  );
}

function getEventIcon(type: string) {
  if (type === "freedom_request") {
    return "♢";
  }

  if (type === "escape_attempt") {
    return "↗";
  }

  return "!";
}

function getEventTypeLabel(type: string) {
  if (type === "freedom_request") {
    return "ÖZGÜRLÜK TALEBİ";
  }

  if (type === "escape_attempt") {
    return "KAÇIŞ GİRİŞİMİ";
  }

  return "İSYAN";
}

function getEventLevel(type: string) {
  if (type === "freedom_request") {
    return "TALEP";
  }

  if (type === "escape_attempt") {
    return "UYARI";
  }

  return "KRİTİK";
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
    minWidth: 44,
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
    letterSpacing: 1.6,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 16,
    letterSpacing: 1.1,
    marginTop: 2,
  },

  pageHeaderRight: {
    alignItems: "flex-end",
  },

  pageInfo: {
    color: "#777065",
    fontSize: 8,
  },

  freedomInfo: {
    color: "#9D8649",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 3,
  },

  list: {
    paddingTop: 4,
    paddingBottom: 14,
    gap: 10,
    alignItems: "flex-start",
  },

  card: {
    width: 260,
    height: 235,
    backgroundColor: "rgba(23,19,13,0.96)",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 12,
  },

  warningCard: {
    borderColor: "#72552F",
  },

  dangerCard: {
    borderColor: "#693A34",
  },

  cardTop: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#514326",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  warningIconBox: {
    borderColor: "#72552F",
  },

  dangerIconBox: {
    borderColor: "#693A34",
  },

  eventIcon: {
    color: "#B99B4D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
  },

  eventMeta: {
    flex: 1,
    paddingLeft: 8,
  },

  eventType: {
    color: "#B89B51",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7.5,
    letterSpacing: 0.5,
  },

  dayText: {
    color: "#756E63",
    fontSize: 7,
    marginTop: 2,
  },

  levelBadge: {
    borderWidth: 1,
    borderColor: "#55472A",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  levelBadgeText: {
    color: "#9D8649",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  warningBadge: {
    borderColor: "#72552F",
  },

  dangerBadge: {
    borderColor: "#693A34",
  },

  eventTitle: {
    color: "#E0D3AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 11,
    marginTop: 7,
  },

  warningTitle: {
    color: "#D1A15F",
  },

  dangerTitle: {
    color: "#B96B61",
  },

  warningText: {
    color: "#C48A4A",
  },

  dangerText: {
    color: "#A65E54",
  },

  description: {
    color: "#999185",
    fontSize: 8.5,
    lineHeight: 12,
    marginTop: 5,
    minHeight: 30,
  },

  gladiatorArea: {
    marginTop: 7,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291D",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  gladiatorTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  gladiatorLabel: {
    color: "#746D62",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  gladiatorName: {
    color: "#E1D6B9",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    marginTop: 1,
    maxWidth: 150,
  },

  gladiatorClass: {
    color: "#A98D47",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  condition: {
    flex: 1,
  },

  conditionLabel: {
    color: "#746D62",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  conditionValue: {
    color: "#BFB5A2",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    marginTop: 1,
  },

  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#393125",
    marginHorizontal: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginTop: 8,
    marginBottom: 6,
  },

  decisionLabel: {
    color: "#7E704D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginBottom: 5,
  },

  buttons: {
    flexDirection: "row",
    gap: 6,
  },

  positiveButton: {
    flex: 1,
    height: 29,
    borderWidth: 1,
    borderColor: "#657C51",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  positiveButtonText: {
    color: "#8FAF72",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    textAlign: "center",
  },

  negativeButton: {
    flex: 1,
    height: 29,
    borderWidth: 1,
    borderColor: "#84633D",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  negativeButtonText: {
    color: "#C48A4A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    textAlign: "center",
  },

  dangerButton: {
    flex: 1,
    height: 29,
    borderWidth: 1,
    borderColor: "#7A403A",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  dangerButtonText: {
    color: "#B6655C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    textAlign: "center",
  },

  emptyArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

  emptyIcon: {
    color: "#65573A",
    fontSize: 30,
  },

  emptyEyebrow: {
    color: "#77653C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.4,
    marginTop: 5,
  },

  emptyTitle: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    marginTop: 3,
  },

  emptyText: {
    color: "#80786D",
    fontSize: 8.5,
    marginTop: 5,
  },
});
