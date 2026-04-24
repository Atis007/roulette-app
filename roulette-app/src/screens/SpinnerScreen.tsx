import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";
import { BouncyButton } from "../components/BouncyButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import type { RootStackParamList } from "../types/navigation";
import { fontScale, SCREEN_HEIGHT, SCREEN_WIDTH, scale, verticalScale } from "../utils/responsive";

type Nav = NativeStackNavigationProp<RootStackParamList, "Spinner">;

const COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#4CD964",
  "#5AC8FA",
  "#007AFF",
  "#5856D6",
  "#FF2D55",
];
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - scale(48), SCREEN_HEIGHT * 0.44, 360);

function buildSlices(players: string[]) {
  const n = players.length || 1;
  const sliceAngle = 360 / n;

  if (n === 1) {
    return { paths: [{ d: "", fill: COLORS[0], isCircle: true }], texts: [] as any[] };
  }

  let currentAngle = 0;
  const paths: { d: string; fill: string; isCircle: boolean }[] = [];
  const texts: { x: number; y: number; rotation: number; label: string; fontSize: number }[] = [];

  for (let i = 0; i < n; i++) {
    const startRad = (currentAngle * Math.PI) / 180;
    const endRad = ((currentAngle + sliceAngle) * Math.PI) / 180;

    const x1 = 50 + 50 * Math.sin(startRad);
    const y1 = 50 - 50 * Math.cos(startRad);
    const x2 = 50 + 50 * Math.sin(endRad);
    const y2 = 50 - 50 * Math.cos(endRad);
    const largeArc = sliceAngle > 180 ? 1 : 0;

    paths.push({
      d: `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`,
      fill: COLORS[i % COLORS.length],
      isCircle: false,
    });

    const midRad = startRad + (endRad - startRad) / 2;
    texts.push({
      x: 50 + 35 * Math.sin(midRad),
      y: 50 - 35 * Math.cos(midRad),
      rotation: (midRad * 180) / Math.PI - 90,
      label: players[i].substring(0, 12),
      fontSize: n > 8 ? 3 : 4,
    });

    currentAngle += sliceAngle;
  }

  return { paths, texts };
}

