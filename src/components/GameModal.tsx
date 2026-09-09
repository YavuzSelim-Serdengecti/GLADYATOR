import { Pressable, StyleSheet, Text, View } from "react-native";

type GameModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export default function GameModal({
  visible,
  title,
  message,
  onClose,
}: GameModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.topLine} />

        <Text style={styles.eyebrow}>ROMA</Text>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.divider} />

        <Text style={styles.message}>{message}</Text>

        <Pressable style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>TAMAM</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",

    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    zIndex: 999,

    backgroundColor: "rgba(0,0,0,0.78)",

    alignItems: "center",
    justifyContent: "center",

    padding: 24,
  },

  modal: {
    width: "58%",
    maxWidth: 520,

    backgroundColor: "#17140F",

    borderWidth: 1,
    borderColor: "#80632F",

    borderRadius: 10,

    paddingHorizontal: 22,
    paddingVertical: 18,

    alignItems: "center",
  },

  topLine: {
    width: 45,
    height: 2,

    backgroundColor: "#DDB936",

    marginBottom: 10,
  },

  eyebrow: {
    color: "#806C35",

    fontSize: 7,
    fontWeight: "bold",

    letterSpacing: 2,
  },

  title: {
    color: "#DDB936",

    fontSize: 16,
    fontWeight: "bold",

    textAlign: "center",

    marginTop: 4,
  },

  divider: {
    width: "100%",
    height: 1,

    backgroundColor: "#332C1D",

    marginVertical: 12,
  },

  message: {
    color: "#D8CFB8",

    fontSize: 10,
    lineHeight: 16,

    textAlign: "center",
  },

  button: {
    width: 120,
    height: 36,

    marginTop: 18,

    backgroundColor: "#DDB936",

    borderRadius: 5,

    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#11100D",

    fontSize: 8,
    fontWeight: "bold",
  },
});
