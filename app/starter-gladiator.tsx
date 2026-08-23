import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { generateGladiator } from "../src/features/gladiators/generateGladiator";
import { useGameStore } from "../src/store/gameStore";

export default function StarterGladiatorScreen() {
  const world = useGameStore((state) => state.world);
  const ludus = useGameStore((state) => state.playerLudus);
  const addGladiator = useGameStore((state) => state.addGladiator);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { width, height } = useWindowDimensions();

  const candidates = useMemo(() => {
    if (!world || !ludus) {
      return [];
    }

    return [
      generateGladiator({
        worldId: world.id,
        ludusId: ludus.id,
        profile: "strong",
      }),

      generateGladiator({
        worldId: world.id,
        ludusId: ludus.id,
        profile: "fast",
      }),

      generateGladiator({
        worldId: world.id,
        ludusId: ludus.id,
        profile: "balanced",
      }),
    ];
  }, [world?.id, ludus?.id]);

  const selectedGladiator = candidates.find(
    (gladiator) => gladiator.id === selectedId,
  );

  /*
    Kartların ekranı tamamen doldurmasını istemiyoruz.
    Toplam ekran genişliğinin yaklaşık %70'ini kullanıyoruz.
  */
  const cardsTotalWidth = Math.min(width * 0.72, 900);
  const gap = 18;

  const cardWidth = (cardsTotalWidth - gap * 2) / 3;

  /*
    Küçük telefonlarda da alta taşmaması için
    yüksekliği ekran yüksekliğine göre sınırlıyoruz.
  */
  const cardHeight = Math.min(Math.max(height - 135, 230), 285);

  const handleConfirm = () => {
    if (!selectedGladiator) {
      return;
    }

    addGladiator(selectedGladiator);

    router.replace("/map");
  };

  if (!world || !ludus) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Oyun bilgileri bulunamadı.</Text>

        <Pressable onPress={() => router.replace("/")}>
          <Text style={styles.backText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BAŞLIK */}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>LUDUSUNUN İLK SAVAŞÇISI</Text>

        <Text style={styles.title}>GLADYATÖRÜNÜ SEÇ</Text>
      </View>

      {/* KARTLAR */}

      <View style={styles.cardsWrapper}>
        <View
          style={[
            styles.cardsArea,
            {
              width: cardsTotalWidth,
              gap,
            },
          ]}>
          {candidates.map((gladiator, index) => {
            const selected = selectedId === gladiator.id;

            const roleLabel =
              index === 0 ? "GÜÇLÜ" : index === 1 ? "HIZLI" : "DENGELİ";

            return (
              <Pressable
                key={gladiator.id}
                onPress={() => setSelectedId(gladiator.id)}
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    height: cardHeight,
                  },
                  selected && styles.selectedCard,
                ]}>
                {/* PORTRE */}

                <View style={styles.portrait}>
                  <Text style={styles.roleLabel}>{roleLabel}</Text>

                  {selected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>SEÇİLDİ</Text>
                    </View>
                  )}

                  <Text style={styles.portraitIcon}>⚔️</Text>
                </View>

                {/* İSİM */}

                <View style={styles.identity}>
                  <Text style={styles.name} numberOfLines={1}>
                    {gladiator.name}
                  </Text>

                  <Text style={styles.meta}>
                    {gladiator.age} yaş • {gladiator.origin}
                  </Text>

                  <Text style={styles.className}>
                    {gladiator.class.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* İSTATİSTİKLER */}

                <View style={styles.statsGrid}>
                  <Stat label="Güç" value={gladiator.strength} />

                  <Stat label="Dayanıklılık" value={gladiator.endurance} />

                  <Stat label="Çeviklik" value={gladiator.agility} />

                  <Stat label="Saldırı" value={gladiator.attack} />

                  <Stat label="Savunma" value={gladiator.defense} />

                  <Stat label="Cesaret" value={gladiator.courage} />
                </View>

                {/* POTANSİYEL */}

                <View style={styles.potentialRow}>
                  <Text style={styles.potentialLabel}>Potansiyel</Text>

                  <Text style={styles.potentialValue}>???</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ALT BUTON */}

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          {selectedGladiator
            ? `${selectedGladiator.name} seçildi`
            : "Bir gladyatör seç"}
        </Text>

        <Pressable
          disabled={!selectedGladiator}
          onPress={handleConfirm}
          style={[
            styles.confirmButton,
            !selectedGladiator && styles.disabledButton,
          ]}>
          <Text
            style={[
              styles.confirmButtonText,
              !selectedGladiator && styles.disabledText,
            ]}>
            LUDUSA KAT
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>

      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A08",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },

  center: {
    flex: 1,
    backgroundColor: "#0B0A08",
    alignItems: "center",
    justifyContent: "center",
  },

  /* HEADER */

  header: {
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    color: "#8D773E",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  title: {
    color: "#DDB936",
    fontSize: 23,
    fontWeight: "bold",
    letterSpacing: 3,
    marginTop: 8,
  },

  /* CARDS */

  cardsWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cardsArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#17140F",

    borderWidth: 1,
    borderColor: "#3D3524",
    borderRadius: 8,

    padding: 9,
  },

  selectedCard: {
    borderColor: "#DDB936",
    borderWidth: 2,
    backgroundColor: "#1B170F",
  },

  /* PORTRAIT */

  portrait: {
    height: 62,

    backgroundColor: "#211D16",
    borderRadius: 5,

    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  roleLabel: {
    position: "absolute",
    top: 7,
    left: 8,

    color: "#B99B4D",

    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1.1,
  },

  portraitIcon: {
    fontSize: 24,
  },

  selectedBadge: {
    position: "absolute",
    top: 6,
    right: 6,

    backgroundColor: "#DDB936",

    paddingHorizontal: 7,
    paddingVertical: 3,

    borderRadius: 10,
  },

  selectedBadgeText: {
    color: "#11100D",

    fontSize: 6,
    fontWeight: "bold",
  },

  /* IDENTITY */

  identity: {
    height: 57,

    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    color: "#F0E6C8",

    fontSize: 16,
    fontWeight: "bold",
  },

  meta: {
    color: "#77716A",

    fontSize: 7.5,
    marginTop: 1,
  },

  className: {
    color: "#C3A34F",

    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 1,

    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
  },

  /* STATS */

  statsGrid: {
    flex: 1,

    flexDirection: "row",
    flexWrap: "wrap",

    alignContent: "center",
    justifyContent: "space-between",

    paddingVertical: 3,
  },

  statItem: {
    width: "48%",

    flexDirection: "row",
    justifyContent: "space-between",

    marginVertical: 1,
  },

  statLabel: {
    color: "#8A857D",
    fontSize: 7.5,
  },

  statValue: {
    color: "#E1D5AE",

    fontSize: 7.5,
    fontWeight: "bold",
  },

  /* POTENTIAL */

  potentialRow: {
    height: 25,

    borderTopWidth: 1,
    borderTopColor: "#332C1D",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  potentialLabel: {
    color: "#8A857D",
    fontSize: 7.5,
  },

  potentialValue: {
    color: "#DDB936",

    fontSize: 9,
    fontWeight: "bold",
  },

  /* FOOTER */

  footer: {
    height: 46,

    borderTopWidth: 1,
    borderTopColor: "#211D16",

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 18,
  },

  footerHint: {
    width: 150,

    color: "#66615A",

    fontSize: 8,
    textAlign: "right",
  },

  confirmButton: {
    width: 155,
    height: 32,

    backgroundColor: "#DDB936",

    borderRadius: 5,

    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    backgroundColor: "#292929",
  },

  confirmButtonText: {
    color: "#11100D",

    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.7,
  },

  disabledText: {
    color: "#666666",
  },

  errorText: {
    color: "#DDB936",
    fontSize: 16,
    marginBottom: 18,
  },

  backText: {
    color: "#B99B4D",
    fontSize: 10,
    fontWeight: "bold",
  },
});
