import React, { useEffect } from "react";
import { NativeModules, TouchableOpacity, View } from "react-native";

const { StartAppModule } = NativeModules;

const showStartAppVideo = () => {
  StartAppModule.showVideoAd();
};

const showStartAppInterstitial = () => {
  StartAppModule.showInterstitial();
};

export default function Ads() {
  useEffect(() => {
    showStartAppVideo();
  }, []);
  return (
    <View>
      <TouchableOpacity onPress={() => showStartAppInterstitial()}>
        <Text>Ads</Text>
      </TouchableOpacity>
    </View>
  );
}
