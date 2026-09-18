import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGameStore } from "../src/store/gameStore";

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

const DUST_PARTICLES = [
  { left: "25%", top: "18%", size: 4, duration: 6500, delay: 0 },
  { left: "35%", top: "65%", size: 5, duration: 7500, delay: 500 },
  { left: "45%", top: "32%", size: 4, duration: 6000, delay: 1000 },
  { left: "55%", top: "75%", size: 5, duration: 8000, delay: 1500 },
  { left: "65%", top: "45%", size: 4, duration: 7000, delay: 500 },
  { left: "73%", top: "20%", size: 5, duration: 7500, delay: 2000 },
  { left: "80%", top: "60%", size: 4, duration: 6500, delay: 1000 },
  { left: "87%", top: "35%", size: 5, duration: 8000, delay: 2500 },
  { left: "92%", top: "70%", size: 4, duration: 7000, delay: 1500 },
];

function DustParticle({
  left,
  top,
  size,
  duration,
  delay,
}: {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
}) {
  const move = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.parallel([
          Animated.timing(move, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),

          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: duration * 0.25,
              useNativeDriver: true,
            }),

            Animated.timing(opacity, {
              toValue: 0.15,
              duration: duration * 0.5,
              useNativeDriver: true,
            }),

            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.25,
              useNativeDriver: true,
            }),
          ]),
        ]),

        Animated.timing(move, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [delay, duration, move, opacity]);

  const translateX = move.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 35],
  });

  const translateY = move.interpolate({
    inputRange: [0, 1],
    outputRange: [15, -45],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dust,
        {
          left: left as any,
          top: top as any,
          width: size,
          height: size,
          borderRadius: size,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    />
  );
}

function Bird({
  top,
  delay,
  duration,
  scale = 1,
}: {
  top: string;
  delay: number;
  duration: number;
  scale?: number;
}) {
  const position = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.parallel([
          Animated.timing(position, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),

          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.85,
              duration: 1000,
              useNativeDriver: true,
            }),

            Animated.delay(Math.max(duration - 2000, 0)),

            Animated.timing(opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),

        Animated.timing(position, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),

        Animated.delay(9000),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [delay, duration, opacity, position]);

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [900, -150],
  });

  const translateY = position.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -12, 5],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bird,
        {
          top: top as any,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}>
      <View style={[styles.birdWing, styles.birdWingLeft]} />
      <View style={[styles.birdWing, styles.birdWingRight]} />
    </Animated.View>
  );
}

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

  const backgroundScale = useRef(new Animated.Value(1)).current;

  const lineOpacity = useRef(new Animated.Value(0.45)).current;
  const lineScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    checkSavedGame();
  }, [checkSavedGame]);

  useEffect(() => {
    const backgroundAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundScale, {
          toValue: 1.08,
          duration: 8000,
          useNativeDriver: true,
        }),

        Animated.timing(backgroundScale, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
      ]),
    );

    const lineAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(lineOpacity, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),

          Animated.timing(lineOpacity, {
            toValue: 0.45,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(lineScale, {
            toValue: 1.12,
            duration: 1400,
            useNativeDriver: true,
          }),

          Animated.timing(lineScale, {
            toValue: 0.9,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    backgroundAnimation.start();
    lineAnimation.start();

    return () => {
      backgroundAnimation.stop();
      lineAnimation.stop();
    };
  }, [backgroundScale, lineOpacity, lineScale]);

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
      <AnimatedImageBackground
        source={require("../assets/images/menu/main-menu-bg.jpg")}
        resizeMode="cover"
        style={[
          styles.background,
          {
            transform: [{ scale: backgroundScale }],
          },
        ]}
      />

      <View style={styles.overlay} />

      {/* Toz / kül */}
      <View pointerEvents="none" style={styles.effects}>
        {DUST_PARTICLES.map((particle, index) => (
          <DustParticle key={index} {...particle} />
        ))}

        {/* Uzak kuşlar */}
        <Bird top="18%" delay={1000} duration={9000} scale={1.1} />
        <Bird top="23%" delay={2200} duration={10000} scale={0.9} />
        <Bird top="14%" delay={3500} duration={11000} scale={0.75} />
      </View>

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
                  <Animated.View
                    style={[
                      styles.activeLine,
                      {
                        opacity: lineOpacity,
                        transform: [{ scaleX: lineScale }],
                      },
                    ]}
                  />
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
    top: -10,
    right: -10,
    bottom: -10,
    left: -10,
  },

  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  effects: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },

  dust: {
    position: "absolute",
    backgroundColor: "#E7C98B",
  },

  bird: {
    position: "absolute",
    left: 0,
    width: 24,
    height: 12,
  },

  birdWing: {
    position: "absolute",
    width: 13,
    height: 2,
    backgroundColor: "rgba(20, 15, 10, 0.85)",
    top: 5,
  },

  birdWingLeft: {
    left: 1,
    transform: [{ rotate: "22deg" }],
  },

  birdWingRight: {
    right: 1,
    transform: [{ rotate: "-22deg" }],
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

    shadowColor: "#DDB936",
    shadowOpacity: 0.8,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
});
