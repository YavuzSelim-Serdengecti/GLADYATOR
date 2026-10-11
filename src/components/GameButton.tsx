import { ReactNode } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

type GameButtonProps = Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
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
  ...props
}: GameButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
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
