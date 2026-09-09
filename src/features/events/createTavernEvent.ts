export type TavernInstantEvent = {
  kind: "instant";

  title: string;
  description: string;

  moraleChange: number;
  loyaltyChange: number;

  denariusChange: number;
  fameChange: number;
};

export type TavernChoiceOption = {
  id: string;

  label: string;

  moraleChange: number;
  loyaltyChange: number;

  denariusChange: number;
  fameChange: number;

  resultText: string;
};

export type TavernChoiceEvent = {
  kind: "choice";

  id: string;

  title: string;
  description: string;

  options: TavernChoiceOption[];
};

export type TavernEventResult = TavernInstantEvent | TavernChoiceEvent | null;

export function createTavernEvent(): TavernEventResult {
  const roll = Math.random() * 100;

  /*
    %35
    Ekstra olay yok.
  */
  if (roll < 35) {
    return null;
  }

  /*
    %15
    Anlık olumlu olay.
  */
  if (roll < 50) {
    return {
      kind: "instant",

      title: "ESKİ BİR DOST",

      description:
        "Gladyatörün Taverna'da geçmişinden bir dostuyla karşılaştı.",

      moraleChange: 8,
      loyaltyChange: 3,

      denariusChange: 0,
      fameChange: 0,
    };
  }

  /*
    %15
    Anlık bahis kazancı.
  */
  if (roll < 65) {
    return {
      kind: "instant",

      title: "KAZANÇLI BİR BAHİS",

      description: "Gladyatörün küçük bir bahiste şansını denedi ve kazandı.",

      moraleChange: 3,
      loyaltyChange: 0,

      denariusChange: 60,
      fameChange: 0,
    };
  }

  /*
    %10
    Arena söylentisi.
  */
  if (roll < 75) {
    return {
      kind: "instant",

      title: "ARENA SÖYLENTİLERİ",

      description:
        "Taverna'da gladyatörün hakkında anlatılan hikâyeler Ludus'un ününü artırdı.",

      moraleChange: 4,
      loyaltyChange: 0,

      denariusChange: 0,
      fameChange: 3,
    };
  }

  /*
    %10
    SEÇİMLİ OLAY:
    Şüpheli bahis.
  */
  if (roll < 85) {
    return {
      kind: "choice",

      id: `tavern-bet-${Date.now()}`,

      title: "ŞÜPHELİ BAHİS",

      description:
        "Taverna'nın arka tarafında yüksek miktarlı gizli bir bahis dönüyor. Gladyatörün katılmak istiyor.",

      options: [
        {
          id: "accept-bet",

          label: "BAHSE GİR",

          moraleChange: 6,
          loyaltyChange: 2,

          denariusChange: 100,
          fameChange: 0,

          resultText:
            "Risk işe yaradı. Gladyatör bahsi kazandı ve Ludus'a 100 Denarius getirdi.",
        },

        {
          id: "reject-bet",

          label: "UZAK DUR",

          moraleChange: -2,
          loyaltyChange: 1,

          denariusChange: 0,
          fameChange: 0,

          resultText:
            "Bahse izin vermedin. Gladyatör biraz hayal kırıklığına uğradı ancak kararına saygı duydu.",
        },
      ],
    };
  }

  /*
    %8
    SEÇİMLİ OLAY:
    Gizemli adam.
  */
  if (roll < 93) {
    return {
      kind: "choice",

      id: `tavern-stranger-${Date.now()}`,

      title: "GİZEMLİ YABANCI",

      description:
        "Kapüşonlu bir adam gladyatörüne yaklaşarak Ludus hakkında bilgi karşılığında ödeme teklif ediyor.",

      options: [
        {
          id: "take-money",

          label: "TEKLİFİ KABUL ET",

          moraleChange: 2,
          loyaltyChange: -8,

          denariusChange: 120,
          fameChange: 0,

          resultText:
            "120 Denarius kazandın ancak gladyatörünün Ludus'a olan sadakati azaldı.",
        },

        {
          id: "refuse-money",

          label: "REDDET",

          moraleChange: 3,
          loyaltyChange: 6,

          denariusChange: 0,
          fameChange: 1,

          resultText:
            "Gladyatör teklifi reddetti. Ludus'a olan sadakati arttı.",
        },
      ],
    };
  }

  /*
    %7
    Kötü anlık olay.
  */
  return {
    kind: "instant",

    title: "TAVERNA KAVGASI",

    description:
      "Gece kontrolden çıktı. Gladyatörün başka bir savaşçıyla kavgaya karıştı.",

    moraleChange: -5,
    loyaltyChange: -2,

    denariusChange: -30,
    fameChange: 0,
  };
}
