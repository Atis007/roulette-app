import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BouncyButton } from "../components/BouncyButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import type { RootStackParamList } from "../types/navigation";
import { fontScale, scale, verticalScale } from "../utils/responsive";

type Nav = NativeStackNavigationProp<RootStackParamList, "GameType">;

function AnimatedRow({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        delay: index * 100,
        useNativeDriver: true,
        bounciness: 6,
      }),
    ]).start();
  }, [opacity, translateX, index]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      {children}
    </Animated.View>
  );
}

export function GameTypeScreen() {
  const navigation = useNavigation<Nav>();
  const { setGameType, rating, language } = useGame();
  const t = translations[language];

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 10,
      }),
    ]).start();
  }, [titleOpacity, titleScale]);

  const types = [
    {
      key: "TRUTH OR DARE",
      label: t.truthOrDare,
      color: "pink" as const,
      screen: "Players" as const,
    },
    {
      key: "NEVER HAVE I EVER",
      label: t.neverHaveIEver,
      color: "yellow" as const,
      screen: "NeverHaveIEver" as const,
    },
  ];

  const handleSelect = (key: string, screen: "Players" | "NeverHaveIEver") => {
    setGameType(key);
    navigation.navigate(screen);
  };

  return (
    <ScreenWrapper>
      {/* BACK — top-left */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>{t.back}</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Title */}
        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ scale: titleScale }] },
          ]}
        >
          {t.chooseGame}
        </Animated.Text>

        {/* Rating badge — inline, below title */}
        {!!rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {t.rating}: {rating}
            </Text>
          </View>
        )}

        <View style={styles.list}>
          {types.map((type, i) => (
            <AnimatedRow key={type.key} index={i}>
              <BouncyButton
                color={type.color}
                size="lg"
                style={styles.typeBtn}
                onPress={() => handleSelect(type.key, type.screen)}
              >
                {type.label}
              </BouncyButton>
            </AnimatedRow>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: verticalScale(14),
    left: scale(14),
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(7),
    borderRadius: scale(14),
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  backText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: fontScale(13),
  },
  scroll: {
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(24),
    width: "100%",
  },
  title: {
    fontSize: fontScale(30),
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: verticalScale(10),
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  ratingBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: verticalScale(20),
  },
  ratingText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: fontScale(14),
    textAlign: "center",
  },
  list: {
    width: "100%",
    maxWidth: scale(384),
    gap: verticalScale(16),
  },
  typeBtn: {
    width: "100%",
    minHeight: verticalScale(76),
  },
});
