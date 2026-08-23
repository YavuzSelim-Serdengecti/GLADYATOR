import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "../src/store/gameStore";

export default function RivalsScreen() {
  const aiLuduses = useGameStore((state) => state.aiLuduses);
  const gladiators = useGameStore((state) => state.gladiators);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>RAKİP LUDUSLAR</Text>
          <Text style={styles.subtitle}>
            Roma'daki rakip hanedanların mevcut durumu
          </Text>
        </View>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← HARİTAYA DÖN</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {aiLuduses.map((ludus) => {
          const ludusGladiators = gladiators.filter(
            (gladiator) => gladiator.ludusId === ludus.id,
          );

          return (
            <View key={ludus.id} style={styles.card}>
              <Text style={styles.ludusName}>{ludus.name}</Text>

              <Text style={styles.lanista}>Lanista: {ludus.lanistaName}</Text>

              <Text style={styles.personality}>
                {ludus.aiPersonality?.toUpperCase()}
              </Text>

              <View style={styles.divider} />

              <Info label="Denarius" value={`${ludus.denarius} D`} />
              <Info label="Level" value={`${ludus.level}`} />
              <Info label="Şöhret" value={`${ludus.fame}`} />
              <Info label="Gladyatör" value={`${ludusGladiators.length}`} />

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>GLADYATÖRLER</Text>

              {ludusGladiators.length === 0 ? (
                <Text style={styles.emptyText}>Henüz gladyatörü yok.</Text>
              ) : (
                ludusGladiators.map((gladiator) => (
                  <View key={gladiator.id} style={styles.gladiatorRow}>
                    <View>
                      <Text style={styles.gladiatorName}>{gladiator.name}</Text>

                      <Text style={styles.gladiatorMeta}>
                        {gladiator.class.toUpperCase()} • {gladiator.age} yaş
                      </Text>
                    </View>

                    <Text style={styles.gladiatorValue}>
                      {gladiator.marketValue} D
                    </Text>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A08",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },

  header: {
    height: 68,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#332C1D",
  },

  title: {
    color: "#DDB936",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  subtitle: {
    color: "#77716A",
    fontSize: 10,
    marginTop: 2,
  },

  backText: {
    color: "#B99B4D",
    fontSize: 10,
    fontWeight: "bold",
  },

  list: {
    gap: 14,
    paddingTop: 14,
    paddingRight: 24,
  },

  card: {
    width: 260,
    minHeight: 290,
    backgroundColor: "#17140F",
    borderWidth: 1,
    borderColor: "#3D3524",
    borderRadius: 8,
    padding: 14,
  },

  ludusName: {
    color: "#F0E6C8",
    fontSize: 18,
    fontWeight: "bold",
  },

  lanista: {
    color: "#77716A",
    fontSize: 10,
    marginTop: 2,
  },

  personality: {
    color: "#B99B4D",
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  infoLabel: {
    color: "#817C74",
    fontSize: 10,
  },

  infoValue: {
    color: "#E1D5AE",
    fontSize: 10,
    fontWeight: "bold",
  },

  sectionTitle: {
    color: "#A88D49",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },

  emptyText: {
    color: "#5F5A52",
    fontSize: 9,
  },

  gladiatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },

  gladiatorName: {
    color: "#D8CFB8",
    fontSize: 10,
    fontWeight: "bold",
  },

  gladiatorMeta: {
    color: "#6E6962",
    fontSize: 8,
    marginTop: 1,
  },

  gladiatorValue: {
    color: "#B99B4D",
    fontSize: 9,
    fontWeight: "bold",
  },
});
