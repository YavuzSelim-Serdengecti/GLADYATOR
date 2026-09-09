import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import GameModal from "../src/components/GameModal";

import {
    getCurrentUser,
    signInWithEmail,
    signOut,
    signUpWithEmail,
} from "../src/features/auth/authService";

import {
    CloudSaveRow,
    downloadCloudSave,
} from "../src/features/save/cloudSaveService";

import { GameSaveData, loadGameState } from "../src/features/save/saveSystem";

import { useGameStore } from "../src/store/gameStore";

type AuthMode = "login" | "register";

type SavePreview = {
  ludusName: string;
  lanistaName: string;
  day: number;
  denarius: number;
  prestige: number;
  savedAt: string | null;
};

function getTurkishAuthError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }

  if (lowerMessage.includes("email not confirmed")) {
    return "E-posta adresin henüz doğrulanmamış.";
  }

  if (lowerMessage.includes("user already registered")) {
    return "Bu e-posta adresiyle zaten bir hesap bulunuyor.";
  }

  if (lowerMessage.includes("password should be")) {
    return "Şifre yeterince güçlü değil.";
  }

  if (lowerMessage.includes("unable to validate email")) {
    return "Geçerli bir e-posta adresi gir.";
  }

  if (lowerMessage.includes("signup is disabled")) {
    return "Yeni hesap oluşturma şu anda kapalı.";
  }

  if (lowerMessage.includes("rate limit")) {
    return "Çok fazla işlem yapıldı. Biraz sonra tekrar dene.";
  }

  return "İşlem sırasında bir hata oluştu. Tekrar dene.";
}

function formatSaveDate(date: string | null) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createPreview(save: GameSaveData | null): SavePreview | null {
  if (!save) {
    return null;
  }

  const state = save.state as {
    world?: {
      currentDay?: number;
    };

    playerLudus?: {
      name?: string;
      lanistaName?: string;
      denarius?: number;
      prestige?: number;
    };
  };

  if (!state.world || !state.playerLudus) {
    return null;
  }

  return {
    ludusName: state.playerLudus.name ?? "İsimsiz Ludus",
    lanistaName: state.playerLudus.lanistaName ?? "-",
    day: state.world.currentDay ?? 1,
    denarius: state.playerLudus.denarius ?? 0,
    prestige: state.playerLudus.prestige ?? 0,
    savedAt: save.savedAt,
  };
}

function createCloudPreview(
  cloudSave: CloudSaveRow | null,
): SavePreview | null {
  if (!cloudSave) {
    return null;
  }

  const preview = createPreview(cloudSave.save_data);

  if (!preview) {
    return null;
  }

  return {
    ...preview,
    savedAt: cloudSave.updated_at ?? cloudSave.save_data.savedAt,
  };
}

