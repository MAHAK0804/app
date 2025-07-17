import React, { useEffect } from "react";
import { ActivityIndicator, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import * as SplashScreen from "expo-splash-screen";

import { ThemeProvider } from "./ThemeContext";
import DrawerNavigation from "./navigation/StackNavigation";
import useCustomFonts from "./hooks/useCustomfonts.js";
import { AuthProvider } from "./AuthContext.js";

SplashScreen.preventAutoHideAsync(); // keep splash until fonts load
LogBox.ignoreAllLogs();
export default function App() {
  const fontsLoaded = useCustomFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootSiblingParent>
          <AuthProvider>
            <DrawerNavigation />
          </AuthProvider>
        </RootSiblingParent>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
