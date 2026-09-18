import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import GameModal from "../src/components/GameModal";
import GladiatorPortrait from "../src/components/GladiatorPortrait";
import { generateGladiatorPool } from "../src/features/gladiators/generateGladiatorPool";
import { createAuction } from "../src/features/market/createAuction";
import { useGameStore } from "../src/store/gameStore";
import { Auction } from "../src/types/game";
const MARKET_ACTION_COST = 1;
const MARKET_REFRESH_COST = 1;
const MARKET_GLADIATOR_COUNT = 5;

export default function MarketScreen() {
  const world = useGameStore((state) => state.world);
  const ludus = useGameStore((state) => state.playerLudus);

  const buyGladiator = useGameStore((state) => state.buyGladiator);
  const aiBuyGladiator = useGameStore((state) => state.aiBuyGladiator);
  const aiLuduses = useGameStore((state) => state.aiLuduses);

  const spendActionPoints = useGameStore((state) => state.spendActionPoints);

  const { width, height } = useWindowDimensions();

  const listRef = useRef<FlatList<Auction>>(null);

  const [auctions, setAuctions] = useState<Auction[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const aiBidLimits = useRef<Record<string, number>>({});
  const aiAuctionOwners = useRef<Record<string, string>>({});

  const gap = 12;
  const horizontalPadding = 24;

  const cardWidth = (width - horizontalPadding * 2 - gap * 3) / 4;

  const cardHeight = Math.max(245, Math.min(height - 145, 285));

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const createMarketAuctions = () => {
    if (!world || aiLuduses.length === 0) {
      return;
    }

    aiBidLimits.current = {};
    aiAuctionOwners.current = {};

    const gladiatorPool = generateGladiatorPool({
      worldId: world.id,
      count: MARKET_GLADIATOR_COUNT,
    });

    const newAuctions = gladiatorPool.map((gladiator) => {
      const auction = createAuction(gladiator);

      const randomAi = aiLuduses[Math.floor(Math.random() * aiLuduses.length)];

      aiAuctionOwners.current[auction.id] = randomAi.id;

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

      const randomBonus = Math.random() * 0.15;

      aiBidLimits.current[auction.id] = Math.round(
        gladiator.marketValue * (multiplier + randomBonus),
      );

      return auction;
    });

    setAuctions(newAuctions);

    setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
    }, 50);
  };

  useEffect(() => {
    createMarketAuctions();
  }, [world?.id]);

  const handleRefreshMarket = () => {
    if (!ludus) {
      return;
    }

    if (ludus.actionPoints < MARKET_REFRESH_COST) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `Pazarı yenilemek için ${MARKET_REFRESH_COST} aksiyon puanı gerekiyor.\n\nKalan aksiyon: ${ludus.actionPoints}/${ludus.maxActionPoints}`,
      );

      return;
    }

    const success = spendActionPoints(MARKET_REFRESH_COST);

    if (!success) {
      showModal("YENİLEME BAŞARISIZ", "Pazar yenilenemedi.");

      return;
    }

    createMarketAuctions();

    showModal(
      "PAZAR YENİLENDİ",
      `${MARKET_GLADIATOR_COUNT} yeni gladyatör açık artırmaya çıkarıldı.\n\n⚡ ${MARKET_REFRESH_COST} aksiyon puanı harcandı.`,
    );
  };

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

    if (ludus.actionPoints < MARKET_ACTION_COST) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `Pazardan gladyatör satın almak için ${MARKET_ACTION_COST} aksiyon puanı gerekiyor.\n\nKalan aksiyon: ${ludus.actionPoints}/${ludus.maxActionPoints}`,
      );

      return;
    }

    const playerBid = auction.currentBid + auction.minNextBid;

    const aiLudusId = aiAuctionOwners.current[auction.id];

    const aiLudus = aiLuduses.find((item) => item.id === aiLudusId);

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

          showModal(
            "AÇIK ARTIRMAYI KAYBETTİN",
            `${aiLudus.name}, ${auction.gladiator.name} adlı gladyatörü ${auction.currentBid} Denarius karşılığında satın aldı.`,
          );

          return;
        }
      }

      showModal(
        "YETERSİZ DENARIUS",
        `Bir sonraki teklif için ${playerBid} Denarius gerekiyor.`,
      );

      return;
    }

    const aiLimit =
      aiBidLimits.current[auction.id] ?? auction.gladiator.marketValue;

    const aiBid = playerBid + auction.minNextBid;

    const aiWillContinue =
      !!aiLudus && aiBid <= aiLimit && aiBid <= aiLudus.denarius;

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

      showModal(
        "KARŞI TEKLİF!",
        `${aiLudus.name}, fiyatı ${aiBid} Denarius'a yükseltti.`,
      );

      return;
    }

    const success = buyGladiator(auction.gladiator, playerBid);

    if (!success) {
      showModal("SATIN ALMA BAŞARISIZ", "Gladyatör satın alınamadı.");

      return;
    }

    spendActionPoints(MARKET_ACTION_COST);

    removeAuction(auction.id);

    showModal(
      "AÇIK ARTIRMAYI KAZANDIN!",
      `${auction.gladiator.name}, ${playerBid} Denarius karşılığında Ludus'una katıldı.\n\n⚡ ${MARKET_ACTION_COST} aksiyon puanı harcandı.`,
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
          <View style={styles.resources}>
            <Text style={styles.actionPoints}>
              ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
            </Text>

            <Text style={styles.money}>🪙 {ludus.denarius} D</Text>
          </View>

          <View style={styles.headerButtons}>
            <Pressable
              style={styles.specialButton}
              onPress={() => router.push("/special-gladiators")}>
              <Text style={styles.specialButtonText}>★ ÖZEL GLADYATÖRLER</Text>
            </Pressable>

            <Pressable onPress={() => router.back()}>
              <Text style={styles.backText}>← HARİTAYA DÖN</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>BUGÜNKÜ AÇIK ARTIRMALAR</Text>

        <View style={styles.refreshArea}>
          <Text style={styles.refreshText}>Satın alma: ⚡ 1 AP</Text>

          <Pressable
            style={[
              styles.refreshButton,
              ludus.actionPoints < MARKET_REFRESH_COST &&
                styles.disabledRefreshButton,
            ]}
            onPress={handleRefreshMarket}>
            <Text
              style={[
                styles.refreshButtonText,
                ludus.actionPoints < MARKET_REFRESH_COST &&
                  styles.disabledRefreshButtonText,
              ]}>
              ↻ YENİLE · 1 AP
            </Text>
          </Pressable>
        </View>
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
              Yeni savaşçılar için pazarı yenileyebilirsin.
            </Text>
          </View>
        }
        renderItem={({ item: auction }) => {
          const gladiator = auction.gladiator;

          const nextBid = auction.currentBid + auction.minNextBid;

          const bidderName = getBidderName(auction);

          const noActionPoints = ludus.actionPoints < MARKET_ACTION_COST;

          return (
            <View
              style={[
                styles.card,
                {
                  width: cardWidth,
                  height: cardHeight,
                },
              ]}>
              <GladiatorPortrait style={styles.portrait} />

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
                  style={[
                    styles.bidButton,
                    noActionPoints && styles.disabledBidButton,
                  ]}
                  onPress={() => handleBid(auction)}>
                  <Text
                    style={[
                      styles.bidButtonText,
                      noActionPoints && styles.disabledBidButtonText,
                    ]}>
                    {noActionPoints ? "YETERSİZ AP" : `TEKLİF ${nextBid} D`}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
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

  resources: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  specialButton: {
    height: 25,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 4,
    backgroundColor: "#17140F",
    alignItems: "center",
    justifyContent: "center",
  },

  specialButtonText: {
    color: "#DDB936",
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  actionPoints: {
    color: "#DDB936",
    fontSize: 11,
    fontWeight: "bold",
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
    minHeight: 36,
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

  refreshArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  refreshText: {
    color: "#77716A",
    fontSize: 8,
  },

  refreshButton: {
    height: 27,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#80632F",
    borderRadius: 4,
    backgroundColor: "#17140F",
    alignItems: "center",
    justifyContent: "center",
  },

  refreshButtonText: {
    color: "#DDB936",
    fontSize: 8,
    fontWeight: "bold",
  },

  disabledRefreshButton: {
    borderColor: "#3F392E",
    backgroundColor: "#211E19",
  },

  disabledRefreshButtonText: {
    color: "#6E675A",
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
    height: 60,
    backgroundColor: "#211D16",
    borderRadius: 5,
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
    fontSize: 7,
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

  disabledBidButton: {
    backgroundColor: "#29251D",
    borderWidth: 1,
    borderColor: "#4B4435",
  },

  disabledBidButtonText: {
    color: "#716B5E",
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
