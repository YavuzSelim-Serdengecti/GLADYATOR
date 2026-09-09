import {
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  useFonts,
} from "@expo-google-fonts/cinzel";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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
import { useGameStore } from "../src/store/gameStore";

const BUILDING_ACTION_COST = 1;

export default function LudusBuildingsScreen() {
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const ludus = useGameStore((state) => state.playerLudus);
  const buildings = useGameStore((state) => state.ludusBuildings);
  const workers = useGameStore((state) => state.ludusWorkers);

  const buildLudusBuilding = useGameStore((state) => state.buildLudusBuilding);

  const upgradeLudusBuilding = useGameStore(
    (state) => state.upgradeLudusBuilding,
  );

  const spendActionPoints = useGameStore((state) => state.spendActionPoints);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  const safeLeft = Math.max(24, insets.left + 12);
  const safeRight = Math.max(24, insets.right + 12);

  const sortedBuildings = useMemo(() => {
    if (!ludus) return buildings;

    return [...buildings].sort((a, b) => {
      const aUnlocked = ludus.level >= a.requiredLudusLevel;

      const bUnlocked = ludus.level >= b.requiredLudusLevel;

      if (aUnlocked !== bUnlocked) {
        return aUnlocked ? -1 : 1;
      }

      if (a.isBuilt !== b.isBuilt) {
        return a.isBuilt ? -1 : 1;
      }

      return a.requiredLudusLevel - b.requiredLudusLevel;
    });
  }, [buildings, ludus]);

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

        <Pressable
          style={styles.menuButton}
          onPress={() => router.replace("/")}>
          <Text style={styles.menuButtonText}>ANA MENÜ</Text>
        </Pressable>
      </View>
    );
  }

  const builtCount = buildings.filter((building) => building.isBuilt).length;

  const availableCount = buildings.filter(
    (building) => ludus.level >= building.requiredLudusLevel,
  ).length;

  const builders = workers.find((worker) => worker.role === "builder");
  const builderCount = builders?.count ?? 0;
  const builderEfficiency = builders?.efficiency ?? 0;
  const builderDailyProgress =
    1 + builderCount * Math.max(0, builderEfficiency) * 0.25;

  const handleBuild = (
    buildingId: string,
    buildingName: string,
    buildCost: number,
  ) => {
    if (ludus.actionPoints < BUILDING_ACTION_COST) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `Bina inşa etmek için ${BUILDING_ACTION_COST} aksiyon puanı gerekiyor.\n\nKalan aksiyon: ${ludus.actionPoints}/${ludus.maxActionPoints}`,
      );

      return;
    }

    const success = buildLudusBuilding(buildingId);

    if (!success) {
      showModal(
        "İNŞAAT BAŞARISIZ",
        "Ludus seviyen yetmiyor, paran yetersiz veya bu bina zaten yapılmış olabilir.",
      );

      return;
    }

    spendActionPoints(BUILDING_ACTION_COST);

    showModal(
      "İNŞAAT BAŞLADI",
      `${buildingName} için inşaat başladı. ${buildCost} Denarius ödendi.\n\nİnşaat gün sonlarında ilerleyecek. ${BUILDING_ACTION_COST} aksiyon puanı harcandı.`,
    );
  };

  const handleUpgrade = (
    buildingId: string,
    buildingName: string,
    currentLevel: number,
    upgradeCost: number,
  ) => {
    if (ludus.actionPoints < BUILDING_ACTION_COST) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `Bina geliştirmek için ${BUILDING_ACTION_COST} aksiyon puanı gerekiyor.\n\nKalan aksiyon: ${ludus.actionPoints}/${ludus.maxActionPoints}`,
      );

      return;
    }

    const finalCost = upgradeCost * currentLevel;

    const success = upgradeLudusBuilding(buildingId);

    if (!success) {
      showModal(
        "GELİŞTİRME BAŞARISIZ",
        "Paran yetersiz olabilir veya bina maksimum seviyeye ulaşmış olabilir.",
      );

      return;
    }

    spendActionPoints(BUILDING_ACTION_COST);

    showModal(
      "GELİŞTİRME BAŞLADI",
      `${buildingName} Lv. ${currentLevel + 1} geliştirmesi başladı. ${finalCost} Denarius ödendi.\n\nGeliştirme gün sonlarında ilerleyecek. ${BUILDING_ACTION_COST} aksiyon puanı harcandı.`,
    );
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

          <Text style={styles.title}>BİNALAR</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>İNŞA EDİLEN</Text>

            <Text style={styles.contextValue}>
              {builtCount}/{buildings.length}
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>AÇIK</Text>

            <Text style={styles.contextValue}>{availableCount}</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>İNŞAATÇI</Text>

            <Text style={styles.contextValue}>{builderCount}</Text>
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
        <Text style={styles.pageEyebrow}>LUDUS GELİŞİMİ</Text>

        <Text style={styles.pageTitle}>BİNALAR VE GELİŞTİRMELER</Text>
      </View>

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
        {sortedBuildings.map((building) => {
          const levelLocked = ludus.level < building.requiredLudusLevel;

          const buildMoneyLocked = ludus.denarius < building.buildCost;

          const upgradePrice =
            building.upgradeCost * Math.max(1, building.level);

          const upgradeMoneyLocked = ludus.denarius < upgradePrice;

          const maxLevelReached = building.level >= building.maxLevel;

          const noActionPoints = ludus.actionPoints < BUILDING_ACTION_COST;

          const underConstruction = building.constructionType !== null;

          const estimatedDaysRemaining = underConstruction
            ? Math.max(
                1,
                Math.ceil(
                  building.constructionDaysRemaining / builderDailyProgress,
                ),
              )
            : 0;

          return (
            <View
              key={building.id}
              style={[styles.card, levelLocked && styles.lockedCard]}>
              <View style={styles.cardTop}>
                <Text style={styles.category}>
                  {getBuildingCategory(building.type)}
                </Text>

                {underConstruction ? (
                  <View style={styles.constructionBadge}>
                    <Text style={styles.constructionBadgeText}>İNŞAAT</Text>
                  </View>
                ) : levelLocked ? (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockBadgeText}>
                      LV. {building.requiredLudusLevel}
                    </Text>
                  </View>
                ) : building.isBuilt ? (
                  <View style={styles.openBadge}>
                    <Text style={styles.openBadgeText}>
                      LV. {building.level}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.openBadge}>
                    <Text style={styles.openBadgeText}>AÇIK</Text>
                  </View>
                )}
              </View>

              <View style={styles.iconArea}>
                <Text style={[styles.icon, levelLocked && styles.lockedIcon]}>
                  {levelLocked ? "◆" : getBuildingIcon(building.type)}
                </Text>
              </View>

              <Text
                style={[styles.buildingName, levelLocked && styles.lockedName]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {building.name.toUpperCase()}
              </Text>

              <Text style={styles.description} numberOfLines={2}>
                {building.description}
              </Text>

              <View style={styles.divider} />

              {levelLocked ? (
                <View style={styles.lockedContent}>
                  <Text style={styles.lockedTitle}>HENÜZ AÇILMADI</Text>

                  <Text style={styles.lockedDescription}>
                    Ludus Lv. {building.requiredLudusLevel} seviyesinde açılır.
                  </Text>

                  <Text style={styles.currentLevel}>
                    MEVCUT · LV. {ludus.level}
                  </Text>
                </View>
              ) : (
                <View style={styles.infoArea}>
                  <Info
                    label="Durum"
                    value={
                      underConstruction
                        ? building.constructionType === "build"
                          ? "İnşa Ediliyor"
                          : "Geliştiriliyor"
                        : building.isBuilt
                          ? "İnşa Edildi"
                          : "İnşa Edilmedi"
                    }
                  />

                  {underConstruction && (
                    <Info
                      label="Kalan"
                      value={`~${estimatedDaysRemaining} gün`}
                    />
                  )}

                  <Info
                    label="Seviye"
                    value={
                      building.isBuilt
                        ? `Lv. ${building.level}/${building.maxLevel}`
                        : `0/${building.maxLevel}`
                    }
                  />

                  {!building.isBuilt && !underConstruction && (
                    <Info label="İnşa" value={`${building.buildCost} D`} />
                  )}

                  {building.isBuilt &&
                    !maxLevelReached &&
                    !underConstruction && (
                      <Info label="Geliştirme" value={`${upgradePrice} D`} />
                    )}

                  <Info label="Aksiyon" value={`${BUILDING_ACTION_COST} AP`} />
                </View>
              )}

              <View style={styles.bottomArea}>
                {underConstruction ? (
                  <View style={styles.constructionButton}>
                    <Text style={styles.constructionButtonText}>
                      {building.constructionType === "build"
                        ? `İNŞA EDİLİYOR · ~${estimatedDaysRemaining} GÜN`
                        : `LV.${building.constructionTargetLevel ?? building.level + 1} · ~${estimatedDaysRemaining} GÜN`}
                    </Text>
                  </View>
                ) : levelLocked ? (
                  <View style={styles.lockedButton}>
                    <Text style={styles.lockedButtonText}>
                      LV. {building.requiredLudusLevel} GEREKLİ
                    </Text>
                  </View>
                ) : !building.isBuilt ? (
                  <Pressable
                    disabled={buildMoneyLocked || noActionPoints}
                    style={[
                      styles.buildButton,
                      (buildMoneyLocked || noActionPoints) &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      handleBuild(
                        building.id,
                        building.name,
                        building.buildCost,
                      )
                    }>
                    <Text
                      style={[
                        styles.buildButtonText,
                        (buildMoneyLocked || noActionPoints) &&
                          styles.disabledButtonText,
                      ]}>
                      {noActionPoints
                        ? "YETERSİZ AP"
                        : buildMoneyLocked
                          ? "YETERSİZ DENARIUS"
                          : `İNŞA ET · ${building.buildCost} D · 1 AP`}
                    </Text>
                  </Pressable>
                ) : maxLevelReached ? (
                  <View style={styles.maxButton}>
                    <Text style={styles.maxButtonText}>MAKSİMUM SEVİYE</Text>
                  </View>
                ) : (
                  <Pressable
                    disabled={upgradeMoneyLocked || noActionPoints}
                    style={[
                      styles.upgradeButton,
                      (upgradeMoneyLocked || noActionPoints) &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      handleUpgrade(
                        building.id,
                        building.name,
                        building.level,
                        building.upgradeCost,
                      )
                    }>
                    <Text
                      style={[
                        styles.upgradeButtonText,
                        (upgradeMoneyLocked || noActionPoints) &&
                          styles.disabledButtonText,
                      ]}>
                      {noActionPoints
                        ? "YETERSİZ AP"
                        : upgradeMoneyLocked
                          ? "YETERSİZ DENARIUS"
                          : `LV.${building.level + 1} · ${upgradePrice} D · 1 AP`}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
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

function getBuildingCategory(type: string) {
  if (type === "training_ground") {
    return "EĞİTİM";
  }

  if (type === "infirmary") {
    return "TEDAVİ";
  }

  if (type === "armory") {
    return "EKİPMAN";
  }

  if (type === "barracks") {
    return "GÜVENLİK";
  }

  if (type === "slave_quarters") {
    return "YAŞAM";
  }

  return "LUDUS";
}

function getBuildingIcon(type: string) {
  if (type === "training_ground") {
    return "⚔";
  }

  if (type === "infirmary") {
    return "✚";
  }

  if (type === "armory") {
    return "◆";
  }

  if (type === "barracks") {
    return "◈";
  }

  if (type === "slave_quarters") {
    return "⌂";
  }

  return "◆";
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
    marginBottom: 14,
  },

  menuButton: {
    borderWidth: 1,
    borderColor: "#725D30",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  menuButtonText: {
    color: "#C1A14E",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 8,
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
    minWidth: 55,
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
    justifyContent: "center",
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

  lockedCard: {
    backgroundColor: "rgba(16,14,11,0.96)",
    borderColor: "#302C25",
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

  lockBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#57482B",
    borderRadius: 3,
  },

  lockBadgeText: {
    color: "#897345",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  openBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#6D5B32",
    borderRadius: 3,
  },

  openBadgeText: {
    color: "#C4A452",
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

  lockedIcon: {
    color: "#514B41",
  },

  buildingName: {
    height: 18,
    color: "#E5D9B9",
    fontFamily: "Cinzel_700Bold",
    fontSize: 10,
    textAlign: "center",
    letterSpacing: 0.4,
  },

  lockedName: {
    color: "#686259",
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

  infoArea: {
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

  infoValue: {
    color: "#D9CFB5",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  lockedContent: {
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },

  lockedTitle: {
    color: "#8C7950",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  lockedDescription: {
    color: "#6F695F",
    fontSize: 7,
    marginTop: 4,
    textAlign: "center",
  },

  currentLevel: {
    color: "#625B50",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
    marginTop: 5,
  },

  bottomArea: {
    marginTop: "auto",
  },

  buildButton: {
    height: 29,
    backgroundColor: "#D4AF37",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  buildButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  upgradeButton: {
    height: 29,
    borderWidth: 1,
    borderColor: "#D4AF37",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  upgradeButtonText: {
    color: "#D4AF37",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  disabledButton: {
    backgroundColor: "#292620",
    borderColor: "#3A352D",
  },

  disabledButtonText: {
    color: "#69635A",
  },

  lockedButton: {
    height: 29,
    borderWidth: 1,
    borderColor: "#373229",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  lockedButtonText: {
    color: "#655E53",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  constructionBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#8A6A2D",
    borderRadius: 3,
  },

  constructionBadgeText: {
    color: "#D4AF37",
    fontFamily: "Cinzel_600SemiBold",
    fontSize: 7,
  },

  constructionButton: {
    height: 29,
    borderWidth: 1,
    borderColor: "#8A6A2D",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  constructionButtonText: {
    color: "#C9A94C",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  maxButton: {
    height: 29,
    borderWidth: 1,
    borderColor: "#405035",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  maxButtonText: {
    color: "#8FAF72",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },
});
