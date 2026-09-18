import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const APP_IMAGES = [
  require("../assets/images/faces/face_1_olive.png"),
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
