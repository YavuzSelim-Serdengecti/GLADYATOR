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
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameModal from "../src/components/GameModal";
import { useGameStore } from "../src/store/gameStore";

export default function GamblingHouseScreen() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const ludus = useGameStore((state) => state.playerLudus);

  const playDiceGame = useGameStore((state) => state.playDiceGame);

  const twentyOneGame = useGameStore((state) => state.twentyOneGame);

  const startTwentyOne = useGameStore((state) => state.startTwentyOne);

  const hitTwentyOne = useGameStore((state) => state.hitTwentyOne);

  const standTwentyOne = useGameStore((state) => state.standTwentyOne);

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

  const handleDice = (bet: 50 | 100 | 250) => {
    const result = playDiceGame(bet);

    showModal("ZAR OYUNU", result);
  };

  const handleStartTwentyOne = () => {
    const result = startTwentyOne();

    showModal("21", result);
  };

  const handleHit = () => {
    const result = hitTwentyOne();

    showModal("KART ÇEK", result);
  };

  const handleStand = () => {
    const result = standTwentyOne();

    showModal("21 SONUCU", result);
  };

  const canStartTwentyOne =
    (!twentyOneGame.active || twentyOneGame.finished) &&
    ludus.denarius >= 100 &&
    ludus.actionPoints >= 1;

  const twentyOneInProgress = twentyOneGame.active && !twentyOneGame.finished;

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
          <Text style={styles.eyebrow}>ROMA'NIN ŞANSI</Text>

          <Text style={styles.topTitle}>OYUN EVİ</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>OYUN</Text>

            <Text style={styles.contextValue}>2</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>MİN. BAHİS</Text>

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
          <Text style={styles.pageEyebrow}>ŞANS OYUNLARI</Text>

          <Text style={styles.pageTitle}>DENARIUSUNU RİSKE AT</Text>
        </View>

        <Text style={styles.pageInfo}>
          Zar at veya 21 oyna. Her oyun 1 aksiyon puanı harcar.
        </Text>
      </View>

      {/* GAMES */}
      <View
        style={[
          styles.games,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        {/* DICE */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardEyebrow}>ŞANS OYUNU</Text>

              <Text style={styles.gameTitle}>ZAR</Text>
            </View>

            <View style={styles.iconArea}>
              <Text style={styles.icon}>🎲</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Sen ve kasa birer zar atarsınız. Yüksek atan kazanır.
          </Text>

          <View style={styles.divider} />

          <Info label="BAHİS" value="50 / 100 / 250 D" />

          <Info label="KAZANÇ" value="BAHİS KADAR NET" />

          <Info label="AKSİYON" value="⚡ 1" />

          <View style={styles.ruleBox}>
            <Text style={styles.ruleLabel}>KURAL</Text>

            <Text style={styles.rule}>Beraberlikte Denarius değişmez.</Text>
          </View>

          <Text style={styles.betLabel}>BAHİS SEÇ</Text>

          <View style={styles.diceButtons}>
            <BetButton
              bet={50}
              disabled={ludus.denarius < 50 || ludus.actionPoints < 1}
              onPress={() => handleDice(50)}
            />

            <BetButton
              bet={100}
              disabled={ludus.denarius < 100 || ludus.actionPoints < 1}
              onPress={() => handleDice(100)}
            />

            <BetButton
              bet={250}
              disabled={ludus.denarius < 250 || ludus.actionPoints < 1}
              onPress={() => handleDice(250)}
            />
          </View>
        </View>

        {/* 21 */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardEyebrow}>KART OYUNU</Text>

              <Text style={styles.gameTitle}>21</Text>
            </View>

            <View style={styles.iconArea}>
              <Text style={styles.icon}>🃏</Text>
            </View>
          </View>

          {!twentyOneGame.active ? (
            <>
              <Text style={styles.description}>
                21'e yaklaş. Kart çek veya dur. 21'i geçersen kaybedersin.
              </Text>

              <View style={styles.divider} />

              <Info label="BAHİS" value="100 D" />

              <Info label="KAZANÇ" value="+120 D NET" />

              <Info label="AKSİYON" value="⚡ 1" />

              <View style={styles.ruleBox}>
                <Text style={styles.ruleLabel}>HEDEF</Text>

                <Text style={styles.rule}>
                  21'i geçmeden kasadan yüksek skora ulaş.
                </Text>
              </View>

              <Pressable
                disabled={!canStartTwentyOne}
                style={[
                  styles.playButton,
                  !canStartTwentyOne && styles.disabledButton,
                ]}
                onPress={handleStartTwentyOne}>
                <Text
                  style={[
                    styles.playButtonText,
                    !canStartTwentyOne && styles.disabledButtonText,
                  ]}>
                  {!canStartTwentyOne
                    ? "KAYNAK YETERSİZ"
                    : "21'E BAŞLA · 100 D"}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.scoreArea}>
                <ScoreBox label="SEN" value={`${twentyOneGame.playerScore}`} />

                <Text style={styles.scoreVs}>VS</Text>

                <ScoreBox
                  label="KASA"
                  value={
                    twentyOneGame.finished ? `${twentyOneGame.houseScore}` : "?"
                  }
                />
              </View>

              <View style={styles.divider} />

              {twentyOneInProgress ? (
                <>
                  <Text style={styles.turnInfo}>KART ÇEK VEYA ELİNİ TUT</Text>

                  <View style={styles.twentyOneButtons}>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={handleHit}>
                      <Text style={styles.secondaryButtonText}>KART ÇEK</Text>
                    </Pressable>

                    <Pressable
                      style={styles.playButtonSmall}
                      onPress={handleStand}>
                      <Text style={styles.playButtonText}>DUR</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Text
                    style={[
                      styles.resultText,
                      twentyOneGame.result === "win" && styles.winText,
                      twentyOneGame.result === "lose" && styles.loseText,
                    ]}>
                    {getResultLabel(twentyOneGame.result)}
                  </Text>

                  <Pressable
                    disabled={!canStartTwentyOne}
                    style={[
                      styles.playButton,
                      !canStartTwentyOne && styles.disabledButton,
                    ]}
                    onPress={handleStartTwentyOne}>
                    <Text
                      style={[
                        styles.playButtonText,
                        !canStartTwentyOne && styles.disabledButtonText,
                      ]}>
                      {!canStartTwentyOne
                        ? "KAYNAK YETERSİZ"
                        : "YENİ OYUN · 100 D"}
                    </Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </View>
      </View>

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

function BetButton({
  bet,
  disabled,
  onPress,
}: {
  bet: number;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={[styles.betButton, disabled && styles.disabledButton]}
      onPress={onPress}>
      <Text
        style={[styles.betButtonText, disabled && styles.disabledButtonText]}>
        {bet} D
      </Text>
    </Pressable>
  );
}

function ScoreBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.scoreBox}>
      <Text style={styles.scoreLabel}>{label}</Text>

      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getResultLabel(result: "win" | "lose" | "draw" | null) {
  if (result === "win") {
    return "KAZANDIN";
  }

  if (result === "lose") {
    return "KAYBETTİN";
  }

  if (result === "draw") {
    return "BERABERE";
  }

  return "";
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
    minWidth: 52,
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
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pageEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    letterSpacing: 1.2,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    letterSpacing: 0.8,
    marginTop: 1,
  },

  pageInfo: {
    maxWidth: 300,
    color: "#777065",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "right",
  },

  games: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    paddingBottom: 12,
  },

  card: {
    width: 270,
    height: 270,
    backgroundColor: "#17130D",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 5,
    padding: 12,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 0.9,
  },

  iconArea: {
    width: 40,
    height: 40,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291C",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 20,
  },

  gameTitle: {
    color: "#F0E6C8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    marginTop: 2,
  },

  description: {
    color: "#817A70",
    fontSize: 8,
    lineHeight: 11,
    marginTop: 7,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 8,
  },

  infoRow: {
    minHeight: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoLabel: {
    color: "#817C74",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  infoValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  ruleBox: {
    marginTop: 7,
    padding: 7,
    borderWidth: 1,
    borderColor: "#302A20",
    borderRadius: 3,
    backgroundColor: "#12100D",
  },

  ruleLabel: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  rule: {
    color: "#777169",
    fontSize: 7.5,
    marginTop: 2,
  },

  betLabel: {
    color: "#81796D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: "auto",
    marginBottom: 5,
  },

  diceButtons: {
    flexDirection: "row",
    gap: 6,
  },

  betButton: {
    flex: 1,
    height: 32,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  betButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  playButton: {
    height: 32,
    marginTop: "auto",
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  playButtonSmall: {
    flex: 1,
    height: 34,
    backgroundColor: "#DDB936",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  playButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  secondaryButton: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderColor: "#B99B4D",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  disabledButton: {
    backgroundColor: "#292620",
    borderWidth: 1,
    borderColor: "#3C372F",
  },

  disabledButtonText: {
    color: "#69635A",
  },

  scoreArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },

  scoreBox: {
    flex: 1,
    height: 76,
    backgroundColor: "#211D16",
    borderWidth: 1,
    borderColor: "#30291C",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  scoreVs: {
    color: "#806D3C",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
  },

  scoreLabel: {
    color: "#77716A",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  scoreValue: {
    color: "#E1D5AE",
    fontFamily: "Cinzel_700Bold",
    fontSize: 23,
    marginTop: 2,
  },

  turnInfo: {
    color: "#81796D",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    textAlign: "center",
    marginTop: 10,
  },

  twentyOneButtons: {
    marginTop: "auto",
    flexDirection: "row",
    gap: 8,
  },

  resultText: {
    textAlign: "center",
    color: "#C7B98B",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 14,
  },

  winText: {
    color: "#8FAF72",
  },

  loseText: {
    color: "#A65E54",
  },
});