export function SpinnerScreen() {
  const navigation = useNavigation<Nav>();
  const { players, gameType, resetGame, language, questionCache } = useGame();
  const t = translations[language];

  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [showTruthOrDareChoice, setShowTruthOrDareChoice] = useState(false);

  const currentDeg = useRef(0);
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const numPlayers = players.length || 1;
  const sliceAngle = 360 / numPlayers;
  const { paths, texts } = buildSlices(players);

  const rotate = rotationAnim.interpolate({
    inputRange: [-72000, 72000],
    outputRange: ["-72000deg", "72000deg"],
  });

  const handleSpinComplete = useCallback(
    (winnerIndex: number) => {
      setIsSpinning(false);
      setSelectedPlayer(players[winnerIndex]);

      if (gameType === 'TRUTH OR DARE') {
        setShowTruthOrDareChoice(true);
      } else {
        const pool = questionCache?.general ?? [];
        if (pool.length) setQuestion(pool[Math.floor(Math.random() * pool.length)]);
      }
    },
    [players, gameType, questionCache],
  );

  const spinWheel = () => {
    if (isSpinning || players.length < 2) return;
    setIsSpinning(true);
    setSelectedPlayer(null);
    setQuestion(null);
    setShowTruthOrDareChoice(false);

    const winnerIndex = Math.floor(Math.random() * numPlayers);
    const targetAngle = 360 - (winnerIndex * sliceAngle + sliceAngle / 2);
    const fullSpins = Math.floor(currentDeg.current / 360);
    const newDeg = (fullSpins + 5) * 360 + targetAngle;

    currentDeg.current = newDeg;

    Animated.timing(rotationAnim, {
      toValue: newDeg,
      duration: 4000,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) handleSpinComplete(winnerIndex);
    });
  };

  const handleTruthOrDareChoice = (type: 'truth' | 'dare') => {
    const pool = type === 'truth'
      ? (questionCache?.truth  ?? [])
      : (questionCache?.dare   ?? []);
    if (pool.length) setQuestion(pool[Math.floor(Math.random() * pool.length)]);
    setShowTruthOrDareChoice(false);
  };

  const handleGoHome = () => {
    resetGame();
    navigation.navigate("Home");
  };

  const modalVisible = !!selectedPlayer && (showTruthOrDareChoice || !!question);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome} activeOpacity={0.7}>
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

        <View style={styles.wheelArea}>
          <View style={styles.wheelGroup}>
            <View style={styles.pointer}>
              <Svg width={scale(28)} height={verticalScale(36)} viewBox="0 0 40 60">
                <Path
                  d="M20 60L0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20L20 60Z"
                  fill="#FACC15"
                  stroke="white"
                  strokeWidth="3"
                />
              </Svg>
            </View>

            <Animated.View style={[styles.wheelWrapper, { transform: [{ rotate }] }]}>
              <Svg viewBox="0 0 100 100" width={WHEEL_SIZE} height={WHEEL_SIZE}>
                {paths.map((p, i) =>
                  p.isCircle ? (
                    <Circle key={i} cx="50" cy="50" r="50" fill={p.fill} />
                  ) : (
                    <Path key={i} d={p.d} fill={p.fill} stroke="white" strokeWidth="0.5" />
                  ),
                )}
                {texts.map((tx, i) => (
                  <G key={i} rotation={tx.rotation} originX={tx.x} originY={tx.y}>
                    <SvgText
                      x={tx.x}
                      y={tx.y}
                      fill="#fff"
                      fontSize={tx.fontSize}
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {tx.label}
                    </SvgText>
                  </G>
                ))}
                <Circle cx="50" cy="50" r="8" fill="white" stroke="#333" strokeWidth="1" />
                <Circle cx="50" cy="50" r="4" fill="#666" />
              </Svg>
            </Animated.View>
          </View>
        </View>

        <View style={styles.spinBtnContainer}>
          <BouncyButton
            color="pink"
            size="lg"
            style={{ width: "100%" }}
            onPress={spinWheel}
            disabled={isSpinning || players.length < 2}
          >
            {isSpinning ? t.spinning : t.spin}
          </BouncyButton>
        </View>
      </View>

      <Modal transparent visible={modalVisible} animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalPlayerName}>
              {selectedPlayer}
              {t.sTurn}
            </Text>

            {showTruthOrDareChoice ? (
              <View style={styles.choiceRow}>
                <BouncyButton
                  color="blue"
                  size="lg"
                  style={{ flex: 1 }}
                  onPress={() => handleTruthOrDareChoice('truth')}
                >
                  {t.truth}
                </BouncyButton>
                <BouncyButton
                  color="pink"
                  size="lg"
                  style={{ flex: 1 }}
                  onPress={() => handleTruthOrDareChoice('dare')}
                >
                  {t.dare}
                </BouncyButton>
              </View>
            ) : (
              <>
                <View style={styles.questionBox}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.questionText}>{question}</Text>
                  </ScrollView>
                </View>
                <BouncyButton
                  color="blue"
                  size="md"
                  style={{ width: "100%" }}
                  onPress={() => setSelectedPlayer(null)}
                >
                  {t.done}
                </BouncyButton>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: verticalScale(52),
    paddingBottom: verticalScale(16),
    paddingHorizontal: scale(16),
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
  wheelArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  wheelGroup: {
    alignItems: "center",
  },
  pointer: {
    zIndex: 20,
    elevation: 6,
    marginBottom: -scale(20),
  },
  wheelWrapper: {
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: scale(5),
    borderColor: "#fff",
    elevation: 10,
    overflow: "hidden",
  },
  spinBtnContainer: {
    width: "100%",
    maxWidth: scale(280),
    marginTop: verticalScale(16),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: scale(16),
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: scale(28),
    padding: scale(20),
    borderWidth: 8,
    borderColor: "#facc15",
    width: "100%",
    maxWidth: scale(390),
    alignItems: "center",
    elevation: 20,
  },
  modalPlayerName: {
    fontSize: fontScale(24),
    fontWeight: "900",
    color: "#ec4899",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: verticalScale(14),
  },
  choiceRow: {
    flexDirection: "row",
    gap: scale(10),
    width: "100%",
    marginTop: verticalScale(6),
  },
  questionBox: {
    width: "100%",
    backgroundColor: "#f3e8ff",
    borderRadius: scale(18),
    padding: scale(18),
    marginBottom: verticalScale(16),
    borderWidth: 4,
    borderColor: "#d8b4fe",
    maxHeight: verticalScale(150),
  },
  questionText: {
    fontSize: fontScale(17),
    fontWeight: "700",
    color: "#581c87",
    textAlign: "center",
  },
});
