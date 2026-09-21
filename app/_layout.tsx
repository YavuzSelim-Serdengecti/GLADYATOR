import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const APP_IMAGES = [
  // Gladyatör portreleri
  require("../assets/images/faces/face_01.png"),
  require("../assets/images/faces/face_02.png"),
  require("../assets/images/faces/face_03.png"),
  require("../assets/images/faces/face_04.png"),
  require("../assets/images/faces/face_05.png"),
  require("../assets/images/faces/face_06.png"),
  require("../assets/images/faces/face_07.png"),
  require("../assets/images/faces/face_08.png"),
  require("../assets/images/faces/face_09.png"),
  require("../assets/images/faces/face_10.png"),
  require("../assets/images/faces/face_11.png"),
  require("../assets/images/faces/face_12.png"),
  require("../assets/images/faces/face_13.png"),
  require("../assets/images/faces/face_14.png"),
  require("../assets/images/faces/face_15.png"),
  require("../assets/images/faces/face_16.png"),

  // Diğer oyun görselleri
  require("../assets/images/menu/main-menu-bg.jpg"),
  require("../assets/images/map/rome-map.jpeg"),
];

export default function RootLayout() {
  useEffect(() => {
    Asset.loadAsync(APP_IMAGES).catch((error) => {
      console.log("Görseller preload edilemedi:", error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" hidden />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "#111111",
          },
        }}
      />
    </SafeAreaProvider>
  );
}
