import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameModal from "../src/components/GameModal";
import { initialEquipment } from "../src/data/equipment";
import { useGameStore } from "../src/store/gameStore";

const EQUIPMENT_ACTION_COST = 1;

type InventoryTab = "shop" | "inventory";

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<InventoryTab>("shop");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const ludus = useGameStore((state) => state.playerLudus);
  const gladiators = useGameStore((state) => state.gladiators);
  const inventory = useGameStore((state) => state.inventory);
  const ludusBuildings = useGameStore((state) => state.ludusBuildings);

  const buyEquipment = useGameStore((state) => state.buyEquipment);
  const equipItem = useGameStore((state) => state.equipItem);
  const unequipItem = useGameStore((state) => state.unequipItem);

  const spendActionPoints = useGameStore((state) => state.spendActionPoints);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  if (!ludus) {
    return (
      <View
        style={[
          styles.center,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <Text style={styles.error}>LUDUS BULUNAMADI</Text>
      </View>
    );
  }

  const armory = ludusBuildings.find((building) => building.type === "armory");

  const shopUnlocked =
    !!armory && armory.isBuilt && armory.constructionType === null;

  const playerGladiators = gladiators.filter(
    (gladiator) => gladiator.ludusId === ludus.id,
  );

  const equippedCount = inventory.filter(
    (item) =>
      item.equippedByGladiatorId !== null &&
      item.equippedByGladiatorId !== undefined,
  ).length;

  const handleBuy = (itemId: string, itemName: string) => {
    if (!shopUnlocked) {
      showModal(
        "MAĞAZA KİLİTLİ",
        "Ekipman satın almak için Silahhane'yi inşa etmelisin.",
      );

      return;
    }

    if (ludus.actionPoints < EQUIPMENT_ACTION_COST) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `Ekipman satın almak için ${EQUIPMENT_ACTION_COST} aksiyon puanı gerekiyor.\n\nKalan aksiyon: ${ludus.actionPoints}/${ludus.maxActionPoints}`,
      );

      return;
    }

    const success = buyEquipment(itemId);

    if (!success) {
      showModal(
        "SATIN ALMA BAŞARISIZ",
        "Yeterli Denarius'un olmayabilir veya Silahhane kullanılamıyor olabilir.",
      );

      return;
    }

    spendActionPoints(EQUIPMENT_ACTION_COST);

    showModal(
      "SATIN ALINDI",
      `${itemName} envanterine eklendi.\n\n${EQUIPMENT_ACTION_COST} aksiyon puanı harcandı.`,
    );
  };

  const handleEquip = (itemId: string, gladiatorId: string) => {
    const success = equipItem(itemId, gladiatorId);

    if (!success) {
      showModal(
        "EKİPMAN TAKILAMADI",
        "Bu ekipman başka bir gladyatörde takılı olabilir.",
      );

      return;
    }

    showModal("EKİPMAN TAKILDI", "Ekipman gladyatöre başarıyla takıldı.");
  };

  const handleUnequip = (itemId: string) => {
    unequipItem(itemId);

    showModal("EKİPMAN ÇIKARILDI", "Ekipman gladyatörden çıkarıldı.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <View
        style={[
          styles.topBar,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View style={styles.identity}>
          <Text style={styles.eyebrow}>LUDUS YÖNETİMİ</Text>
          <Text style={styles.title}>ENVANTER</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>EKİPMAN</Text>
            <Text style={styles.contextValue}>{inventory.length}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>TAKILI</Text>
            <Text style={styles.contextValue}>{equippedCount}</Text>
          </View>
        </View>

        <View style={styles.resources}>
          <Text style={styles.resource}>LV. {ludus.level}</Text>

          <Text style={styles.resource}>
            ⚡ {ludus.actionPoints}/{ludus.maxActionPoints}
          </Text>

          <Text style={styles.resource}>🪙 {ludus.denarius}</Text>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← LUDUS</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.pageHeader,
          {
            paddingLeft: safeLeft,
            paddingRight: safeRight,
          },
        ]}>
        <View>
          <Text style={styles.pageEyebrow}>SİLAH VE ZIRH</Text>

          <Text style={styles.pageTitle}>EKİPMAN YÖNETİMİ</Text>
        </View>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === "shop" && styles.activeTab]}
            onPress={() => setActiveTab("shop")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "shop" && styles.activeTabText,
              ]}>
              {shopUnlocked ? "MAĞAZA" : "MAĞAZA · KİLİTLİ"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === "inventory" && styles.activeTab]}
            onPress={() => setActiveTab("inventory")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "inventory" && styles.activeTabText,
              ]}>
              ENVANTERİM · {inventory.length}
            </Text>
          </Pressable>
        </View>
      </View>

      {activeTab === "shop" && !shopUnlocked && (
        <View
          style={[
            styles.lockedArea,
            {
              paddingLeft: safeLeft,
              paddingRight: safeRight,
            },
          ]}>
          <Text style={styles.lockedSymbol}>⚒</Text>

          <Text style={styles.lockedTitle}>EKİPMAN MAĞAZASI KİLİTLİ</Text>

          <Text style={styles.lockedText}>
            Silah ve zırh satın alabilmek için Silahhane'yi inşa et.
          </Text>

          {armory?.constructionType !== null &&
          armory?.constructionType !== undefined ? (
            <Text style={styles.constructionText}>
              SİLAHHANE İNŞAATTA · {Math.ceil(armory.constructionDaysRemaining)}{" "}
              GÜN
            </Text>
          ) : (
            <Pressable
              style={styles.lockedButton}
              onPress={() => router.push("/ludus-buildings")}>
              <Text style={styles.lockedButtonText}>BİNALARA GİT</Text>
            </Pressable>
          )}
        </View>
      )}

      {activeTab === "shop" && shopUnlocked && (
        <ScrollView
          horizontal
          bounces={false}
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={230}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={[
            styles.list,
            {
              paddingLeft: safeLeft,
              paddingRight: safeRight,
            },
          ]}>
          {initialEquipment.map((item) => {
            const noActionPoints = ludus.actionPoints < EQUIPMENT_ACTION_COST;

            const noMoney = ludus.denarius < item.price;

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.category}>
                    {item.type === "weapon" ? "SİLAH" : "ZIRH"}
                  </Text>

                  <View
                    style={[
                      styles.rarityBadge,
                      item.rarity === "legendary" && styles.legendaryBadge,
                    ]}>
                    <Text style={styles.rarityText}>
                      {translateRarity(item.rarity)}
                    </Text>
                  </View>
                </View>

                <View style={styles.iconArea}>
                  <Text style={styles.icon}>{getEquipmentIcon(item.type)}</Text>
                </View>

                <Text
                  style={styles.itemName}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {item.name.toUpperCase()}
                </Text>

                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.divider} />

                <View style={styles.bonusArea}>
                  {Object.entries(item.bonuses).map(([key, value]) => (
                    <View key={key} style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{translateStat(key)}</Text>

                      <Text
                        style={[
                          styles.bonusValue,
                          typeof value === "number" &&
                            value < 0 &&
                            styles.negativeValue,
                        ]}>
                        {typeof value === "number" && value > 0
                          ? `+${value}`
                          : value}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.bottomArea}>
                  <Pressable
                    disabled={noActionPoints || noMoney}
                    style={[
                      styles.buyButton,
                      (noActionPoints || noMoney) && styles.disabledButton,
                    ]}
                    onPress={() => handleBuy(item.id, item.name)}>
                    <Text
                      style={[
                        styles.buyButtonText,
                        (noActionPoints || noMoney) &&
                          styles.disabledButtonText,
                      ]}>
                      {noActionPoints
                        ? "YETERSİZ AP"
                        : noMoney
                          ? "YETERSİZ DENARIUS"
                          : `SATIN AL · ${item.price} D · 1 AP`}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {activeTab === "inventory" && (
        <>
          {inventory.length === 0 ? (
            <View
              style={[
                styles.emptyArea,
                {
                  paddingLeft: safeLeft,
                  paddingRight: safeRight,
                },
              ]}>
              <Text style={styles.emptySymbol}>◇</Text>

              <Text style={styles.emptyTitle}>ENVANTER BOŞ</Text>

              <Text style={styles.emptyText}>
                Henüz sahip olduğun bir ekipman yok.
              </Text>

              {shopUnlocked && (
                <Pressable
                  style={styles.emptyButton}
                  onPress={() => setActiveTab("shop")}>
                  <Text style={styles.emptyButtonText}>MAĞAZAYA GİT</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <ScrollView
              horizontal
              bounces={false}
              alwaysBounceHorizontal={false}
              showsHorizontalScrollIndicator={false}
              snapToInterval={230}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum
              contentContainerStyle={[
                styles.list,
                {
                  paddingLeft: safeLeft,
                  paddingRight: safeRight,
                },
              ]}>
              {inventory.map((item, index) => {
                const equippedGladiator = playerGladiators.find(
                  (gladiator) => gladiator.id === item.equippedByGladiatorId,
                );

                return (
                  <View key={`${item.id}-${index}`} style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.category}>
                        {item.type === "weapon" ? "SİLAH" : "ZIRH"}
                      </Text>

                      <View style={styles.rarityBadge}>
                        <Text style={styles.rarityText}>
                          {equippedGladiator
                            ? "TAKILI"
                            : translateRarity(item.rarity)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.iconArea}>
                      <Text style={styles.icon}>
                        {getEquipmentIcon(item.type)}
                      </Text>
                    </View>

                    <Text
                      style={styles.itemName}
                      numberOfLines={1}
                      adjustsFontSizeToFit>
                      {item.name.toUpperCase()}
                    </Text>

                    <Text style={styles.description} numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View style={styles.divider} />

                    {equippedGladiator ? (
                      <View style={styles.equippedArea}>
                        <Text style={styles.equippedLabel}>
                          TAKILI GLADYATÖR
                        </Text>

                        <Text style={styles.equippedName} numberOfLines={1}>
                          {equippedGladiator.name}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.gladiatorArea}>
                        <Text style={styles.chooseTitle}>GLADYATÖRE TAK</Text>

                        {playerGladiators.length > 0 ? (
                          <ScrollView
                            nestedScrollEnabled
                            showsVerticalScrollIndicator
                            contentContainerStyle={styles.gladiatorList}>
                            {playerGladiators.map((gladiator) => (
                              <Pressable
                                key={gladiator.id}
                                style={styles.gladiatorButton}
                                onPress={() =>
                                  handleEquip(item.id, gladiator.id)
                                }>
                                <Text
                                  style={styles.gladiatorButtonText}
                                  numberOfLines={1}>
                                  {gladiator.name}
                                </Text>
                              </Pressable>
                            ))}
                          </ScrollView>
                        ) : (
                          <Text style={styles.noGladiatorText}>
                            Gladyatör yok.
                          </Text>
                        )}
                      </View>
                    )}

                    <View style={styles.bottomArea}>
                      {equippedGladiator && (
                        <Pressable
                          style={styles.unequipButton}
                          onPress={() => handleUnequip(item.id)}>
                          <Text style={styles.unequipText}>EKİPMANI ÇIKAR</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </>
      )}

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

function translateStat(stat: string) {
  const names: Record<string, string> = {
    strength: "Güç",
    endurance: "Dayanıklılık",
    agility: "Çeviklik",
    attack: "Saldırı",
    defense: "Savunma",
    courage: "Cesaret",
  };

  return names[stat] ?? stat;
}

function translateRarity(rarity: string) {
  const names: Record<string, string> = {
    common: "YAYGIN",
    uncommon: "NADİR",
    rare: "ENDER",
    legendary: "EFSANEVİ",
  };

  return names[rarity] ?? rarity;
}

function getEquipmentIcon(type: string) {
  if (type === "weapon") {
    return "⚔";
  }

  if (type === "armor") {
    return "◆";
  }

  return "◇";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0906",
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#15110C",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B0906",
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    backgroundColor: "#0B0906",
    alignItems: "center",
    justifyContent: "center",
  },

  error: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 16,
  },

  topBar: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#100D08",
    borderBottomWidth: 1,
    borderBottomColor: "#332A1A",
  },

  identity: {
    width: 190,
  },

  eyebrow: {
    color: "#75673E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1.3,
  },

  title: {
    color: "#DDB936",
    fontFamily: "Cinzel_700Bold",
    fontSize: 14,
    letterSpacing: 1.4,
    marginTop: 1,
  },

  contextArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  contextItem: {
    minWidth: 48,
    alignItems: "center",
  },

  contextLabel: {
    color: "#6E6658",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  contextValue: {
    color: "#D8CFB8",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    marginTop: 1,
  },

  contextDivider: {
    width: 1,
    height: 23,
    backgroundColor: "#332C1D",
  },

  resources: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },

  resource: {
    color: "#D9CFB5",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
  },

  backButton: {
    height: 29,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#C1A14E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  pageHeader: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pageEyebrow: {
    color: "#806D3C",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1.7,
  },

  pageTitle: {
    color: "#D5B454",
    fontFamily: "Cinzel_700Bold",
    fontSize: 15,
    letterSpacing: 1.1,
    marginTop: 2,
  },

  tabs: {
    flexDirection: "row",
    gap: 7,
  },

  tab: {
    height: 28,
    minWidth: 85,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#423823",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    borderColor: "#9B7A2F",
    backgroundColor: "rgba(155,122,47,0.12)",
  },

  tabText: {
    color: "#686157",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  activeTabText: {
    color: "#D4AF37",
  },

  lockedArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

  lockedSymbol: {
    color: "#806D3C",
    fontSize: 28,
  },

  lockedTitle: {
    color: "#D4AF37",
    fontFamily: "Cinzel_700Bold",
    fontSize: 13,
    marginTop: 7,
    letterSpacing: 0.8,
  },

  lockedText: {
    color: "#8A8173",
    fontSize: 8,
    marginTop: 6,
    textAlign: "center",
  },

  constructionText: {
    color: "#C2A653",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
    marginTop: 14,
  },

  lockedButton: {
    height: 30,
    marginTop: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#80682F",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  lockedButtonText: {
    color: "#D1AD46",
    fontFamily: "Cinzel_700Bold",
    fontSize: 8,
  },

  list: {
    paddingTop: 4,
    paddingBottom: 14,
    gap: 10,
    alignItems: "flex-start",
  },

  card: {
    width: 220,
    height: 230,
    padding: 11,
    backgroundColor: "rgba(23,19,13,0.96)",
    borderWidth: 1,
    borderColor: "#453A25",
    borderRadius: 4,
  },

  cardTop: {
    height: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  category: {
    color: "#746542",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    letterSpacing: 1,
  },

  rarityBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#57482B",
    borderRadius: 3,
  },

  legendaryBadge: {
    borderColor: "#A88431",
  },

  rarityText: {
    color: "#A38A4B",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  iconArea: {
    height: 31,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    color: "#C5A248",
    fontSize: 19,
  },

  itemName: {
    height: 18,
    color: "#E5D9B9",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.4,
  },

  description: {
    height: 22,
    color: "#81796D",
    fontSize: 7,
    lineHeight: 10,
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 5,
  },

  bonusArea: {
    height: 62,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1,
  },

  infoLabel: {
    color: "#827A6C",
    fontSize: 7,
  },

  bonusValue: {
    color: "#8FAF72",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  negativeValue: {
    color: "#A16B5B",
  },

  bottomArea: {
    marginTop: "auto",
  },

  buyButton: {
    height: 29,
    backgroundColor: "#D4AF37",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  buyButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  disabledButton: {
    backgroundColor: "#292620",
    borderWidth: 1,
    borderColor: "#3A352D",
  },

  disabledButtonText: {
    color: "#69635A",
  },

  equippedArea: {
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },

  equippedLabel: {
    color: "#746542",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  equippedName: {
    color: "#D9CFB5",
    fontFamily: "Cinzel_700Bold",
    fontSize: 9,
    marginTop: 5,
  },

  gladiatorArea: {
    height: 62,
  },

  chooseTitle: {
    color: "#746542",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    textAlign: "center",
    marginBottom: 4,
  },

  gladiatorList: {
    paddingBottom: 2,
  },

  gladiatorButton: {
    minHeight: 20,
    borderWidth: 1,
    borderColor: "#3C3423",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
    paddingHorizontal: 5,
  },

  gladiatorButtonText: {
    color: "#CFC4A8",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  noGladiatorText: {
    color: "#625C52",
    fontSize: 7,
    textAlign: "center",
    marginTop: 8,
  },

  unequipButton: {
    height: 29,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  unequipText: {
    color: "#C5A248",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  emptyArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

  emptySymbol: {
    color: "#65573A",
    fontSize: 28,
  },

  emptyTitle: {
    color: "#C6A54D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 11,
    marginTop: 6,
  },

  emptyText: {
    color: "#716B61",
    fontSize: 8,
    marginTop: 5,
  },

  emptyButton: {
    height: 29,
    marginTop: 13,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#725D30",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonText: {
    color: "#C5A248",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },
});
