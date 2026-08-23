import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "../src/store/gameStore";

type MapLocationProps = {
  title: string;
  subtitle?: string;
  levelRequired?: number;
  currentLevel: number;
  onPress?: () => void;
  style?: object;
};

function MapLocation({
  title,
  subtitle,
  levelRequired = 1,
  currentLevel,
  onPress,
  style,
}: MapLocationProps) {
  const locked = currentLevel < levelRequired;

  return (
    <Pressable
      disabled={locked || !onPress}
      onPress={onPress}
      style={[styles.location, locked && styles.lockedLocation, style]}>
      <Text style={styles.locationIcon}>{locked ? "🔒" : "🏛️"}</Text>

      <Text style={[styles.locationTitle, locked && styles.lockedText]}>
        {title}
      </Text>

      {locked ? (
        <Text style={styles.levelText}>Lv. {levelRequired}</Text>
      ) : subtitle ? (
        <Text style={styles.locationSubtitle}>{subtitle}</Text>
      ) : null}
    </Pressable>
  );
}

export default function MapScreen() {
  const world = useGameStore((state) => state.world);
  const ludus = useGameStore((state) => state.playerLudus);

  if (!world || !ludus) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>OYUN BULUNAMADI</Text>

        <Pressable
          style={styles.menuButton}
          onPress={() => router.replace("/")}>
          <Text style={styles.menuButtonText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ÜST BAR */}

      <View style={styles.topBar}>
        <View>
          <Text style={styles.ludusName}>{ludus.name}</Text>

          <Text style={styles.lanista}>Lanista: {ludus.lanistaName}</Text>
        </View>

        <View style={styles.resources}>
          <Text style={styles.resource}>LV. {ludus.level}</Text>

          <Text style={styles.resource}>🪙 {ludus.denarius}</Text>

          <Text style={styles.resource}>⭐ {ludus.fame}</Text>

          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

          <Text style={styles.day}>GÜN {world.currentDay}</Text>
        </View>
      </View>

      {/* HARİTA */}

      <View style={styles.map}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapEyebrow}>ROMA</Text>

          <Text style={styles.mapTitle}>ŞEHİR HARİTASI</Text>
        </View>

        <View style={styles.roadHorizontal} />
        <View style={styles.roadVertical} />

        {/* SOL ÜST */}

        <MapLocation
          title="LUDUS"
          subtitle="Hanedanını yönet"
          currentLevel={ludus.level}
          onPress={() => router.push("/gladiators")}
          style={styles.ludusLocation}
        />

        {/* ÜST ORTA */}

        <MapLocation
          title="ARENA"
          subtitle="Şöhret için savaş"
          currentLevel={ludus.level}
          style={styles.arenaLocation}
        />

        {/* SAĞ ÜST */}

        <MapLocation
          title="GLADYATÖR PAZARI"
          subtitle="Yeni savaşçılar bul"
          currentLevel={ludus.level}
          onPress={() => router.push("/market")}
          style={styles.marketLocation}
        />

        {/* SOL ALT */}

        <MapLocation
          title="DEMİRCİ"
          levelRequired={2}
          currentLevel={ludus.level}
          style={styles.blacksmithLocation}
        />

        {/* ORTA */}

        <MapLocation
          title="TAVERNA"
          levelRequired={4}
          currentLevel={ludus.level}
          style={styles.tavernLocation}
        />

        {/* SAĞ ORTA */}

        <MapLocation
          title="REVİR"
          levelRequired={5}
          currentLevel={ludus.level}
          style={styles.infirmaryLocation}
        />

        {/* SOL ALT 2 */}

        <MapLocation
          title="MADEN"
          levelRequired={7}
          currentLevel={ludus.level}
          style={styles.mineLocation}
        />

        {/* SAĞ ALT */}

        <MapLocation
          title="OYUN EVİ"
          levelRequired={8}
          currentLevel={ludus.level}
          style={styles.gamblingLocation}
        />

        {/* TEST / GEÇİCİ */}

        <Pressable
          style={styles.rivalsButton}
          onPress={() => router.push("/rivals")}>
          <Text style={styles.rivalsButtonText}>RAKİP LUDUSLAR</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A08",
  },

  center: {
    flex: 1,
    backgroundColor: "#0B0A08",
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    color: "#DDB936",
    fontSize: 24,
    fontWeight: "bold",
  },

  menuButton: {
    borderWidth: 1,
    borderColor: "#DDB936",
    borderRadius: 5,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 20,
  },

  menuButtonText: {
    color: "#DDB936",
    fontWeight: "bold",
  },

  /* TOP BAR */

  topBar: {
    height: 64,
    paddingHorizontal: 24,

    backgroundColor: "#0E0C0A",

    borderBottomWidth: 1,
    borderBottomColor: "#332C1D",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ludusName: {
    color: "#DDB936",
    fontSize: 17,
    fontWeight: "bold",
  },

  lanista: {
    color: "#706B63",
    fontSize: 8,
    marginTop: 2,
  },

  resources: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  resource: {
    color: "#DED4B7",
    fontSize: 10,
    fontWeight: "bold",
  },

  day: {
    color: "#B99B4D",
    fontSize: 9,
    fontWeight: "bold",
  },

  /* MAP */

  map: {
    flex: 1,
    position: "relative",

    margin: 12,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#30291D",

    borderRadius: 10,

    backgroundColor: "#15110C",
  },

  mapHeader: {
    position: "absolute",
    top: 12,
    left: 16,

    zIndex: 5,
  },

  mapEyebrow: {
    color: "#77663A",
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  mapTitle: {
    color: "#B99B4D",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 1,
  },

  roadHorizontal: {
    position: "absolute",

    left: "8%",
    right: "8%",

    top: "49%",

    height: 18,

    backgroundColor: "#211B13",

    borderTopWidth: 1,
    borderBottomWidth: 1,

    borderColor: "#3A3021",
  },

  roadVertical: {
    position: "absolute",

    top: "14%",
    bottom: "10%",

    left: "49%",

    width: 18,

    backgroundColor: "#211B13",

    borderLeftWidth: 1,
    borderRightWidth: 1,

    borderColor: "#3A3021",
  },

  /* LOCATIONS */

  location: {
    position: "absolute",

    width: 135,
    height: 70,

    backgroundColor: "#1E1912",

    borderWidth: 1,
    borderColor: "#66542A",

    borderRadius: 8,

    alignItems: "center",
    justifyContent: "center",
  },

  lockedLocation: {
    backgroundColor: "#15130F",
    borderColor: "#302C25",
  },

  locationIcon: {
    fontSize: 16,
  },

  locationTitle: {
    color: "#D8C88F",

    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.7,

    marginTop: 2,
  },

  locationSubtitle: {
    color: "#736C61",
    fontSize: 6.5,
    marginTop: 2,
  },

  lockedText: {
    color: "#5B5751",
  },

  levelText: {
    color: "#504C47",

    fontSize: 6.5,
    fontWeight: "bold",

    marginTop: 2,
  },

  ludusLocation: {
    left: "8%",
    top: "22%",
  },

  arenaLocation: {
    left: "42%",
    top: "15%",
  },

  marketLocation: {
    right: "7%",
    top: "24%",
  },

  blacksmithLocation: {
    left: "15%",
    bottom: "13%",
  },

  tavernLocation: {
    left: "42%",
    top: "56%",
  },

  infirmaryLocation: {
    right: "12%",
    top: "54%",
  },

  mineLocation: {
    left: "3%",
    bottom: "2%",
  },

  gamblingLocation: {
    right: "4%",
    bottom: "3%",
  },

  /* TEMP */

  rivalsButton: {
    position: "absolute",

    right: 12,
    top: 12,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderWidth: 1,
    borderColor: "#4A3F27",

    borderRadius: 4,
  },

  rivalsButtonText: {
    color: "#7F6C3A",

    fontSize: 7,
    fontWeight: "bold",
  },
});
