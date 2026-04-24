import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameProvider } from "./src/context/GameContext";
import { GameTypeScreen } from "./src/screens/GameTypeScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { NeverHaveIEverScreen } from "./src/screens/NeverHaveIEverScreen";
import { PlayerInputScreen } from "./src/screens/PlayerInputScreen";
import { SpinnerScreen } from "./src/screens/SpinnerScreen";
import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <GameProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="GameType" component={GameTypeScreen} />
            <Stack.Screen name="Players" component={PlayerInputScreen} />
            <Stack.Screen name="Spinner" component={SpinnerScreen} />
            <Stack.Screen name="NeverHaveIEver" component={NeverHaveIEverScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GameProvider>
    </SafeAreaProvider>
  );
}
