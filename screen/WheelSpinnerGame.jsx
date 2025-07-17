import React from "react";
import { SafeAreaView } from "react-native";
import CustomWheel from "../CustomGame";

export default function WheelSpinnerGame() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#c2185b" }}>
      <CustomWheel />
    </SafeAreaView>
  );
}
