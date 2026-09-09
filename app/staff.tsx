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

const STAFF_ACTION_COST = 1;
const WORKER_ACTION_COST = 1;
const STAFF_HIRING_COST = 300;

type ListItem =
  | {
      kind: "staff";
      id: string;
      requiredLevel: number;
      hired: boolean;
      data: any;
    }
  | {
      kind: "worker";
      id: string;
      requiredLevel: number;
      hired: boolean;
      data: any;
    };

export default function StaffScreen() {
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const ludus = useGameStore((state) => state.playerLudus);
  const ludusStaff = useGameStore((state) => state.ludusStaff);
  const ludusWorkers = useGameStore((state) => state.ludusWorkers);

  const hireStaff = useGameStore((state) => state.hireStaff);
  const hireWorker = useGameStore((state) => state.hireWorker);

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

  const orderedItems = useMemo<ListItem[]>(() => {
    if (!ludus) return [];

    const items: ListItem[] = [
      ...ludusStaff.map((staff) => ({
        kind: "staff" as const,
        id: staff.id,
        requiredLevel: staff.requiredLudusLevel,
        hired: staff.hired,
        data: staff,
      })),

      ...ludusWorkers.map((worker) => ({
        kind: "worker" as const,
        id: worker.id,
        requiredLevel: worker.requiredLudusLevel,
        hired: worker.count > 0,
        data: worker,
      })),
    ];

    return items.sort((a, b) => {
      const aUnlocked = ludus.level >= a.requiredLevel;
      const bUnlocked = ludus.level >= b.requiredLevel;

      if (aUnlocked !== bUnlocked) {
        return aUnlocked ? -1 : 1;
      }

      if (aUnlocked && bUnlocked && a.hired !== b.hired) {
        return a.hired ? -1 : 1;
      }

      if (a.requiredLevel !== b.requiredLevel) {
        return a.requiredLevel - b.requiredLevel;
      }

      if (a.kind !== b.kind) {
        return a.kind === "staff" ? -1 : 1;
      }

      return 0;
    });
  }, [ludus, ludusStaff, ludusWorkers]);

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

  const hiredStaffCount = ludusStaff.filter((staff) => staff.hired).length;

  const totalWorkers = ludusWorkers.reduce(
    (total, worker) => total + worker.count,
    0,
  );

  const handleHireStaff = (
    staffId: string,
    staffName: string,
    requiredLevel: number,
  ) => {
    if (ludus.level < requiredLevel) {
      showModal(
        "PERSONEL KİLİTLİ",
        `${staffName}, Ludus Lv. ${requiredLevel} seviyesinde açılır.`,
      );
      return;
    }

    if (ludus.actionPoints < STAFF_ACTION_COST) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `Personel işe almak için ${STAFF_ACTION_COST} aksiyon puanı gerekiyor.`,
      );
      return;
    }

    const success = hireStaff(staffId);

    if (!success) {
      showModal(
        "İŞE ALINAMADI",
        "Yeterli Denarius'un olmayabilir veya bu personel zaten işe alınmış olabilir.",
      );
      return;
    }

    spendActionPoints(STAFF_ACTION_COST);

    showModal(
      "PERSONEL İŞE ALINDI",
      `${staffName} artık Ludus için çalışıyor.`,
    );
  };

  const handleHireWorker = (
    workerId: string,
    workerName: string,
    hiringCost: number,
    requiredLevel: number,
  ) => {
    if (ludus.level < requiredLevel) {
      showModal(
        "İŞÇİ GRUBU KİLİTLİ",
        `${workerName}, Ludus Lv. ${requiredLevel} seviyesinde açılır.`,
      );
      return;
    }

    if (ludus.actionPoints < WORKER_ACTION_COST) {
      showModal(
        "YETERSİZ AKSİYON PUANI",
        `İşçi işe almak için ${WORKER_ACTION_COST} aksiyon puanı gerekiyor.`,
      );
      return;
    }

    const success = hireWorker(workerId, 1);

    if (!success) {
      showModal(
        "İŞÇİ ALINAMADI",
        "Paran yetersiz olabilir veya maksimum işçi sayısına ulaşmış olabilirsin.",
      );
      return;
    }

    spendActionPoints(WORKER_ACTION_COST);

    showModal(
      "İŞÇİ İŞE ALINDI",
      `${workerName} grubuna 1 yeni işçi eklendi. ${hiringCost} Denarius harcandı.`,
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
          <Text style={styles.title}>PERSONEL</Text>
        </View>

        <View style={styles.contextArea}>
          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>PERSONEL</Text>
            <Text style={styles.contextValue}>
              {hiredStaffCount}/{ludusStaff.length}
            </Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.contextItem}>
            <Text style={styles.contextLabel}>İŞÇİ</Text>
            <Text style={styles.contextValue}>{totalWorkers}</Text>
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
        <Text style={styles.pageEyebrow}>LUDUS PERSONELİ</Text>
        <Text style={styles.pageTitle}>PERSONEL VE İŞ GÜCÜ</Text>
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
        {orderedItems.map((item) => {
          if (item.kind === "staff") {
            const staff = item.data;

            const locked = ludus.level < staff.requiredLudusLevel;

            const cantAfford = ludus.denarius < STAFF_HIRING_COST;

            const noAP = ludus.actionPoints < STAFF_ACTION_COST;

            return (
              <View
                key={`staff-${staff.id}`}
                style={[styles.card, locked && styles.lockedCard]}>
                <View style={styles.cardTop}>
                  <Text style={styles.category}>
                    {getStaffRoleName(staff.role)}
                  </Text>

                  <StatusBadge
                    locked={locked}
                    requiredLevel={staff.requiredLudusLevel}
                    active={staff.hired}
                    activeText="AKTİF"
                  />
                </View>

                <View style={styles.iconArea}>
                  <Text style={[styles.icon, locked && styles.lockedIcon]}>
                    {locked ? "◆" : getStaffIcon(staff.role)}
                  </Text>
                </View>

                <Text
                  style={[styles.name, locked && styles.lockedName]}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {staff.name.toUpperCase()}
                </Text>

                <Text style={styles.description} numberOfLines={2}>
                  {getStaffDescription(staff.role)}
                </Text>

                <View style={styles.divider} />

                {locked ? (
                  <LockedContent
                    requiredLevel={staff.requiredLudusLevel}
                    currentLevel={ludus.level}
                  />
                ) : (
                  <View style={styles.infoArea}>
                    <Info
                      label="Seviye"
                      value={`Lv. ${staff.level}/${staff.maxLevel}`}
                    />

                    {staff.healingBonus > 0 && (
                      <Info
                        label="İyileşme"
                        value={`+${staff.healingBonus} HP/gün`}
                      />
                    )}

                    {staff.trainingBonus > 0 && (
                      <Info label="Eğitim" value={`+${staff.trainingBonus}`} />
                    )}

                    {staff.securityBonus > 0 && (
                      <Info
                        label="Güvenlik"
                        value={`+${staff.securityBonus}`}
                      />
                    )}

                    {staff.expenseReduction > 0 && (
                      <Info
                        label="Gider"
                        value={`-%${staff.expenseReduction}`}
                      />
                    )}

                    <Info label="Maaş" value={`${staff.salary} D/gün`} />
                  </View>
                )}

                <View style={styles.bottomArea}>
                  {locked ? (
                    <LockedButton requiredLevel={staff.requiredLudusLevel} />
                  ) : staff.hired ? (
                    <View style={styles.activeButton}>
                      <Text style={styles.activeButtonText}>İŞE ALINDI</Text>
                    </View>
                  ) : (
                    <Pressable
                      disabled={cantAfford || noAP}
                      style={[
                        styles.hireButton,
                        (cantAfford || noAP) && styles.disabledButton,
                      ]}
                      onPress={() =>
                        handleHireStaff(
                          staff.id,
                          staff.name,
                          staff.requiredLudusLevel,
                        )
                      }>
                      <Text
                        style={[
                          styles.hireButtonText,
                          (cantAfford || noAP) && styles.disabledButtonText,
                        ]}>
                        {noAP
                          ? "YETERSİZ AP"
                          : cantAfford
                            ? "YETERSİZ DENARIUS"
                            : "İŞE AL · 300 D · 1 AP"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }

          const worker = item.data;

          const locked = ludus.level < worker.requiredLudusLevel;

          const full = worker.count >= worker.maxCount;

          const cantAfford = ludus.denarius < worker.hiringCost;

          const noAP = ludus.actionPoints < WORKER_ACTION_COST;

          return (
            <View
              key={`worker-${worker.id}`}
              style={[styles.card, locked && styles.lockedCard]}>
              <View style={styles.cardTop}>
                <Text style={styles.category}>İŞ GÜCÜ</Text>

                <StatusBadge
                  locked={locked}
                  requiredLevel={worker.requiredLudusLevel}
                  active={!locked}
                  activeText={`${worker.count}/${worker.maxCount}`}
                />
              </View>

              <View style={styles.iconArea}>
                <Text style={[styles.icon, locked && styles.lockedIcon]}>
                  {locked ? "◆" : getWorkerIcon(worker.role)}
                </Text>
              </View>

              <Text
                style={[styles.name, locked && styles.lockedName]}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {worker.name.toUpperCase()}
              </Text>

              <Text style={styles.description} numberOfLines={2}>
                {worker.description}
              </Text>

              <View style={styles.divider} />

              {locked ? (
                <LockedContent
                  requiredLevel={worker.requiredLudusLevel}
                  currentLevel={ludus.level}
                />
              ) : (
                <View style={styles.infoArea}>
                  <Info
                    label="İşçi"
                    value={`${worker.count}/${worker.maxCount}`}
                  />

                  <Info label="İşe Alma" value={`${worker.hiringCost} D`} />

                  <Info label="Maaş" value={`${worker.dailySalary} D/gün`} />

                  <Info label="Verim" value={`${worker.efficiency}x`} />
                </View>
              )}

              <View style={styles.bottomArea}>
                {locked ? (
                  <LockedButton requiredLevel={worker.requiredLudusLevel} />
                ) : full ? (
                  <View style={styles.activeButton}>
                    <Text style={styles.activeButtonText}>
                      MAKSİMUM KAPASİTE
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    disabled={cantAfford || noAP}
                    style={[
                      styles.hireButton,
                      (cantAfford || noAP) && styles.disabledButton,
                    ]}
                    onPress={() =>
                      handleHireWorker(
                        worker.id,
                        worker.name,
                        worker.hiringCost,
                        worker.requiredLudusLevel,
                      )
                    }>
                    <Text
                      style={[
                        styles.hireButtonText,
                        (cantAfford || noAP) && styles.disabledButtonText,
                      ]}>
                      {noAP
                        ? "YETERSİZ AP"
                        : cantAfford
                          ? "YETERSİZ DENARIUS"
                          : `+1 İŞÇİ · ${worker.hiringCost} D · 1 AP`}
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

function StatusBadge({
  locked,
  requiredLevel,
  active,
  activeText,
}: {
  locked: boolean;
  requiredLevel: number;
  active: boolean;
  activeText: string;
}) {
  if (locked) {
    return (
      <View style={styles.lockBadge}>
        <Text style={styles.lockBadgeText}>LV. {requiredLevel}</Text>
      </View>
    );
  }

  if (active) {
    return (
      <View style={styles.openBadge}>
        <Text style={styles.openBadgeText}>{activeText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.openBadge}>
      <Text style={styles.openBadgeText}>AÇIK</Text>
    </View>
  );
}

function LockedContent({
  requiredLevel,
  currentLevel,
}: {
  requiredLevel: number;
  currentLevel: number;
}) {
  return (
    <View style={styles.lockedContent}>
      <Text style={styles.lockedTitle}>HENÜZ AÇILMADI</Text>

      <Text style={styles.lockedDescription}>
        Ludus Lv. {requiredLevel} seviyesinde açılır.
      </Text>

      <Text style={styles.currentLevel}>MEVCUT · LV. {currentLevel}</Text>
    </View>
  );
}

function LockedButton({ requiredLevel }: { requiredLevel: number }) {
  return (
    <View style={styles.lockedButton}>
      <Text style={styles.lockedButtonText}>LV. {requiredLevel} GEREKLİ</Text>
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

function getStaffIcon(role: string) {
  if (role === "medicus") return "✚";
  if (role === "trainer") return "⚔";
  if (role === "guard_captain") return "◈";
  if (role === "steward") return "▤";

  return "◆";
}

function getWorkerIcon(role: string) {
  if (role === "builder") return "▰";
  if (role === "miner") return "◇";

  return "◆";
}

function getStaffRoleName(role: string) {
  if (role === "medicus") return "TIP";
  if (role === "trainer") return "EĞİTİM";
  if (role === "guard_captain") return "GÜVENLİK";
  if (role === "steward") return "YÖNETİM";

  return "PERSONEL";
}

function getStaffDescription(role: string) {
  if (role === "medicus") {
    return "Yaralı gladyatörlerin tedavisini hızlandırır.";
  }

  if (role === "trainer") {
    return "Gladyatör eğitimlerinin verimini artırır.";
  }

  if (role === "guard_captain") {
    return "Ludus güvenliğini artırır ve isyan riskini azaltır.";
  }

  if (role === "steward") {
    return "Günlük Ludus giderlerini azaltır.";
  }

  return "Ludus için çalışan özel personel.";
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
    minWidth: 45,
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

  name: {
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

  hireButton: {
    height: 29,
    backgroundColor: "#D4AF37",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  hireButtonText: {
    color: "#11100D",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },

  disabledButton: {
    backgroundColor: "#292620",
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

  activeButton: {
    height: 29,
    borderWidth: 1,
    borderColor: "#405035",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  activeButtonText: {
    color: "#8FAF72",
    fontFamily: "Cinzel_700Bold",
    fontSize: 7,
  },
});
