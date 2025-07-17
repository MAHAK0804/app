import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
  Share,
  Alert,
  Dimensions,
  ImageBackground,
} from "react-native";
import Toast from "react-native-root-toast";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import EditIcon from "../assets/whiteedit.svg";
import CustomAlert from "../CustomAlert";
import CopyIcon from "../assets/copyWhite.svg";
import FavIcon from "../assets/heartWhite.svg";
import ShareIcon from "../assets/shareWhite.svg";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/heartfill.svg";
import TextIcon from "../assets/text.svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = SCREEN_HEIGHT - 120;

export default function ShayariFullViewScreen({ route }) {
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const cardRef = useRef(null);
  const shayari = route.params.shayari.text.replace(/\\n/g, "\n");
  const navigation = useNavigation();
  const handleShare = useCallback((item) => {
    setSelectedShayari(item);
    setCustomShareModalVisible(true);
  }, []);

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setCustomAlertVisible(true);
  };
  const handleEdit = useCallback(
    (item) => {
      navigation.navigate("HomeStack", {
        screen: "ShayariEditScreen",
        params: { shayari: item },
      });
    },
    [navigation]
  );

  const shareAsImage = async () => {
    try {
      if (!cardRef.current) return;
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Shayari Image",
        });
      } else {
        showCustomAlert("Error", "Sharing not available on this device.");
      }
      setCustomShareModalVisible(false);
    } catch (error) {
      console.log("Error sharing as image:", error);
      showCustomAlert("Error", "Failed to share as image.");
    }
  };

  const saveToGallery = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        showCustomAlert(
          "Permission Required",
          "Please allow access to save images."
        );
        return;
      }
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Shayari", asset, false);
      showCustomAlert("Success", "Shayari saved to your gallery!");
    } catch (error) {
      console.error("Save Error:", error);
      showCustomAlert("Error", "Failed to save image.");
    } finally {
      setCustomShareModalVisible(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.log("Failed to load favorites", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const isFav = favorites.some((fav) => fav._id === route.params.shayari._id);
  const isCopied = copiedId === route.params.shayari._id;

  const toggleFavorite = (shayari) => {
    const updated = isFav
      ? favorites.filter((item) => item._id !== shayari._id)
      : [...favorites, shayari];
    AsyncStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites(updated);
    Toast.show(isFav ? "Removed from Favorites" : "Added to Favorites", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
  };

  const handleCopy = (item) => {
    Clipboard.setStringAsync(item.text);
    setCopiedId(item._id);
    Toast.show("Copied to clipboard!", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <View style={styles.container}>
      {/* {customAlertVisible && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{alertTitle}</Text>
            <Text style={styles.alertMessage}>{alertMessage}</Text>
            <TouchableOpacity
              onPress={() => setCustomAlertVisible(false)}
              style={styles.alertButton}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )} */}
      <CustomAlert
        visible={customAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setCustomAlertVisible(false)}
      />
      <View style={styles.cardRow}>
        <View ref={cardRef} collapsable={false}>
          <ImageBackground
            source={require("../assets/fullscreenpage.png")}
            style={[
              styles.backgroundCard,
              { width: CARD_WIDTH, height: CARD_HEIGHT },
            ]}
            imageStyle={styles.imageBorder}
            resizeMode="cover"
          >
            <View style={styles.textWrapper}>
              <Text style={styles.shayariText}>{shayari}</Text>
            </View>
          </ImageBackground>
        </View>
      </View>

      <ImageBackground
        source={require("../assets/bgbottom.png")}
        style={styles.actionBar}
      >
        <TouchableOpacity onPress={() => handleCopy(route.params.shayari)}>
          {/* <Ionicons
            name={isCopied ? "checkmark-done-outline" : "copy-outline"}
            size={22}
            color={isCopied ? "green" : "#fff"}
          /> */}
          {isCopied ? (
            <TickIcon width={22} height={20} fill="#000" />
          ) : (
            <CopyIcon width={22} height={20} fill="#000" />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEdit(route.params.shayari)}>
          <EditIcon width={22} height={20} fill="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleShare(route.params.shayari)}>
          {/* <Ionicons name="share-social-outline" size={22} color="#fff" /> */}
          <ShareIcon width={22} height={20} fill="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleFavorite(route.params.shayari)}>
          {/* <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? "#ff4444" : "#fff"}
          /> */}
          {isFav ? (
            <LikedIcon width={22} height={20} fill="#000" />
          ) : (
            <FavIcon width={22} height={20} fill="#000" />
          )}
        </TouchableOpacity>
      </ImageBackground>

      {/* Custom Share Modal */}
      {customShareModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCustomShareModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>

            <View style={styles.previewBox} />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.shareButton, { gap: 7 }]}
                onPress={() => {
                  Share.share({
                    message: selectedShayari?.text.replace(/\\n/g, "\n"),
                  });
                  setCustomShareModalVisible(false);
                }}
              >
                <TextIcon width={22} height={20} fill="#000" />
                <Text style={styles.shareButtonText}>Share Text</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareAsImage}
              >
                <Ionicons
                  name="image-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.shareButtonText}>Share Image</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
              <Ionicons
                name="download-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.shareButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  backgroundCard: { borderTopRightRadius: 12, borderTopLeftRadius: 12 },
  imageBorder: { borderTopRightRadius: 12, borderTopLeftRadius: 12 },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  shayariText: {
    textAlign: "center",
    lineHeight: 24,
    color: "#000",
    width: "100%",
    padding: 10,
    fontSize: 20,
    fontFamily: "Kameron_700Bold",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
  },
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
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    paddingTop: 30,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 4,
    right: 10,
    padding: 6,
    zIndex: 10,
  },
  previewBox: {
    width: "100%",
    height: 140,
    backgroundColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    borderRadius: 30,
    width: "100%",
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  alertOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#08448A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
