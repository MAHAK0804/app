import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Share,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-root-toast";
import { captureRef } from "react-native-view-shot";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import EditIcon from "../assets/whiteedit.svg";
import TextIcon from "../assets/text.svg";
import CopyIcon from "../assets/copyWhite.svg";
import FavIcon from "../assets/heartWhite.svg";
import ShareIcon from "../assets/shareWhite.svg";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/heart.svg";
import { fontScale, moderateScale, scale, scaleFont } from "../Responsive";
import Gallery from "../assets/gallery.svg";
import DownloadGallery from "../assets/Download.svg";
import CrossXMark from "../assets/cross-circle 1.svg";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import NativeAdCard from "../NativeCardAds";
import NativeCard from "../NativeCardAds";
const CARD_WIDTH = Dimensions.get("screen").width - 20;
const CARD_HEIGHT = Dimensions.get("screen").height - 550;
const ICON_BAR_HEIGHT = 58;

const bgColors = ["#364149", "#ffffff", "#393649", "#493645", "#213550"];

export default function ShayariFeedScreen() {
  const [data, setShayariList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const [selectedColors, setSelectedColors] = useState({
    bg: "#fff",
    inner: "#fff",
  });
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const captureViewRef = useRef();

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

  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.log("Failed to save favorites", error);
    }
  };

  const toggleFavorite = useCallback(
    (shayari) => {
      const isFav = favorites.some((item) => item._id === shayari._id);
      const updated = isFav
        ? favorites.filter((item) => item._id !== shayari._id)
        : [...favorites, shayari];

      saveFavorites(updated);

      Toast.show(isFav ? "Removed from Favorites" : "Added to Favorites", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    },
    [favorites]
  );

  const handleCopy = useCallback((item) => {
    const formattedText = item.text?.replace(/\\n/g, "\n") || "";
    Clipboard.setStringAsync(formattedText);
    setCopiedId(item._id);
    Toast.show("Copied to clipboard!", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleShare = useCallback((item, _, index) => {
    const bg = bgColors[index % bgColors.length];
    setSelectedShayari(item);
    setSelectedColors({ bg });
    setCustomShareModalVisible(true);
  }, []);

  const shareAsImage = async () => {
    if (!captureViewRef.current) return;

    try {
      const uri = await captureRef(captureViewRef.current, {
        format: "png",
        quality: 1,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Shayari Image",
        });
      } else {
        Toast.show("Sharing not available.");
      }
    } catch (error) {
      console.error("Error sharing as image:", error);
      Toast.show("Failed to share as image.");
    } finally {
      setCustomShareModalVisible(false);
    }
  };

  const saveToGallery = async () => {
    if (!captureViewRef.current) return;

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        alert("Permission Required", "Please allow access to save images.");
        return;
      }

      const uri = await captureRef(captureViewRef.current, {
        format: "png",
        quality: 1,
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Shayari", asset, false);

      Toast.show("Saved to gallery!", {
        duration: Toast.durations.SHORT,
      });
    } catch (error) {
      console.error("Save Error:", error);
      alert("Error", "Failed to save image.");
    } finally {
      setCustomShareModalVisible(false);
    }
  };

  const fetchShayaris = async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/shayaris/"
      );
      const shuffled = res.data.sort(() => 0.5 - Math.random());
      setShayariList(shuffled);
    } catch (error) {
      console.log("Error fetching shayaris ->", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShayaris();
  }, []);
  const handleEdit = useCallback(
    (item) => {
      navigation.navigate("HomeStack", {
        screen: "ShayariEditScreen",
        params: { shayari: item },
      });
    },
    [navigation]
  );
  const ShayariCard = ({ item, index, onCopy, onFavorite, onShare }) => {
    const backgroundColor = bgColors[index % bgColors.length];
    // const innerBackground = innerBg[index % innerBg.length];
    const textColor = backgroundColor === "#ffffff" ? "#111" : "#fff";
    const isFavorite = favorites.some((fav) => fav._id === item._id);
    const isCopied = copiedId === item._id;
    if ((index + 1) % 5 === 0) {
      return (
        <>
          <View style={[styles.card, { backgroundColor }]}>
            <View style={styles.textWrapper}>
              <Text style={[styles.text, { color: textColor }]}>
                {item.text.replace(/\\n/g, "\n")}
              </Text>
            </View>

            <View style={styles.iconBar}>
              <TouchableOpacity onPress={() => onCopy(item)}>
                {isCopied ? (
                  <TickIcon width={22} height={20} fill="#000" />
                ) : (
                  <CopyIcon width={22} height={20} fill="#000" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <EditIcon width={22} height={20} fill="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onFavorite(item)}>
                {isFavorite ? (
                  <LikedIcon width={22} height={20} fill="#000" />
                ) : (
                  <FavIcon width={22} height={20} fill="#000" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onShare(item, null, index)}>
                <ShareIcon width={22} height={20} fill="#000" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ width: "100%", alignItems: "center" }}>

            {/* <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.MEDIUM_RECTANGLE}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              onAdLoaded={() => console.log('Ad Loaded')}
              onAdFailedToLoad={(error) => console.error('Ad Load Error', error)}
            /> */}
            <NativeCard />
          </View>
        </>
      );
    }
    return (
      <View style={[styles.card, { backgroundColor }]}>
        <View style={styles.textWrapper}>
          <Text style={[styles.text, { color: textColor }]}>
            {item.text.replace(/\\n/g, "\n")}
          </Text>
        </View>

        <View style={styles.iconBar}>
          <TouchableOpacity onPress={() => onCopy(item)}>
            {isCopied ? (
              <TickIcon width={22} height={20} fill="#000" />
            ) : (
              <CopyIcon width={22} height={20} fill="#000" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <EditIcon width={22} height={20} fill="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onFavorite(item)}>
            {isFavorite ? (
              <LikedIcon width={22} height={20} fill="#000" />
            ) : (
              <FavIcon width={22} height={20} fill="#000" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onShare(item, null, index)}>
            <ShareIcon width={22} height={20} fill="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };



  if (loading) {
    return (
      <View style={[styles.list, { justifyContent: "center", flex: 1 }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          // Check if it's a position to show banner
          // const isBannerPosition = (index + 1) % 10 === 0;
          // console.log("isBanner", index, isBannerPosition);

          return (
            <>
              <ShayariCard
                item={item}
                index={index}
                onCopy={handleCopy}
                onFavorite={toggleFavorite}
                onShare={handleShare}
              />
              {/* {isBannerPosition && <StartAppBanner />} */}
            </>
          );
        }}
      />
      {customShareModalVisible && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCustomShareModalVisible(false)}
              >
                <CrossXMark width={22} height={20} fill="#000" />
              </TouchableOpacity>

              {/* HIDDEN VIEW TO CAPTURE */}
              <View
                style={{ position: "absolute", top: -9999, left: -9999 }}
                ref={captureViewRef}
                collapsable={false}
              >
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: selectedColors.bg,
                      justifyContent: "center",
                      padding: 20,
                      height: CARD_HEIGHT,
                      width: CARD_WIDTH - 13,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        color:
                          selectedColors.bg === "#ffffff" ? "#111" : "#fff",
                      },
                    ]}
                  >
                    {selectedShayari?.text.replace(/\\n/g, "\n")}
                  </Text>
                </View>
              </View>

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
        </Modal>
      )}
    </>
  );
}
const FONTSIZE = Dimensions.get("screen").fontScale;

const styles = StyleSheet.create({
  list: {
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 10,
    marginBottom: moderateScale(25),
  },
  card: {
    width: CARD_WIDTH - 13,
    height: CARD_HEIGHT,
    borderRadius: 16,
    marginVertical: 10,
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  text: {
    fontSize: fontScale * scaleFont(22),
    lineHeight: fontScale * scaleFont(22) * 1.4,
    textAlign: "center",
    fontFamily: "Kameron_500Medium",
  },
  iconBar: {
    height: ICON_BAR_HEIGHT,
    width: "100%",
    backgroundColor: "#15202C",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 50,
    PaddingHorizontal: 20,
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
    width: 250,
    height: 140,
    backgroundColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
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
    paddingHorizontal: 15,
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
    width: scale(210),
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(12),
    // fontWeight: "600",
    textAlign: "center",
  },
});
