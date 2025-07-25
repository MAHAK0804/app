import React, { useEffect } from "react";
import { requireNativeComponent, View, NativeModules } from "react-native";

const StartAppBanner = requireNativeComponent("StartAppBanner");
const { StartAppAds } = NativeModules;

export default function StartAppBannerView() {
  useEffect(() => {
    StartAppAds.initialize("206206234");
  }, []);

  return (
    <View style={{ height: 50 }}>
      <StartAppBanner style={{ flex: 1 }} />
    </View>
  );
}
