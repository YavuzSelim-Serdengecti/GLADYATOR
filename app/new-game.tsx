import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useGameStore } from "../src/store/gameStore";

export default function NewGameScreen() {
  const [lanistaName, setLanistaName] = useState("");
  const [ludusName, setLudusName] = useState("");

  const createNewGame = useGameStore((state) => state.createNewGame);

  const handleContinue = () => {
    const cleanLanistaName = lanistaName.trim();
    const cleanLudusName = ludusName.trim();

    if (!cleanLanistaName || !cleanLudusName) {
      Alert.alert("Eksik Bilgi", "Lanista adını ve Ludus adını girmelisin.");
      return;
    }

    createNewGame(cleanLanistaName, cleanLudusName);

    router.push("/starter-gladiator");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.panel}>
        <Text style={styles.smallTitle}>YENİ HANEDAN</Text>

        <Text style={styles.title}>LUDUSUNU KUR</Text>

        <Text style={styles.description}>
          Roma arenasındaki yükselişin burada başlıyor.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>LANISTA ADI</Text>

          <TextInput
            style={styles.input}
            value={lanistaName}
            onChangeText={setLanistaName}
            placeholder="Örn. Marcus"
            placeholderTextColor="#666666"
            maxLength={20}
          />

          <Text style={styles.label}>LUDUS ADI</Text>

          <TextInput
            style={styles.input}
            value={ludusName}
            onChangeText={setLudusName}
            placeholder="Örn. House Aurelius"
            placeholderTextColor="#666666"
            maxLength={30}
          />

          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>DEVAM ET</Text>
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>GERİ DÖN</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0C0A",
    alignItems: "center",
    justifyContent: "center",
  },

  panel: {
    width: "55%",
    maxWidth: 520,
  },

  smallTitle: {
    color: "#8C7435",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 3,
    textAlign: "center",
  },

  title: {
    color: "#D4AF37",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 3,
    textAlign: "center",
    marginTop: 6,
  },

  description: {
    color: "#8E8E8E",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  form: {
    gap: 10,
  },

  label: {
    color: "#C8B77D",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginTop: 4,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#4D4228",
    backgroundColor: "#17140F",
    borderRadius: 6,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
  },

  continueButton: {
    height: 46,
    backgroundColor: "#D4AF37",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    marginTop: 10,
  },

  continueButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  backButton: {
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#777777",
    fontSize: 12,
    fontWeight: "600",
  },
});
