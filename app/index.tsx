import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GLADYATÖR</Text>
      <Text style={styles.subtitle}>ROMA'NIN EN BÜYÜK LUDUSUNU KUR</Text>

      <View style={styles.menu}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/new-game")}>
          <Text style={styles.primaryButtonText}>YENİ OYUN</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} disabled>
          <Text style={styles.disabledButtonText}>DEVAM ET</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>AYARLAR</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>v0.1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#D4AF37",
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 5,
  },

  subtitle: {
    color: "#8F8F8F",
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 8,
  },

  menu: {
    width: 260,
    gap: 12,
    marginTop: 40,
  },

  primaryButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 6,
  },

  primaryButtonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "bold",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#66582D",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 6,
  },

  secondaryButtonText: {
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: "600",
  },

  disabledButtonText: {
    color: "#555555",
    fontSize: 15,
    fontWeight: "600",
  },

  version: {
    position: "absolute",
    bottom: 15,
    right: 20,
    color: "#555555",
    fontSize: 11,
  },
});
