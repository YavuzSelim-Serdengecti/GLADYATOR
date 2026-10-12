import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

import { playEffect } from "../services/audioManager";

type GameButtonProps = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  pressedOpacity?: number;
};

export default function GameButton({
  children,
  style,
  disabled = false,
  pressedScale = 0.95,
  pressedOpacity = 0.88,
  onPress,
  ...props
}: GameButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={(event) => {
        if (!disabled) {
          playEffect("click");
        }

        onPress?.(event);
      }}
      style={({ pressed }) => [
        style,
        pressed &&
          !disabled && {
            transform: [{ scale: pressedScale }],
            opacity: pressedOpacity,
          },
      ]}>
      {children}
    </Pressable>
  );
}
