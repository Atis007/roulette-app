import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
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

type Nav = NativeStackNavigationProp<RootStackParamList, "NeverHaveIEver">;

export function NeverHaveIEverScreen() {
  const navigation = useNavigation<Nav>();
  const { resetGame, language, loadQuestions, questionCache, pickQuestion } =
    useGame();
  const t = translations[language];

  const [currentQuestion, setCurrentQuestion] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 8,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      resetGame();
    });
    return unsub;
  }, [navigation, resetGame]);

  useEffect(() => {
    setCurrentQuestion("");
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (questionCache?.general.length && !currentQuestion) {
      setCurrentQuestion(pickQuestion("general"));
    }
  }, [questionCache, pickQuestion, currentQuestion]);

  useEffect(() => {
    if (currentQuestion) animateIn();
  }, [currentQuestion, animateIn]);

  const handleNext = () => {
    setCurrentQuestion(pickQuestion("general"));
  };

  const handleGoHome = () => {
    resetGame();
    navigation.navigate("Home");
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={styles.homeBtnText}>🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>{t.back}</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.screenTitle}>{t.neverHaveIEver}</Text>

        {/* Question card */}
        <Animated.View
          style={[
            styles.questionCard,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.questionScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.questionText}>{currentQuestion}</Text>
          </ScrollView>
        </Animated.View>

        {/* Next button */}
        <View style={styles.nextBtnContainer}>
          <BouncyButton
            color="yellow"
            size="lg"
            style={{ width: "100%" }}
            onPress={handleNext}
          >
            {t.done}
          </BouncyButton>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: scale(420),
    alignSelf: "center",
    alignItems: "center",
    paddingTop: verticalScale(56),
    paddingBottom: verticalScale(24),
    paddingHorizontal: scale(20),
  },
  topControls: {
    position: "absolute",
    top: verticalScale(8),
    left: scale(14),
    flexDirection: "row",
    gap: scale(10),
    zIndex: 20,
  },
  homeBtn: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: scale(9),
    borderRadius: scale(22),
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  homeBtnText: { fontSize: fontScale(19) },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: scale(13),
    paddingVertical: verticalScale(9),
    borderRadius: scale(14),
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: fontScale(13) },
  screenTitle: {
    fontSize: fontScale(26),
    fontWeight: "900",
    color: "#fde047",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: verticalScale(24),
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  questionCard: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(88, 28, 135, 0.88)",
    borderRadius: scale(30),
    borderWidth: 4,
    borderColor: "#fde047",
    padding: scale(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  questionScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  questionText: {
    fontSize: fontScale(22),
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    lineHeight: fontScale(32),
  },
  nextBtnContainer: {
    width: "100%",
    marginTop: verticalScale(20),
  },
});
