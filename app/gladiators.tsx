import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useGameStore } from "../src/store/gameStore";

export default function GladiatorsScreen() {
  const gladiators = useGameStore((state) => state.gladiators);
  const ludus = useGameStore((state) => state.playerLudus);

  const { width, height } = useWindowDimensions();

  const playerGladiators = ludus
    ? gladiators.filter((gladiator) => gladiator.ludusId === ludus.id)
    : [];

  // Her sayfada maksimum 4 gladyatör.
  const pages = [];

  for (let i = 0; i < playerGladiators.length; i += 4) {
    pages.push(playerGladiators.slice(i, i + 4));
  }

  const contentWidth = width - 44;

  const columnGap = 14;
  const rowGap = 10;

  const cardWidth = (contentWidth - columnGap) / 2;

  const availableHeight = height - 100;

  const cardHeight = Math.max(125, (availableHeight - rowGap - 20) / 2);

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>GLADYATÖRLER</Text>

          <Text style={styles.subtitle}>
            {ludus?.name ?? "Ludus"} • {playerGladiators.length} savaşçı
          </Text>
        </View>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>← HARİTAYA DÖN</Text>
        </Pressable>
      </View>

      {/* BOŞ DURUM */}

      {playerGladiators.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>HENÜZ GLADYATÖRÜN YOK</Text>

          <Text style={styles.emptyText}>
            Pazardan veya açık artırmadan yeni gladyatörler edinebilirsin.
          </Text>
        </View>
      ) : (
        /* SAYFALAR */

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.pageScroll}>
          {pages.map((page, pageIndex) => (
            <View
              key={pageIndex}
              style={[
                styles.page,
                {
                  width: contentWidth,
                },
              ]}>
              {page.map((gladiator) => (
                <Pressable
                  key={gladiator.id}
                  style={[
                    styles.card,
                    {
                      width: cardWidth,
                      height: cardHeight,
                    },
                  ]}>
                  {/* PORTRE */}

                  <View style={styles.portrait}>
                    <Text style={styles.portraitIcon}>⚔️</Text>

                    <Text style={styles.portraitText}>GLADYATÖR</Text>
                  </View>

                  {/* ORTA ALAN */}

                  <View style={styles.middle}>
                    <Text style={styles.name} numberOfLines={1}>
                      {gladiator.name}
                    </Text>

                    <Text style={styles.meta}>
                      {gladiator.age} yaş • {gladiator.origin}
                    </Text>

                    <Text style={styles.className}>
                      {gladiator.class.toUpperCase()}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.stats}>
                      <Stat label="Güç" value={gladiator.strength} />

                      <Stat label="Dayanıklılık" value={gladiator.endurance} />

                      <Stat label="Çeviklik" value={gladiator.agility} />

                      <Stat label="Saldırı" value={gladiator.attack} />

                      <Stat label="Savunma" value={gladiator.defense} />

                      <Stat label="Cesaret" value={gladiator.courage} />
                    </View>
                  </View>

                  {/* SAĞ ALAN */}

                  <View style={styles.rightArea}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.status}>
                        {gladiator.status === "active"
                          ? "HAZIR"
                          : gladiator.status.toUpperCase()}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.smallLabel}>SAĞLIK</Text>

                      <Text style={styles.hp}>
                        {gladiator.hp}/{gladiator.maxHp}
                      </Text>

                      <View style={styles.hpBar}>
                        <View
                          style={[
                            styles.hpFill,
                            {
                              width: `${Math.min(
                                100,
                                (gladiator.hp / gladiator.maxHp) * 100,
                              )}%`,
                            },
                          ]}
                        />
                      </View>

                      <Text style={styles.smallLabel}>KARİYER</Text>

                      <Text style={styles.record}>
                        {gladiator.wins}G • {gladiator.losses}M
                      </Text>
                    </View>

                    <Text style={styles.details}>DETAYLAR →</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>

      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A08",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 8,
  },

  /* HEADER */

  header: {
    height: 60,

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
    fontSize: 8.5,
    marginTop: 2,
  },

  backButton: {
    color: "#B99B4D",
    fontSize: 9,
    fontWeight: "bold",
  },

  /* SAYFALAR */

  pageScroll: {
    flex: 1,
  },

  page: {
    flexDirection: "row",
    flexWrap: "wrap",

    columnGap: 14,
    rowGap: 10,

    alignContent: "center",

    paddingVertical: 10,
  },

  /* CARD */

  card: {
    backgroundColor: "#17140F",

    borderWidth: 1,
    borderColor: "#3D3524",

    borderRadius: 8,

    padding: 9,

    flexDirection: "row",

    overflow: "hidden",
  },

  /* PORTRAIT */

  portrait: {
    width: "25%",

    backgroundColor: "#211D16",

    borderRadius: 5,

    alignItems: "center",
    justifyContent: "center",
  },

  portraitIcon: {
    fontSize: 26,
  },

  portraitText: {
    color: "#5D564A",

    fontSize: 5.5,
    fontWeight: "bold",
    letterSpacing: 0.8,

    marginTop: 3,
  },

  /* MIDDLE */

  middle: {
    width: "47%",

    paddingHorizontal: 10,

    justifyContent: "center",
  },

  name: {
    color: "#F0E6C8",

    fontSize: 15,
    fontWeight: "bold",
  },

  meta: {
    color: "#77716A",

    fontSize: 7,
    marginTop: 1,
  },

  className: {
    color: "#C3A34F",

    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 0.8,

    marginTop: 2,
  },

  divider: {
    height: 1,

    backgroundColor: "#332C1D",

    marginVertical: 5,
  },

  stats: {
    flexDirection: "row",
    flexWrap: "wrap",

    justifyContent: "space-between",
  },

  statRow: {
    width: "48%",

    flexDirection: "row",
    justifyContent: "space-between",

    marginVertical: 1,
  },

  statLabel: {
    color: "#8A857D",
    fontSize: 6.5,
  },

  statValue: {
    color: "#E1D5AE",

    fontSize: 6.5,
    fontWeight: "bold",
  },

  /* RIGHT */

  rightArea: {
    flex: 1,

    borderLeftWidth: 1,
    borderLeftColor: "#332C1D",

    paddingLeft: 9,

    justifyContent: "space-between",
  },

  statusBadge: {
    alignSelf: "flex-end",

    borderWidth: 1,
    borderColor: "#536744",

    paddingHorizontal: 6,
    paddingVertical: 2,

    borderRadius: 4,
  },

  status: {
    color: "#8FAF72",

    fontSize: 6,
    fontWeight: "bold",
  },

  smallLabel: {
    color: "#676159",

    fontSize: 5.5,
    fontWeight: "bold",
    letterSpacing: 0.5,

    marginTop: 2,
  },

  hp: {
    color: "#D8CFB8",

    fontSize: 9,
    fontWeight: "bold",
  },

  hpBar: {
    height: 3,

    backgroundColor: "#302C26",

    borderRadius: 2,

    overflow: "hidden",

    marginTop: 2,
    marginBottom: 3,
  },

  hpFill: {
    height: "100%",
    backgroundColor: "#8FAF72",
  },

  record: {
    color: "#8A857D",
    fontSize: 6.5,
  },

  details: {
    color: "#B99B4D",

    fontSize: 6,
    fontWeight: "bold",

    textAlign: "right",
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: "#DDB936",
    fontSize: 17,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#77716A",
    fontSize: 9,
    marginTop: 6,
  },
});
