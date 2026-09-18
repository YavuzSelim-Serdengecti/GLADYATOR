import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type GladiatorPortraitProps = {
  style?: StyleProp<ViewStyle>;
  dead?: boolean;
};

const TEST_PORTRAIT = require("../../assets/images/faces/face_1_olive.png");

export default function GladiatorPortrait({
  style,
  dead = false,
}: GladiatorPortraitProps) {
  return (
    <View style={[styles.container, style]}>
      <Image source={TEST_PORTRAIT} style={styles.image} resizeMode="contain" />

      {dead && <View style={styles.deadOverlay} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#211D16",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  deadOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
});
