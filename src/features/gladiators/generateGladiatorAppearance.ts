import { GladiatorAppearance } from "../../types/game";
import { randomItem } from "../../utils/random";

const skinTones: GladiatorAppearance["skinTone"][] = [
  "light",
  "olive",
  "tan",
  "brown",
  "dark",
];

const faceTypes: GladiatorAppearance["faceType"][] = [
  "face_1",
  "face_2",
  "face_3",
  "face_4",
  "face_5",
  "face_6",
];

const hairStyles: GladiatorAppearance["hairStyle"][] = [
  "bald",
  "short",
  "medium",
  "long",
  "curly",
  "shaved",
];

const hairColors: GladiatorAppearance["hairColor"][] = [
  "black",
  "dark_brown",
  "brown",
  "light_brown",
  "blond",
  "red",
  "gray",
];

const beardStyles: GladiatorAppearance["beardStyle"][] = [
  "none",
  "stubble",
  "short",
  "full",
  "long",
  "goatee",
];

const scars: GladiatorAppearance["scar"][] = [
  "none",
  "left_eye",
  "right_eye",
  "cheek",
  "forehead",
  "jaw",
];

export function generateGladiatorAppearance(): GladiatorAppearance {
  const hairStyle = randomItem(hairStyles);

  return {
    skinTone: randomItem(skinTones),

    faceType: randomItem(faceTypes),

    hairStyle,

    hairColor: randomItem(hairColors),

    beardStyle: randomItem(beardStyles),

    scar: randomItem(scars),
  };
}
