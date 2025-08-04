import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, LogBox, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from "react-native-root-siblings";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAds } from "react-native-google-mobile-ads";

import { ThemeProvider } from "./ThemeContext";
import DrawerNavigation from "./navigation/StackNavigation";
import useCustomFonts from "./hooks/useCustomfonts.js";
import { AuthProvider } from "./AuthContext.js";
import { RewardAdProvider } from "./RewardContext.js";
import Toast from "react-native-root-toast";
// import AdController from "./AdController.jsx"; // uncomment later when needed

SplashScreen.preventAutoHideAsync();
LogBox.ignoreAllLogs();

export default function App() {
  const fontsLoaded = useCustomFonts();
  const [isReady, setIsReady] = useState(false);

  // ✅ Safe AdMob initialization
  useEffect(() => {
    const initAds = async () => {
      try {
        if (Platform.OS === "android") {
          const status = await MobileAds().initialize();
          if (__DEV__) {
            console.log("AdMob initialized:", status);
          }
        }
      } catch (error) {
        Toast.show("Please check your internet or Play Services.", {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      }
    };

    initAds();
  }, []);

  // ✅ Hide splash when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [fontsLoaded]);

  if (!isReady) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RewardAdProvider>
        <ThemeProvider>
          <RootSiblingParent>
            <AuthProvider>
              <SafeAreaProvider>
                <StatusBar
                  backgroundColor="transparent"
                  barStyle="light-content"
                  translucent={true}
                />
                <DrawerNavigation />
                {/* ✅ Uncomment when ads are fully tested */}
                {/* <AdController /> */}
              </SafeAreaProvider>
            </AuthProvider>
          </RootSiblingParent>
        </ThemeProvider>
      </RewardAdProvider>
    </GestureHandlerRootView>
  );
}
