export const gladiatorNamesByOrigin = {
  Roma: [
    "Marcus",
    "Lucius",
    "Gaius",
    "Titus",
    "Aulus",
    "Decimus",
    "Quintus",
    "Publius",
    "Sextus",
    "Flavius",
  ],

  Thracia: [
    "Duras",
    "Seuthes",
    "Rhesus",
    "Cotys",
    "Teres",
    "Sitalces",
    "Bithys",
    "Medocus",
  ],

  Gallia: [
    "Brennus",
    "Caturix",
    "Segomaros",
    "Viridomaros",
    "Ambiorix",
    "Caratacus",
    "Vercassus",
    "Bellovesus",
  ],

  Germania: [
    "Armin",
    "Segimer",
    "Ariovist",
    "Inguiomer",
    "Hagan",
    "Waldar",
    "Berengar",
    "Theudric",
  ],

  Graecia: [
    "Alexios",
    "Nikandros",
    "Damon",
    "Leandros",
    "Theron",
    "Menandros",
    "Kleon",
    "Diodoros",
  ],

  Africa: [
    "Hanno",
    "Mago",
    "Bomilcar",
    "Adherbal",
    "Massin",
    "Syphax",
    "Bostar",
    "Iampsas",
  ],
} as const;

export type GladiatorOrigin = keyof typeof gladiatorNamesByOrigin;

export const gladiatorOrigins: GladiatorOrigin[] = [
  "Roma",
  "Thracia",
  "Gallia",
  "Germania",
  "Graecia",
  "Africa",
];

export function getNamesForOrigin(origin: GladiatorOrigin) {
  return gladiatorNamesByOrigin[origin];
}
