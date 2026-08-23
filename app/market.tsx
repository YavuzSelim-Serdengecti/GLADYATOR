import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import { generateGladiator } from "../src/features/gladiators/generateGladiator";
import { createAuction } from "../src/features/market/createAuction";
import { useGameStore } from "../src/store/gameStore";
import { Auction } from "../src/types/game";

export default function MarketScreen() {
  const world = useGameStore((state) => state.world);
  const ludus = useGameStore((state) => state.playerLudus);

  const buyGladiator = useGameStore((state) => state.buyGladiator);

  const aiBuyGladiator = useGameStore((state) => state.aiBuyGladiator);

  const aiLuduses = useGameStore((state) => state.aiLuduses);

  const { width, height } = useWindowDimensions();

  const listRef = useRef<FlatList<Auction>>(null);

  const [auctions, setAuctions] = useState<Auction[]>([]);

  const aiBidLimits = useRef<Record<string, number>>({});
  const aiAuctionOwners = useRef<Record<string, string>>({});

  const gap = 12;
  const horizontalPadding = 24;

  const cardWidth = (width - horizontalPadding * 2 - gap * 3) / 4;

  const cardHeight = Math.max(245, Math.min(height - 145, 285));

  // 5 açık artırma oluştur.
  useEffect(() => {
    if (!world || aiLuduses.length === 0) {
      return;
    }

    const newAuctions = Array.from({ length: 5 }, () => {
      const gladiator = generateGladiator({
        worldId: world.id,
        profile: "random",
      });

      const auction = createAuction(gladiator);

      // Her açık artırmaya rastgele bir rakip Ludus atanıyor.
      const randomAi = aiLuduses[Math.floor(Math.random() * aiLuduses.length)];

      aiAuctionOwners.current[auction.id] = randomAi.id;

      // AI'nın bu gladyatör için çıkabileceği
      // maksimum fiyat.
      let multiplier = 1.15;

      if (randomAi.aiPersonality === "warrior") {
        multiplier = 1.35;
      }

      if (randomAi.aiPersonality === "merchant") {
        multiplier = 1.1;
      }

      if (randomAi.aiPersonality === "builder") {
        multiplier = 1.05;
      }

      if (randomAi.aiPersonality === "risky") {
        multiplier = 1.45;
      }

      if (randomAi.aiPersonality === "balanced") {
        multiplier = 1.2;
      }

      // Biraz rastgelelik ekliyoruz.
      const randomBonus = Math.random() * 0.15;

      aiBidLimits.current[auction.id] = Math.round(
        gladiator.marketValue * (multiplier + randomBonus),
      );

      return auction;
    });

    setAuctions(newAuctions);
  }, [world?.id]);

  // Pazara girildiğinde liste baştan başlasın.
  useEffect(() => {
    const timeout = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  const getAiBidderValue = (
    aiLudusId: string,
  ): "ai-1" | "ai-2" | "ai-3" | "ai-4" => {
    const index = aiLuduses.findIndex((item) => item.id === aiLudusId);

    if (index === 0) return "ai-1";
    if (index === 1) return "ai-2";
    if (index === 2) return "ai-3";

    return "ai-4";
  };

  const getBidderName = (auction: Auction): string | null => {
    if (!auction.currentBidder) {
      return null;
    }

    if (auction.currentBidder === "player") {
      return "Sen";
    }

    const index = Number(auction.currentBidder.split("-")[1]) - 1;

    return aiLuduses[index]?.name ?? "Rakip Ludus";
  };

  const removeAuction = (auctionId: string) => {
    setAuctions((current) => current.filter((item) => item.id !== auctionId));
  };

  const handleBid = (auction: Auction) => {
    if (!ludus) {
      return;
    }

    const playerBid = auction.currentBid + auction.minNextBid;

    const aiLudusId = aiAuctionOwners.current[auction.id];

    const aiLudus = aiLuduses.find((item) => item.id === aiLudusId);

    /*
     * Oyuncunun yeni teklife parası yetmiyorsa:
     * Eğer AI zaten en yüksek teklif sahibiyse,
     * açık artırmayı AI kazanır.
     */
    if (ludus.denarius < playerBid) {
      if (
        aiLudus &&
        auction.currentBidder !== null &&
        auction.currentBidder !== "player"
      ) {
        const aiWins = aiBuyGladiator(
          auction.gladiator,
          aiLudus.id,
          auction.currentBid,
        );

        if (aiWins) {
          removeAuction(auction.id);

          Alert.alert(
            "Açık Artırmayı Kaybettin",
            `${aiLudus.name}, ${auction.gladiator.name} adlı gladyatörü ${auction.currentBid} Denarius karşılığında satın aldı.`,
          );

          return;
        }
      }

      Alert.alert(
        "Yetersiz Denarius",
        `Bir sonraki teklif için ${playerBid} Denarius gerekiyor.`,
      );

      return;
    }

    const aiLimit =
      aiBidLimits.current[auction.id] ?? auction.gladiator.marketValue;

    const aiBid = playerBid + auction.minNextBid;

    const aiWillContinue =
      !!aiLudus && aiBid <= aiLimit && aiBid <= aiLudus.denarius;

    /*
     * AI karşı teklif veriyor.
     */
    if (aiWillContinue && aiLudus) {
      const bidderValue = getAiBidderValue(aiLudus.id);

      setAuctions((current) =>
        current.map((item) =>
          item.id === auction.id
            ? {
                ...item,
                currentBid: aiBid,
                currentBidder: bidderValue,
              }
            : item,
        ),
      );

      Alert.alert(
        "Karşı Teklif!",
        `${aiLudus.name}, fiyatı ${aiBid} Denarius'a yükseltti.`,
      );

      return;
    }

    /*
     * AI devam etmiyorsa oyuncu kazanıyor.
     */
    const success = buyGladiator(auction.gladiator, playerBid);

    if (!success) {
      Alert.alert("Satın Alma Başarısız", "Gladyatör satın alınamadı.");

      return;
    }

    removeAuction(auction.id);

    Alert.alert(
      "Açık Artırmayı Kazandın!",
      `${auction.gladiator.name}, ${playerBid} Denarius karşılığında Ludus'una katıldı.`,
    );
  };

  if (!world || !ludus) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Oyun bulunamadı.</Text>

        <Pressable onPress={() => router.replace("/")}>
          <Text style={styles.backText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>GLADYATÖR PAZARI</Text>

          <Text style={styles.subtitle}>
            Rakip Luduslarla açık artırmada mücadele et.
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.money}>🪙 {ludus.denarius} D</Text>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← HARİTAYA DÖN</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>BUGÜNKÜ AÇIK ARTIRMALAR</Text>

        <Text style={styles.refreshText}>Yeni açık artırma: 3 gün sonra</Text>
      </View>

      <FlatList
        ref={listRef}
        horizontal
        data={auctions}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {
            gap,
          },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>AÇIK ARTIRMA TAMAMLANDI</Text>

            <Text style={styles.emptyText}>
              Yeni savaşçılar birkaç gün sonra pazara gelecek.
            </Text>
          </View>
        }
        renderItem={({ item: auction }) => {
          const gladiator = auction.gladiator;

          const nextBid = auction.currentBid + auction.minNextBid;

          const bidderName = getBidderName(auction);

          return (
            <View
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: cardHeight,
                },
              ]}>
              <View style={styles.portrait}>
                <Text style={styles.portraitIcon}>⚔️</Text>
              </View>

              <View style={styles.identity}>
                <Text style={styles.name} numberOfLines={1}>
                  {gladiator.name}
                </Text>

                <Text style={styles.meta}>
                  {gladiator.age} yaş • {gladiator.origin}
                </Text>

                <View style={styles.tags}>
                  <Text style={styles.className}>
                    {gladiator.class.toUpperCase()}
                  </Text>

                  <Text style={styles.dot}>•</Text>

                  <Text style={styles.rarity}>
                    {gladiator.rarity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsGrid}>
                <Stat label="Güç" value={gladiator.strength} />

                <Stat label="Dayanıklılık" value={gladiator.endurance} />

                <Stat label="Çeviklik" value={gladiator.agility} />

                <Stat label="Saldırı" value={gladiator.attack} />

                <Stat label="Savunma" value={gladiator.defense} />

                <Stat label="Cesaret" value={gladiator.courage} />
              </View>

              <View style={styles.divider} />

              <View style={styles.potentialRow}>
                <Text style={styles.statLabel}>Potansiyel</Text>

                <Text style={styles.unknown}>???</Text>
              </View>

              {bidderName && (
                <Text style={styles.bidder}>
                  En yüksek teklif: {bidderName}
                </Text>
              )}

              <View style={styles.bottomArea}>
                <View>
                  <Text style={styles.priceLabel}>GÜNCEL TEKLİF</Text>

                  <Text style={styles.price}>{auction.currentBid} D</Text>
                </View>

                <Pressable
                  style={styles.bidButton}
                  onPress={() => handleBid(auction)}>
                  <Text style={styles.bidButtonText}>TEKLİF {nextBid} D</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
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
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },

  center: {
    flex: 1,
    backgroundColor: "#0B0A08",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    height: 66,
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

  headerRight: {
    alignItems: "flex-end",
    gap: 5,
  },

  money: {
    color: "#E5D8AB",
    fontSize: 14,
    fontWeight: "bold",
  },

  backText: {
    color: "#B99B4D",
    fontSize: 10,
    fontWeight: "bold",
  },

  error: {
    color: "#DDB936",
    marginBottom: 14,
  },

  sectionHeader: {
    height: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: "#A88D49",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },

  refreshText: {
    color: "#5F5A52",
    fontSize: 9,
  },

  list: {
    paddingTop: 4,
    paddingBottom: 2,
  },

  card: {
    backgroundColor: "#17140F",
    borderWidth: 1,
    borderColor: "#3D3524",
    borderRadius: 8,
    padding: 9,
  },

  portrait: {
    height: 35,
    backgroundColor: "#211D16",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  portraitIcon: {
    fontSize: 19,
  },

  identity: {
    alignItems: "center",
    marginTop: 5,
  },

  name: {
    color: "#F0E6C8",
    fontSize: 15,
    fontWeight: "bold",
  },

  meta: {
    color: "#77716A",
    fontSize: 8.5,
    marginTop: 1,
  },

  tags: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 4,
  },

  className: {
    color: "#C3A34F",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.7,
  },

  dot: {
    color: "#504735",
    fontSize: 8,
  },

  rarity: {
    color: "#8D7944",
    fontSize: 8,
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 5,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statItem: {
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1.5,
  },

  statLabel: {
    color: "#8A857D",
    fontSize: 8.5,
  },

  statValue: {
    color: "#E1D5AE",
    fontSize: 8.5,
    fontWeight: "bold",
  },

  potentialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  unknown: {
    color: "#DDB936",
    fontSize: 9,
    fontWeight: "bold",
  },

  bidder: {
    color: "#77716A",
    fontSize: 7.5,
    marginTop: 4,
  },

  bottomArea: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },

  priceLabel: {
    color: "#69635B",
    fontSize: 6.5,
    fontWeight: "bold",
    letterSpacing: 0.7,
  },

  price: {
    color: "#DDB936",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 1,
  },

  bidButton: {
    flex: 1,
    maxWidth: 100,
    height: 30,
    backgroundColor: "#DDB936",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  bidButtonText: {
    color: "#11100D",
    fontSize: 7.5,
    fontWeight: "bold",
  },

  empty: {
    width: 500,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: "#DDB936",
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#77716A",
    fontSize: 10,
    marginTop: 6,
  },
});
