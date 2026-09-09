import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameModal from "../src/components/GameModal";
import { useGameStore } from "../src/store/gameStore";

export default function NewGameScreen() {
  const insets = useSafeAreaInsets();

  const [lanistaName, setLanistaName] = useState("");
  const [ludusName, setLudusName] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const createNewGame = useGameStore((state) => state.createNewGame);

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

  const handleContinue = () => {
    const cleanLanistaName = lanistaName.trim();

    const cleanLudusName = ludusName.trim();

    if (!cleanLanistaName || !cleanLudusName) {
      showModal("EKSİK BİLGİ", "Lanista adını ve Ludus adını girmelisin.");

      return;
    }

    createNewGame(cleanLanistaName, cleanLudusName);

    router.push("/starter-gladiator");
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.background} />

      <View style={styles.overlay} />

      <Pressable
        style={[
          styles.backButton,
          {
            left: safeLeft,
            top: Math.max(18, insets.top + 12),
          },
        ]}
        onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← GERİ</Text>
      </Pressable>

      <View
        style={[
          styles.content,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YENİ OYUN</Text>

          <Text style={styles.title}>LUDUSUNU KUR</Text>

          <View style={styles.titleLine} />

          <Text style={styles.description}>
            Roma'daki yükselişin burada başlıyor.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>LANISTA ADI</Text>

            <TextInput
              style={styles.input}
              value={lanistaName}
              onChangeText={setLanistaName}
              placeholder="Marcus"
              placeholderTextColor="#625D53"
              maxLength={20}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>LUDUS ADI</Text>

            <TextInput
              style={styles.input}
              value={ludusName}
              onChangeText={setLudusName}
              placeholder="Aurelius"
              placeholderTextColor="#625D53"
              maxLength={30}
            />
          </View>

          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>DEVAM ET</Text>
          </Pressable>
        </View>
      </View>

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#080705",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#100D08",
    overflow: "hidden",
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#17120B",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.30)",
  },

  backButton: {
    position: "absolute",
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  backButtonText: {
    color: "#A98C47",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.2,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    width: 430,
    maxWidth: "100%",
    alignItems: "center",
    marginBottom: 24,
  },

  eyebrow: {
    color: "#8D753B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 9,
    letterSpacing: 3,
  },

  title: {
    color: "#DAB63F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 31,
    letterSpacing: 3,
    marginTop: 4,

    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: {
      width: 1,
      height: 2,
    },
    textShadowRadius: 5,
  },

  titleLine: {
    width: 70,
    height: 2,
    backgroundColor: "#B58D31",
    marginTop: 8,
  },

  description: {
    color: "#938B7C",
    fontSize: 10,
    marginTop: 9,
  },

  form: {
    width: 380,
    maxWidth: "100%",
    gap: 15,
  },

  field: {
    gap: 6,
  },

  label: {
    color: "#B79A51",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.5,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#594A27",
    backgroundColor: "rgba(14, 12, 8, 0.78)",
    borderRadius: 4,
    paddingHorizontal: 14,
    color: "#E8DDC2",
    fontSize: 14,
  },

  continueButton: {
    height: 44,
    backgroundColor: "#D4AF37",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  continueButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 12,
    letterSpacing: 1.3,
  },
});
