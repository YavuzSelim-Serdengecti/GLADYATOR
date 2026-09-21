import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type GladiatorPortraitProps = {
  style?: StyleProp<ViewStyle>;
  dead?: boolean;
  gladiatorId?: string | number;
  portraitId?: number;
  variant?: number;
};

const PORTRAITS: ImageSourcePropType[] = [
  require("../../assets/images/faces/face_01.png"),
  require("../../assets/images/faces/face_02.png"),
  require("../../assets/images/faces/face_03.png"),
  require("../../assets/images/faces/face_04.png"),
  require("../../assets/images/faces/face_05.png"),
  require("../../assets/images/faces/face_06.png"),
  require("../../assets/images/faces/face_07.png"),
  require("../../assets/images/faces/face_08.png"),
  require("../../assets/images/faces/face_09.png"),
  require("../../assets/images/faces/face_10.png"),
  require("../../assets/images/faces/face_11.png"),
  require("../../assets/images/faces/face_12.png"),
  require("../../assets/images/faces/face_13.png"),
  require("../../assets/images/faces/face_14.png"),
  require("../../assets/images/faces/face_15.png"),
  require("../../assets/images/faces/face_16.png"),
];

function getPortraitIndex(gladiatorId?: string | number, variant?: number) {
  if (variant !== undefined) {
    return Math.abs(variant - 1) % PORTRAITS.length;
  }

  if (gladiatorId === undefined) {
    return 0;
  }

  const value = String(gladiatorId);

  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash % PORTRAITS.length;
}

export default function GladiatorPortrait({
  style,
  dead = false,
  gladiatorId,
  portraitId,
  variant,
}: GladiatorPortraitProps) {
  const portraitIndex =
    portraitId !== undefined
      ? Math.abs(portraitId - 1) % PORTRAITS.length
      : getPortraitIndex(gladiatorId, variant);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={PORTRAITS[portraitIndex]}
        style={styles.image}
        resizeMode="contain"
      />

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
