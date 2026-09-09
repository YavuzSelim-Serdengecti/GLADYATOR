import { AchievementDefinition } from "../../types/game";

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_arena_win",
    title: "İlk Zafer",
    description: "Arena'daki ilk galibiyetini kazan.",
    requirementType: "arena_wins",
    target: 1,
    prestigeReward: 10,
  },

  {
    id: "arena_warrior",
    title: "Arena Savaşçısı",
    description: "Toplam 5 arena galibiyeti kazan.",
    requirementType: "arena_wins",
    target: 5,
    prestigeReward: 25,
  },

  {
    id: "arena_champion",
    title: "Arena Şampiyonu",
    description: "Toplam 10 arena galibiyeti kazan.",
    requirementType: "arena_wins",
    target: 10,
    prestigeReward: 50,
  },

  {
    id: "first_purchase",
    title: "Yeni Kan",
    description: "Pazardan ilk gladyatörünü satın al.",
    requirementType: "gladiators_owned",
    target: 1,
    prestigeReward: 10,
  },

  {
    id: "gladiator_collection",
    title: "Büyüyen Ludus",
    description: "Ludus'unda 5 gladyatöre sahip ol.",
    requirementType: "gladiators_owned",
    target: 5,
    prestigeReward: 25,
  },

  {
    id: "first_training",
    title: "İlk Antrenman",
    description: "Bir gladyatöre ilk eğitimini yaptır.",
    requirementType: "trainings_completed",
    target: 1,
    prestigeReward: 5,
  },

  {
    id: "training_master",
    title: "Disiplin",
    description: "Toplam 10 eğitim gerçekleştir.",
    requirementType: "trainings_completed",
    target: 10,
    prestigeReward: 25,
  },

  {
    id: "first_building",
    title: "Temeller Atılıyor",
    description: "Ludus'unda ilk binanı inşa et.",
    requirementType: "buildings_built",
    target: 1,
    prestigeReward: 10,
  },

  {
    id: "first_staff",
    title: "Yardımcı Eller",
    description: "İlk personelini işe al.",
    requirementType: "staff_hired",
    target: 1,
    prestigeReward: 10,
  },

  {
    id: "worker_force",
    title: "İş Gücü",
    description: "Toplam 5 işçi işe al.",
    requirementType: "workers_hired",
    target: 5,
    prestigeReward: 15,
  },

  {
    id: "special_gladiator",
    title: "Bir Efsane",
    description: "Özel bir gladyatörü Ludus'una kat.",
    requirementType: "special_gladiators_owned",
    target: 1,
    prestigeReward: 50,
  },

  {
    id: "ludus_level_3",
    title: "Yükselen Hanedan",
    description: "Ludus seviyesini 3'e çıkar.",
    requirementType: "ludus_level",
    target: 3,
    prestigeReward: 20,
  },

  {
    id: "ludus_level_5",
    title: "Roma'da Bir İsim",
    description: "Ludus seviyesini 5'e çıkar.",
    requirementType: "ludus_level",
    target: 5,
    prestigeReward: 40,
  },

  {
    id: "fame_100",
    title: "Halk Seni Tanıyor",
    description: "100 şöhrete ulaş.",
    requirementType: "fame",
    target: 100,
    prestigeReward: 20,
  },

  {
    id: "wealth_5000",
    title: "Servet",
    description: "5.000 Denarius'a ulaş.",
    requirementType: "denarius",
    target: 5000,
    prestigeReward: 30,
  },
];
