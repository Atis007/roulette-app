import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { BouncyButton } from "../components/BouncyButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import type { RootStackParamList } from "../types/navigation";
import { fontScale, scale, verticalScale } from "../utils/responsive";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

const RATINGS = [
  { label: "PG", color: "blue" as const, rgb: "14,165,200", shadow: "#0e7490" },
  { label: "PG-13", color: "yellow" as const, rgb: "245,200,0", shadow: "#ca8a04" },
  { label: "R", color: "pink" as const, rgb: "232,54,122", shadow: "#be185d" },
];

function AnimatedCard({
  index,
  rgb,
  shadow,
  children,
}: {
  index: number;
  rgb: string;
  shadow: string;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 100,
        useNativeDriver: true,
        bounciness: 8,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: `rgba(${rgb},0.25)`,
          borderColor: `rgba(${rgb},0.7)`,
          shadowColor: shadow,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { setRating, language } = useGame();
  const t = translations[language];

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(titleTranslateY, { toValue: 0, useNativeDriver: true, bounciness: 10 }),
    ]).start();
  }, []);

  const descs = [t.pgDesc, t.pg13Desc, t.rDesc];

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {t.selectRating}
        </Animated.Text>

        <View style={styles.cards}>
          {RATINGS.map((r, i) => (
            <AnimatedCard key={r.label} index={i} rgb={r.rgb} shadow={r.shadow}>
              <BouncyButton
                color={r.color}
                size="lg"
                style={styles.cardBtn}
                onPress={() => {
                  setRating(r.label);
                  navigation.navigate("GameType");
                }}
              >
                {r.label}
              </BouncyButton>
              <View style={[styles.descPill, { backgroundColor: `rgba(${r.rgb},0.30)` }]}>
                <Text
                  style={styles.cardDesc}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {descs[i]}
                </Text>
              </View>
            </AnimatedCard>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: scale(416),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(24),
  },
  title: {
    fontSize: fontScale(32),
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: verticalScale(20),
    width: "100%",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  cards: {
    width: "100%",
    gap: verticalScale(14),
  },
  card: {
    borderRadius: scale(26),
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(14),
    borderWidth: 3,
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  cardBtn: {
    width: "100%",
    marginBottom: verticalScale(10),
  },
  descPill: {
    borderRadius: scale(14),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    width: "100%",
  },
  cardDesc: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
  },
});