export default function AccountScreen() {
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);

  const [localPreview, setLocalPreview] = useState<SavePreview | null>(null);

  const [cloudPreview, setCloudPreview] = useState<SavePreview | null>(null);

  const [cloudUploadArmed, setCloudUploadArmed] = useState(false);

  const [cloudLoadArmed, setCloudLoadArmed] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [modalTitle, setModalTitle] = useState("");

  const [modalMessage, setModalMessage] = useState("");

  const {
    isSaveLoading,
    isCloudSaveLoading,
    loadGame,
    uploadGameToCloud,
    loadGameFromCloud,
    checkSavedGame,
    checkCloudSavedGame,
  } = useGameStore();

  const showMessage = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const refreshSavePreviews = async () => {
    try {
      const localSave = await loadGameState();

      setLocalPreview(createPreview(localSave));
    } catch {
      setLocalPreview(null);
    }

    try {
      const cloudSave = await downloadCloudSave();

      setCloudPreview(createCloudPreview(cloudSave));
    } catch {
      setCloudPreview(null);
    }

    await checkSavedGame();
    await checkCloudSavedGame();
  };

  const refreshUser = async () => {
    try {
      const user = await getCurrentUser();

      setCurrentEmail(user?.email ?? null);

      if (user) {
        await refreshSavePreviews();
      }
    } catch {
      setCurrentEmail(null);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      showMessage("EKSİK BİLGİ", "E-posta ve şifre alanlarını doldur.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      showMessage("GEÇERSİZ E-POSTA", "Geçerli bir e-posta adresi gir.");
      return;
    }

    if (password.length < 6) {
      showMessage("ŞİFRE ÇOK KISA", "Şifre en az 6 karakter olmalı.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "register") {
        const data = await signUpWithEmail(cleanEmail, password);

        if (data.session) {
          setCurrentEmail(data.user?.email ?? cleanEmail);
          setPassword("");

          await refreshSavePreviews();

          showMessage(
            "HESAP OLUŞTURULDU",
            "Hesabın oluşturuldu ve giriş yapıldı.",
          );
        } else {
          setPassword("");
          setMode("login");

          showMessage(
            "HESAP OLUŞTURULDU",
            "Hesabın oluşturuldu. Şimdi giriş yapabilirsin.",
          );
        }
      } else {
        const data = await signInWithEmail(cleanEmail, password);

        setCurrentEmail(data.user?.email ?? cleanEmail);
        setPassword("");

        await refreshSavePreviews();

        showMessage("GİRİŞ BAŞARILI", "Hesabına giriş yaptın.");
      }
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "";

      showMessage(
        mode === "login" ? "GİRİŞ BAŞARISIZ" : "KAYIT BAŞARISIZ",
        getTurkishAuthError(rawMessage),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      await signOut();

      setCurrentEmail(null);
      setCloudPreview(null);

      setCloudUploadArmed(false);
      setCloudLoadArmed(false);

      setEmail("");
      setPassword("");

      showMessage(
        "ÇIKIŞ YAPILDI",
        "Hesabından çıkış yaptın. Cihazdaki oyun kaydı silinmedi.",
      );
    } catch {
      showMessage("HATA", "Çıkış yapılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLocal = async () => {
    const loaded = await loadGame();

    if (!loaded) {
      showMessage("KAYIT YÜKLENEMEDİ", "Cihazdaki oyun kaydı yüklenemedi.");
      return;
    }

    router.replace("/map");
  };

  const handleCloudUpload = async () => {
    if (!localPreview) {
      showMessage(
        "CİHAZ KAYDI YOK",
        "Buluta gönderilebilecek bir cihaz kaydı bulunamadı.",
      );
      return;
    }

    if (cloudPreview && !cloudUploadArmed) {
      setCloudUploadArmed(true);
      setCloudLoadArmed(false);
      return;
    }

    const result = await uploadGameToCloud();

    setCloudUploadArmed(false);

    await refreshSavePreviews();

    showMessage("BULUT YEDEĞİ", result);
  };

  const handleCloudLoad = async () => {
    if (!cloudPreview) {
      showMessage(
        "BULUT KAYDI YOK",
        "Bu hesapta yüklenebilecek bir bulut kaydı bulunamadı.",
      );
      return;
    }

    if (localPreview && !cloudLoadArmed) {
      setCloudLoadArmed(true);
      setCloudUploadArmed(false);
      return;
    }

    const loaded = await loadGameFromCloud();

    setCloudLoadArmed(false);

    if (!loaded) {
      showMessage("YÜKLEME BAŞARISIZ", "Bulut kaydı yüklenemedi.");
      return;
    }

    await refreshSavePreviews();

    showMessage(
      "BULUT KAYDI YÜKLENDİ",
      "Bulut kaydı artık bu cihazın aktif oyun kaydı oldu.",
    );
  };

  const busy = loading || isSaveLoading || isCloudSaveLoading;

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>HESAP KONTROL EDİLİYOR...</Text>
      </View>
    );
  }

  if (currentEmail) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>KAYIT YÖNETİMİ</Text>

            <Text style={styles.title}>LUDUS KAYITLARI</Text>

            <Text style={styles.subtitle}>
              Cihaz ve bulut kaydını buradan yönetebilirsin.
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.accountEmail}>{currentEmail}</Text>

            <Pressable onPress={() => router.back()}>
              <Text style={styles.backText}>← GERİ DÖN</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.saveArea}>
          <View style={styles.saveCard}>
            <View style={styles.saveCardHeader}>
              <View>
                <Text style={styles.cardEyebrow}>BU TELEFON</Text>
                <Text style={styles.cardTitle}>📱 CİHAZ KAYDI</Text>
              </View>

              <Text
                style={[
                  styles.statusBadge,
                  localPreview ? styles.statusGood : styles.statusEmpty,
                ]}>
                {localPreview ? "● KAYIT VAR" : "○ KAYIT YOK"}
              </Text>
            </View>

            {localPreview ? (
              <>
                <View style={styles.ludusBox}>
                  <Text style={styles.ludusName}>{localPreview.ludusName}</Text>

                  <Text style={styles.lanistaName}>
                    Lanista: {localPreview.lanistaName}
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>GÜN</Text>
                    <Text style={styles.statValue}>{localPreview.day}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>DENARIUS</Text>
                    <Text style={styles.statValue}>
                      {localPreview.denarius}
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>PRESTİJ</Text>
                    <Text style={styles.statValue}>
                      {localPreview.prestige}
                    </Text>
                  </View>
                </View>

                <Text style={styles.savedDate}>
                  Son kayıt: {formatSaveDate(localPreview.savedAt)}
                </Text>

                <Pressable
                  style={styles.primaryButton}
                  disabled={busy}
                  onPress={handleContinueLocal}>
                  <Text style={styles.primaryButtonText}>
                    BU KAYITLA DEVAM ET
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.secondaryButton,
                    busy && styles.disabledButton,
                    cloudUploadArmed && styles.warningButton,
                  ]}
                  disabled={busy}
                  onPress={handleCloudUpload}>
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      cloudUploadArmed && styles.warningButtonText,
                    ]}>
                    {cloudUploadArmed
                      ? "⚠ TEKRAR BAS: BULUT KAYDININ ÜZERİNE YAZ"
                      : cloudPreview
                        ? "☁️ BULUT KAYDINI GÜNCELLE"
                        : "☁️ BULUTA YEDEKLE"}
                  </Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.emptyArea}>
                <Text style={styles.emptyIcon}>📱</Text>
                <Text style={styles.emptyTitle}>Cihaz kaydı yok</Text>

                <Text style={styles.emptyDescription}>
                  Bu cihazda kayıtlı bir Ludus bulunamadı.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.connectionArea}>
            <Text style={styles.connectionIcon}>⇄</Text>
            <Text style={styles.connectionText}>SENKRONİZASYON</Text>
          </View>

          <View style={styles.saveCard}>
            <View style={styles.saveCardHeader}>
              <View>
                <Text style={styles.cardEyebrow}>SUPABASE HESABI</Text>
                <Text style={styles.cardTitle}>☁️ BULUT KAYDI</Text>
              </View>

              <Text
                style={[
                  styles.statusBadge,
                  cloudPreview ? styles.statusGood : styles.statusEmpty,
                ]}>
                {cloudPreview ? "● KAYIT VAR" : "○ KAYIT YOK"}
              </Text>
            </View>

            {cloudPreview ? (
              <>
                <View style={styles.ludusBox}>
                  <Text style={styles.ludusName}>{cloudPreview.ludusName}</Text>

                  <Text style={styles.lanistaName}>
                    Lanista: {cloudPreview.lanistaName}
                  </Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>GÜN</Text>
                    <Text style={styles.statValue}>{cloudPreview.day}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>DENARIUS</Text>
                    <Text style={styles.statValue}>
                      {cloudPreview.denarius}
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>PRESTİJ</Text>
                    <Text style={styles.statValue}>
                      {cloudPreview.prestige}
                    </Text>
                  </View>
                </View>

                <Text style={styles.savedDate}>
                  Son yedek: {formatSaveDate(cloudPreview.savedAt)}
                </Text>

                <Pressable
                  style={[
                    styles.primaryButton,
                    cloudLoadArmed && styles.dangerButton,
                  ]}
                  disabled={busy}
                  onPress={handleCloudLoad}>
                  <Text
                    style={[
                      styles.primaryButtonText,
                      cloudLoadArmed && styles.dangerButtonText,
                    ]}>
                    {cloudLoadArmed
                      ? "⚠ TEKRAR BAS: CİHAZ KAYDININ ÜZERİNE YAZ"
                      : localPreview
                        ? "↓ BU KAYDI CİHAZA YÜKLE"
                        : "↓ BU KAYDI CİHAZA İNDİR"}
                  </Text>
                </Pressable>

                <Text style={styles.warningText}>
                  Bulut kaydını cihaza yüklemek, mevcut cihaz kaydının yerini
                  alır.
                </Text>
              </>
            ) : (
              <View style={styles.emptyArea}>
                <Text style={styles.emptyIcon}>☁️</Text>
                <Text style={styles.emptyTitle}>Bulut kaydı yok</Text>

                <Text style={styles.emptyDescription}>
                  Bu hesaba henüz bir Ludus kaydı yedeklenmemiş.
                </Text>

                {localPreview && (
                  <Text style={styles.emptyHint}>
                    Soldaki cihaz kaydını buluta yedekleyebilirsin.
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.bottomInfo}>
            📱 Cihaz kaydı çevrimdışı çalışır. ☁️ Bulut kaydı hesabına bağlı
            yedektir.
          </Text>

          <Pressable disabled={busy} onPress={handleLogout}>
            <Text style={styles.logoutText}>ÇIKIŞ YAP</Text>
          </Pressable>
        </View>

        <GameModal
          visible={modalVisible}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>OPSİYONEL HESAP</Text>

          <Text style={styles.title}>
            {mode === "login" ? "GİRİŞ YAP" : "HESAP OLUŞTUR"}
          </Text>

          <Text style={styles.subtitle}>
            Hesap açmadan da oyunu oynayabilirsin.
          </Text>
        </View>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← GERİ DÖN</Text>
        </Pressable>
      </View>

      <View style={styles.mainArea}>
        <View style={styles.content}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {mode === "login" ? "LUDUS HESABINA GİR" : "YENİ HESAP OLUŞTUR"}
            </Text>

            <Text style={styles.formDescription}>
              {mode === "login"
                ? "Kayıtlı hesabınla giriş yap."
                : "E-posta ve şifrenle hesap oluştur."}
            </Text>

            <Text style={styles.fieldLabel}>E-POSTA</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="ornek@email.com"
              placeholderTextColor="#625B50"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>ŞİFRE</Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="En az 6 karakter"
              placeholderTextColor="#625B50"
              style={styles.input}
            />

            <Pressable
              style={[styles.loginButton, loading && styles.disabledButton]}
              disabled={loading}
              onPress={handleSubmit}>
              <Text style={styles.loginButtonText}>
                {loading
                  ? "BEKLE..."
                  : mode === "login"
                    ? "GİRİŞ YAP"
                    : "HESAP OLUŞTUR"}
              </Text>
            </Pressable>

            <View style={styles.modeArea}>
              <Text style={styles.modeQuestion}>
                {mode === "login"
                  ? "Henüz hesabın yok mu?"
                  : "Zaten hesabın var mı?"}
              </Text>

              <Pressable
                onPress={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setPassword("");
                }}>
                <Text style={styles.modeButtonText}>
                  {mode === "login" ? "HESAP OLUŞTUR" : "GİRİŞ YAP"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sideCard}>
            <Text style={styles.sideTitle}>HESAP NE İŞE YARAR?</Text>

            <View style={styles.sideItem}>
              <Text style={styles.sideText}>☁️ Bulut yedek</Text>
              <Text style={styles.sideDescription}>
                Ludus kaydını hesabında sakla.
              </Text>
            </View>

            <View style={styles.sideItem}>
              <Text style={styles.sideText}>📱 Cihaz değiştirme</Text>
              <Text style={styles.sideDescription}>
                Başka telefonda bulut kaydını indir.
              </Text>
            </View>

            <View style={styles.sideItem}>
              <Text style={styles.sideText}>⚔️ Multiplayer</Text>
              <Text style={styles.sideDescription}>
                İleride online Ludus sistemi hesabına bağlanacak.
              </Text>
            </View>

            <View style={styles.sideDivider} />

            <Text style={styles.sideNote}>HESAP ZORUNLU DEĞİL</Text>

            <Text style={styles.sideNoteDescription}>
              Hesapsız oynarsan kayıt yalnızca cihazında tutulur.
            </Text>
          </View>
        </View>
      </View>

      <GameModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0A08",
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 10,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B0A08",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#DDB936",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },

  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#332C1D",
  },

  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },

  accountEmail: {
    color: "#8E8679",
    fontSize: 8,
  },

  eyebrow: {
    color: "#806C35",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  title: {
    color: "#DDB936",
    fontSize: 21,
    fontWeight: "bold",
    marginTop: 1,
    letterSpacing: 1.2,
  },

  subtitle: {
    color: "#91897C",
    fontSize: 8,
    marginTop: 2,
  },

  backText: {
    color: "#B99B4D",
    fontSize: 10,
    fontWeight: "bold",
  },

  saveArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
  },

  saveCard: {
    width: "43%",
    height: "100%",
    maxHeight: 330,
    backgroundColor: "#15120E",
    borderWidth: 1,
    borderColor: "#514322",
    borderRadius: 8,
    padding: 16,
  },

  saveCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardEyebrow: {
    color: "#756533",
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },

  cardTitle: {
    color: "#DDB936",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 2,
  },

  statusBadge: {
    fontSize: 7,
    fontWeight: "bold",
  },

  statusGood: {
    color: "#8FAF72",
  },

  statusEmpty: {
    color: "#756F65",
  },

  ludusBox: {
    marginTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#332C1D",
  },

  ludusName: {
    color: "#E3D5AF",
    fontSize: 15,
    fontWeight: "bold",
  },

  lanistaName: {
    color: "#898174",
    fontSize: 8,
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 11,
    gap: 8,
  },

  statItem: {
    flex: 1,
    backgroundColor: "#0D0C09",
    borderWidth: 1,
    borderColor: "#29241A",
    borderRadius: 4,
    paddingVertical: 7,
    alignItems: "center",
  },

  statLabel: {
    color: "#746947",
    fontSize: 7,
    fontWeight: "bold",
  },

  statValue: {
    color: "#D8CDAF",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 2,
  },

  savedDate: {
    color: "#797268",
    fontSize: 7,
    marginTop: 8,
  },

  primaryButton: {
    minHeight: 34,
    marginTop: 10,
    backgroundColor: "#DDB936",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  primaryButtonText: {
    color: "#11100D",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },

  secondaryButton: {
    minHeight: 32,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#7E6933",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  secondaryButtonText: {
    color: "#DDB936",
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },

  warningButton: {
    borderColor: "#B78134",
    backgroundColor: "#2C2111",
  },

  warningButtonText: {
    color: "#E6B65C",
  },

  dangerButton: {
    backgroundColor: "#38201D",
    borderWidth: 1,
    borderColor: "#B85A4F",
  },

  dangerButtonText: {
    color: "#E1A29A",
  },

  warningText: {
    color: "#746D61",
    fontSize: 7,
    lineHeight: 10,
    textAlign: "center",
    marginTop: 5,
  },

  emptyArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 28,
  },

  emptyTitle: {
    color: "#D0C4A9",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 7,
  },

  emptyDescription: {
    color: "#817A70",
    fontSize: 8,
    lineHeight: 12,
    textAlign: "center",
    marginTop: 4,
  },

  emptyHint: {
    color: "#A58B46",
    fontSize: 7,
    lineHeight: 10,
    textAlign: "center",
    marginTop: 10,
  },

  connectionArea: {
    width: "8%",
    alignItems: "center",
    justifyContent: "center",
  },

  connectionIcon: {
    color: "#6E5B2C",
    fontSize: 24,
    fontWeight: "bold",
  },

  connectionText: {
    color: "#625839",
    fontSize: 7,
    marginTop: 3,
    fontWeight: "bold",
  },

  bottomBar: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#29241A",
  },

  bottomInfo: {
    color: "#716B61",
    fontSize: 7,
  },

  logoutText: {
    color: "#B96D65",
    fontSize: 8,
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.45,
  },

  mainArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    width: "94%",
    maxWidth: 1000,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    gap: 18,
  },

  formCard: {
    flex: 1.1,
    backgroundColor: "#17140F",
    borderWidth: 1,
    borderColor: "#66542A",
    borderRadius: 9,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  formTitle: {
    color: "#DDB936",
    fontSize: 14,
    fontWeight: "bold",
  },

  formDescription: {
    color: "#91897C",
    fontSize: 8,
    marginTop: 3,
    marginBottom: 13,
  },

  fieldLabel: {
    color: "#B79A51",
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 5,
  },

  input: {
    height: 38,
    borderWidth: 1,
    borderColor: "#4A3F2B",
    borderRadius: 5,
    backgroundColor: "#0F0D0A",
    color: "#EEE3C6",
    fontSize: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  loginButton: {
    height: 38,
    backgroundColor: "#DDB936",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  loginButtonText: {
    color: "#11100D",
    fontSize: 9,
    fontWeight: "bold",
  },

  modeArea: {
    height: 42,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#332C1D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  modeQuestion: {
    color: "#91897C",
    fontSize: 8,
  },

  modeButtonText: {
    color: "#DDB936",
    fontSize: 8,
    fontWeight: "bold",
  },

  sideCard: {
    flex: 0.9,
    backgroundColor: "#12100D",
    borderWidth: 1,
    borderColor: "#332C1D",
    borderRadius: 9,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  sideTitle: {
    color: "#DDB936",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
  },

  sideItem: {
    marginBottom: 8,
  },

  sideText: {
    color: "#D0C4A9",
    fontSize: 9,
    fontWeight: "bold",
  },

  sideDescription: {
    color: "#8E8679",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 2,
  },

  sideDivider: {
    height: 1,
    backgroundColor: "#332C1D",
    marginVertical: 8,
  },

  sideNote: {
    color: "#8FAF72",
    fontSize: 8,
    fontWeight: "bold",
  },

  sideNoteDescription: {
    color: "#91897C",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 3,
  },
});
