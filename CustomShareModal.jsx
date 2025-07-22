import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TextIcon from "./assets/text.svg";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { fontScale, moderateScale, scale, scaleFont } from "./Responsive";
import Gallery from "./assets/gallery.svg";
import DownloadGallery from "./assets/Download.svg";
import CrossXMark from "./assets/cross-circle 1.svg";

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

        <View style={styles.previewBox} />

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
            <TextIcon width={22} height={20} fill="#000" />
            <Text style={styles.shareButtonText}>Share Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, { gap: 7 }]}
            onPress={shareAsImage}
          >
            <Gallery width={22} height={20} fill="#000" />

            <Text style={styles.shareButtonText}>Share Image</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { gap: 7 }]}
          onPress={saveToGallery}
        >
          <DownloadGallery width={22} height={20} fill="#000" />

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
  previewBox: {
    width: 300,
    height: 140,
    backgroundColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginHorizontal: 4,
    flex: 1,
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
