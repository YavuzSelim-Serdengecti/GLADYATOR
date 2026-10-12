import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

const sounds = {
  menu: require("../../assets/audio/menu-music.mp3"),
  battle: require("../../assets/audio/battle-music.mp3"),
  sword: require("../../assets/audio/sword-hit.mp3"),
  click: require("../../assets/audio/button-click.wav"),
  victory: require("../../assets/audio/victory.wav"),
  defeat: require("../../assets/audio/defeat.wav"),
};

type MusicType = "menu" | "battle";
type EffectType = "sword" | "click" | "victory" | "defeat";

const menuPlayer = createAudioPlayer(sounds.menu);
const battlePlayer = createAudioPlayer(sounds.battle);

const effectPlayers = {
  sword: createAudioPlayer(sounds.sword),
  click: createAudioPlayer(sounds.click),
  victory: createAudioPlayer(sounds.victory),
  defeat: createAudioPlayer(sounds.defeat),
};

menuPlayer.loop = true;
battlePlayer.loop = true;

menuPlayer.volume = 0.25;
battlePlayer.volume = 0.3;

effectPlayers.sword.volume = 0.65;
effectPlayers.click.volume = 0.35;
effectPlayers.victory.volume = 0.65;
effectPlayers.defeat.volume = 0.65;

let musicEnabled = true;
let effectsEnabled = true;
let currentMusic: MusicType | null = null;

export async function initializeAudio() {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
  });
}

export function playMusic(type: MusicType) {
  if (currentMusic === type) {
    return;
  }

  menuPlayer.pause();
  battlePlayer.pause();

  currentMusic = type;

  if (!musicEnabled) {
    return;
  }

  const player = type === "menu" ? menuPlayer : battlePlayer;

  void player.seekTo(0).then(() => {
    if (musicEnabled && currentMusic === type) {
      player.play();
    }
  });
}

export function stopMusic() {
  menuPlayer.pause();
  battlePlayer.pause();
  currentMusic = null;
}

export function playEffect(type: EffectType) {
  if (!effectsEnabled) {
    return;
  }

  const player = effectPlayers[type];

  void player.seekTo(0).then(() => {
    if (effectsEnabled) {
      player.play();
    }
  });
}

export function setMusicEnabled(enabled: boolean) {
  musicEnabled = enabled;

  if (!enabled) {
    menuPlayer.pause();
    battlePlayer.pause();
    return;
  }

  if (currentMusic) {
    const player = currentMusic === "menu" ? menuPlayer : battlePlayer;
    player.play();
  }
}

export function setEffectsEnabled(enabled: boolean) {
  effectsEnabled = enabled;
}
