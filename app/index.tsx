import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGameStore } from "../src/store/gameStore";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const hasSavedGame = useGameStore((state) => state.hasSavedGame);

  const isSaveLoading = useGameStore((state) => state.isSaveLoading);

  const checkSavedGame = useGameStore((state) => state.checkSavedGame);

  const loadGame = useGameStore((state) => state.loadGame);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(70, insets.left + 24);

  useEffect(() => {
    checkSavedGame();
  }, [checkSavedGame]);

  const handleContinueGame = async () => {
    if (!hasSavedGame || isSaveLoading) {
      return;
    }

    const loaded = await loadGame();

    if (loaded) {
      router.replace("/map");
    }
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
      <ImageBackground
        source={require("../assets/images/menu/main-menu-bg.png")}
        resizeMode="cover"
        style={styles.background}
      />

      <View style={styles.overlay} />

      <View
        style={[
          styles.content,
          {
            paddingLeft: safeLeft,
            paddingRight: Math.max(24, insets.right + 12),
          },
        ]}>
        <Text style={styles.title}>GLADYATÖR</Text>

        <View style={styles.menu}>
          <Pressable
            style={styles.menuItem}
            disabled={!hasSavedGame || isSaveLoading}
            onPress={handleContinueGame}>
            {({ pressed }) => (
              <View>
                <Text
                  style={[
                    styles.menuText,
                    pressed && hasSavedGame && styles.menuTextActive,
                    (!hasSavedGame || isSaveLoading) && styles.menuTextDisabled,
                  ]}>
                  {isSaveLoading ? "YÜKLENİYOR..." : "DEVAM ET"}
                </Text>

                {hasSavedGame && !isSaveLoading && (
                  <View style={styles.activeLine} />
                )}
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("/new-game")}>
            {({ pressed }) => (
              <Text style={[styles.menuText, pressed && styles.menuTextActive]}>
                YENİ OYUN
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("/account")}>
            {({ pressed }) => (
              <Text style={[styles.menuText, pressed && styles.menuTextActive]}>
                HESAP
              </Text>
            )}
          </Pressable>

          <Pressable style={styles.menuItem}>
            {({ pressed }) => (
              <Text style={[styles.menuText, pressed && styles.menuTextActive]}>
                AYARLAR
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
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
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#17120B",
  },

  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  title: {
    color: "#D9B33F",
    fontFamily: "Cinzel_700Bold",
    fontSize: 38,
    letterSpacing: 4,
    marginBottom: 32,

    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: {
      width: 1,
      height: 2,
    },
    textShadowRadius: 5,
  },

  menu: {
    gap: 17,
    alignItems: "flex-start",
  },

  menuItem: {
    minWidth: 190,
    alignItems: "flex-start",
  },

  menuText: {
    color: "#E2D6B8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 16,
    letterSpacing: 1.6,

    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 3,
  },

  menuTextActive: {
    color: "#DDB936",
  },

  menuTextDisabled: {
    color: "#514D45",
  },

  activeLine: {
    width: 62,
    height: 2,
    backgroundColor: "#DDB936",
    marginTop: 4,
  },
});
