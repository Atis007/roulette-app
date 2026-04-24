import { useState } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { fontScale, scale } from "../utils/responsive";

type Color = "pink" | "yellow" | "blue" | "green" | "purple";
type Size = "sm" | "md" | "lg";

interface BouncyButtonProps {
  children: React.ReactNode;
  color?: Color;
  size?: Size;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const COLOR_CONFIG: Record<Color, { bg: string; shadow: string; text: string }> = {
  pink: { bg: "#e8367a", shadow: "#be185d", text: "#fff" },
  yellow: { bg: "#f5c800", shadow: "#ca8a04", text: "#fff" },
  blue: { bg: "#0ea5c8", shadow: "#0e7490", text: "#fff" },
  green: { bg: "#34c759", shadow: "#15803d", text: "#fff" },
  purple: { bg: "#a855f7", shadow: "#7e22ce", text: "#fff" },
};

const SIZE_CONFIG: Record<
  Size,
  { paddingH: number; paddingV: number; fontSize: number; shadowH: number }
> = {
  sm: { paddingH: scale(14), paddingV: scale(7), fontSize: fontScale(13), shadowH: 4 },
  md: { paddingH: scale(22), paddingV: scale(11), fontSize: fontScale(17), shadowH: 5 },
  lg: { paddingH: scale(22), paddingV: scale(14), fontSize: fontScale(20), shadowH: 7 },
};

export function BouncyButton({
  children,
  color = "pink",
  size = "md",
  onPress,
  disabled,
  style,
}: BouncyButtonProps) {
  const [pressed, setPressed] = useState(false);
  const cfg = COLOR_CONFIG[color];
  const sz = SIZE_CONFIG[size];
  const shadowH = pressed ? 2 : sz.shadowH;

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={disabled}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View
        style={[
          styles.button,
          {
            backgroundColor: cfg.bg,
            paddingHorizontal: sz.paddingH,
            paddingVertical: sz.paddingV,
            transform: [{ translateY: pressed ? sz.shadowH - 2 : 0 }],
            shadowColor: cfg.shadow,
            shadowOffset: { width: 0, height: shadowH },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: shadowH,
          },
        ]}
      >
        <Text style={[styles.text, { fontSize: sz.fontSize, color: cfg.text }]}>{children}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: scale(22),
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
