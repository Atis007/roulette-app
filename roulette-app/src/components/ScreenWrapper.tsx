import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "../context/GameContext";

export function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const { language, setLanguage } = useGame();

  return (
    <ImageBackground
      source={require("../../assets/bg.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom", "left", "right"]}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLanguage(language === "en" ? "hu" : "en")}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>
              {language === "en" ? "🇬🇧" : "🇭🇺"}
            </Text>
          </TouchableOpacity>

          <View style={styles.inner}>{children}</View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  inner: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignItems: "center",
  },
  langBtn: {
    position: "absolute",
    top: 8,
    right: 16,
    zIndex: 60,
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  langText: {
    fontSize: 22,
  },
});
