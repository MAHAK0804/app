import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share } from "react-native";
import TextIcon from "./assets/text.svg";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { fontScale, moderateScale, scale, scaleFont } from "./Responsive";
import Gallery from "./assets/gallery.svg";
import DownloadGallery from "./assets/Download.svg";
import CrossXMark from "./assets/cross.svg";
import NativeCard from "./NativeCardAds";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRewardAd } from "./RewardContext";

export default function CustomShareModal({
  visible,
  onClose,
  cardRef,
  shayari,
}) {
  if (!visible) return null;

  const shareAsImage = async () => {
    try {
      const uri = await captureRef(cardRef.current, {
        format: "png",
        quality: 1,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);

      } else {
        alert("Sharing not available");
      }
      onClose();
    } catch (e) {
      console.log("Share image error:", e);
      alert("Failed to share image");
    }
  };
  // const { showRewardAd } = useRewardAd();
  const saveToGallery = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        alert("Permission required to save image");
        return;
      }

      const uri = await captureRef(cardRef.current, {
        format: "png",
        quality: 1,
      });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Shayari", asset, false);
      // const current = Number(await AsyncStorage.getItem("Sharecount")) || 0;
      // const updatedCount = current + 1;
      // console.log("share count ", updatedCount);

      // await AsyncStorage.setItem("Sharecount", String(updatedCount));

      // ✅ Show ad after every 3 copies
      // if (updatedCount % 3 === 0) {
      //   showRewardAd(); // <-- You must define this function (see below)
      // }
      alert("Saved to gallery");
      onClose();
    } catch (e) {
      console.log("Save error:", e);
      alert("Failed to save");
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <CrossXMark width={22} height={20} fill="#000" />
        </TouchableOpacity>

        <NativeCard />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.shareButton, { gap: 7 }]}
            onPress={() => {
              Share.share({
                message: shayari?.text.replace(/\\n/g, "\n"),
              });
              onClose();
            }}
          >
            <TextIcon width={16} height={20} fill="#000" />
            <Text style={styles.shareButtonText}>Share Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, { gap: 7 }]}
            onPress={shareAsImage}
          >
            <Gallery width={16} height={20} fill="#000" />

            <Text style={styles.shareButtonText}>Share Image</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { gap: 7 }]}
          onPress={saveToGallery}
        >
          <DownloadGallery width={16} height={20} fill="#000" />

          <Text style={styles.shareButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalBox: {
    // width: 300,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    paddingTop: 30,
    alignItems: "center",
    position: "relative",
    marginHorizontal: moderateScale(50),
  },
  closeButton: {
    position: "absolute",
    top: 4,
    right: 10,
    padding: 6,
    zIndex: 10,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // width: "100%",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  saveButton: {
    margin: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    borderRadius: 30,
    width: scale(250),
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(12),
    // fontWeight: "600",
    textAlign: "center",
  },
});
