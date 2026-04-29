import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BouncyButton } from "../components/BouncyButton";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useGame } from "../context/GameContext";
import { translations } from "../data/translations";
import type { RootStackParamList } from "../types/navigation";
import { fontScale, scale, verticalScale } from "../utils/responsive";

type Nav = NativeStackNavigationProp<RootStackParamList, "Players">;

function PlayerItem({
  name,
  onRemove,
  onEdit,
  onDuplicate,
}: {
  name: string;
  onRemove: () => void;
  onEdit: (newName: string) => boolean;
  onDuplicate: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-50)).current;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const cancellingRef = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }),
    ]).start();
  }, [opacity, translateX]);

  const confirmEdit = () => {
    if (cancellingRef.current) {
      cancellingRef.current = false;
      return;
    }
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) {
      setDraft(name);
      setEditing(false);
      return;
    }
    const ok = onEdit(trimmed);
    if (!ok) {
      onDuplicate();
      setDraft(name);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    cancellingRef.current = true;
    setDraft(name);
    setEditing(false);
  };

  return (
    <Animated.View
      style={[styles.playerItem, { opacity, transform: [{ translateX }] }]}
    >
      {editing ? (
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={confirmEdit}
          onBlur={confirmEdit}
          autoFocus
          returnKeyType="done"
          autoCapitalize="characters"
          style={styles.editInput}
        />
      ) : (
        <TouchableOpacity
          style={{ flex: 1, marginRight: scale(10) }}
          onPress={() => {
            setDraft(name);
            setEditing(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.playerName} numberOfLines={1}>
            {name.toUpperCase()}
          </Text>
        </TouchableOpacity>
      )}

      {editing ? (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPressIn={() => {
            cancellingRef.current = true;
          }}
          onPress={cancelEdit}
          activeOpacity={0.8}
        >
          <Text style={styles.removeX}>✕</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={onRemove}
          activeOpacity={0.8}
        >
          <Text style={styles.removeX}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

export function PlayerInputScreen() {
  const navigation = useNavigation<Nav>();
  const {
    players,
    addPlayer,
    removePlayer,
    editPlayer,
    language,
    loadQuestions,
    questionsLoading,
  } = useGame();
  const t = translations[language];
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (players.includes(trimmed)) {
      Alert.alert(t.duplicatePlayerTitle, t.duplicatePlayerMsg, [{ text: "OK" }]);
      return;
    }
    addPlayer(trimmed);
    setName("");
  };

  const handleStart = () => {
    if (players.length >= 2) {
      navigation.navigate("Spinner");
    } else {
      Alert.alert("", t.needMorePlayers);
    }
  };

  return (
    <ScreenWrapper>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>{t.back}</Text>
          </TouchableOpacity>

          <View style={styles.container}>
            <View style={styles.inputCard}>
              <Text style={styles.inputTitle}>{t.whosPlaying}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t.enterPlayerName}
                placeholderTextColor="#9ca3af"
                style={[styles.input, focused && styles.inputFocused]}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={handleAdd}
                returnKeyType="done"
                autoCapitalize="characters"
              />
              <BouncyButton
                color="blue"
                size="md"
                style={{ width: "100%" }}
                onPress={handleAdd}
              >
                + {t.addPlayer}
              </BouncyButton>
            </View>

            <View style={styles.listCard}>
              <Text style={styles.listTitle}>
                {t.players} ({players.length})
              </Text>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.listScroll}
                showsVerticalScrollIndicator={false}
              >
                {players.length === 0 ? (
                  <Text style={styles.emptyText}>{t.noPlayers}</Text>
                ) : (
                  players.map((p, i) => (
                    <PlayerItem
                      key={p}
                      name={p}
                      onRemove={() => removePlayer(i)}
                      onEdit={(newName) => editPlayer(i, newName)}
                      onDuplicate={() =>
                        Alert.alert(t.duplicatePlayerTitle, t.duplicatePlayerMsg, [
                          { text: "OK" },
                        ])
                      }
                    />
                  ))
                )}
                <View style={{ height: verticalScale(72) }} />
              </ScrollView>

              {!keyboardVisible && (
                <View style={styles.startBtnContainer}>
                  <BouncyButton
                    color="green"
                    size="md"
                    style={{ width: "100%" }}
                    onPress={handleStart}
                    disabled={players.length < 2 || questionsLoading}
                  >
                    {questionsLoading ? "..." : `${t.startGame} ▶`}
                  </BouncyButton>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: scale(400),
    alignSelf: "center",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(52),
    paddingBottom: verticalScale(8),
    gap: verticalScale(12),
  },
  backBtn: {
    position: "absolute",
    top: verticalScale(14),
    left: scale(14),
    zIndex: 20,
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
  inputCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: scale(28),
    padding: scale(20),
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    gap: verticalScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  inputTitle: {
    fontSize: fontScale(22),
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    fontSize: fontScale(16),
    fontWeight: "700",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: scale(22),
    borderWidth: 4,
    borderColor: "#60a5fa",
    color: "#1f2937",
    elevation: 2,
  },
  inputFocused: {
    borderColor: "#ec4899",
  },
  listCard: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: scale(28),
    padding: scale(14),
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  listTitle: {
    fontSize: fontScale(17),
    fontWeight: "700",
    color: "#fde047",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: verticalScale(10),
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  listScroll: {
    gap: verticalScale(8),
  },
  playerItem: {
    backgroundColor: "#fff",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 4,
    borderBottomColor: "#d1d5db",
    elevation: 3,
  },
  playerName: {
    fontSize: fontScale(16),
    fontWeight: "900",
    color: "#1f2937",
    flex: 1,
    marginRight: scale(10),
  },
  removeBtn: {
    backgroundColor: "#ef4444",
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#6b7280",
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  removeX: {
    color: "#fff",
    fontSize: fontScale(13),
    fontWeight: "700",
  },
  editInput: {
    flex: 1,
    fontSize: fontScale(16),
    fontWeight: "900",
    color: "#1f2937",
    borderBottomWidth: 2,
    borderBottomColor: "#ec4899",
    marginRight: scale(10),
    paddingVertical: verticalScale(2),
  },
  emptyText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: fontScale(14),
    fontStyle: "italic",
    textAlign: "center",
    marginTop: verticalScale(20),
  },
  startBtnContainer: {
    position: "absolute",
    bottom: scale(10),
    left: scale(10),
    right: scale(10),
    zIndex: 10,
  },
});
