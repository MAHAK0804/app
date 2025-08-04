import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Share,
  Modal,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { captureRef } from "react-native-view-shot";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import axios from "axios";
import Toast from "react-native-root-toast";
import {
  fontScale,
  moderateScale,
  scale,
  scaleFont,
} from "../Responsive";

import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

import NativeCard from "../NativeCardAds";
import { useRewardAd } from "../RewardContext";

import EditIcon from "../assets/edit.svg";
import TextIcon from "../assets/text.svg";
import CopyIcon from "../assets/copy.svg";
import FavIcon from "../assets/favourite ( stroke ).svg";
import ShareIcon from "../assets/share.svg";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/heart.svg";
import Gallery from "../assets/gallery.svg";
import DownloadGallery from "../assets/Download.svg";
import CrossXMark from "../assets/cross.svg";

const CARD_WIDTH = Dimensions.get("screen").width - scale(50);
const CARD_HEIGHT = Dimensions.get("screen").height - scale(550);
const ICON_BAR_HEIGHT = 58;
const bgColors = ["#364149", "#ffffff", "#393649", "#493645", "#213550"];

export default function ShayariFeedScreen() {
  const navigation = useNavigation();
  const { showRewardAd } = useRewardAd();

  // const [data, setShayariList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const [selectedColors, setSelectedColors] = useState({ bg: "#fff", inner: "#fff" });
  const [renderedCount, setRenderedCount] = useState(0);
  const adCooldownRef = useRef(false);
  const captureViewRef = useRef();
  const [data, setShayariList] = useState([]);         // All fetched
  const [visibleData, setVisibleData] = useState([]);  // Shown to user
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [hasMore, setHasMore] = useState(true);


  const fetchShayaris = async (pageNum = 1) => {
    console.log("page", pageNum);
    try {
      setLoading(true);
      const res = await axios.get(`https://hindishayari.onrender.com/api/shayaris?page=${pageNum}&limit=${pageSize}`);

      const fetched = res.data;

      // ✅ Correctly extract shayaris array
      const newShayaris = Array.isArray(fetched.shayaris)
        ? fetched.shayaris
        : [];

      // ✅ Set total shayaris once
      // if (fetched.total) {
      //   setTotalShayaris(fetched.total);
      // }

      if (pageNum === 1) {
        setShayariList(newShayaris);
        setVisibleData(newShayaris);
      } else {
        setShayariList(prev => [...prev, ...newShayaris]);
        setVisibleData(prev => [...prev, ...newShayaris]);
      }

      // ✅ Only update `hasMore` when response contains fewer than pageSize items
      setHasMore(newShayaris.length === pageSize);
    } catch (error) {
      console.log("Error fetching shayaris ->", error);
    } finally {
      setLoading(false);
    }
  };


  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const loadMoreShayaris = async () => {
    if (!hasMore || isFetchingMore) {
      console.log("Not fetching more: hasMore:", hasMore, ", isFetchingMore:", isFetchingMore);
      return;
    }

    console.log("Loading more shayaris...");
    setIsFetchingMore(true);
    const nextPage = page + 1;
    await fetchShayaris(nextPage);
    setPage(nextPage);
    setIsFetchingMore(false);
  };






  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.log("Failed to load favorites", e);
    }
  };
  console.log("visible data", visibleData.length);

  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.log("Failed to save favorites", error);
    }
  };

  const toggleFavorite = useCallback((shayari) => {
    const isFav = favorites.some((item) => item._id === shayari._id);
    const updated = isFav
      ? favorites.filter((item) => item._id !== shayari._id)
      : [...favorites, shayari];
    saveFavorites(updated);
    Toast.show(isFav ? "Removed from Favorites" : "Added to Favorites", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
  }, [favorites]);

  const handleCopy = useCallback((item) => {
    Clipboard.setStringAsync(item.text?.replace(/\\n/g, "\n") || "");
    setCopiedId(item._id);
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
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Shayari Image",
        });
      } else Toast.show("Sharing not available.");
    } catch (error) {
      Toast.show("Failed to share as image.");
    } finally {
      setCustomShareModalVisible(false);
    }
  };

  const saveToGallery = async () => {
    if (!captureViewRef.current) return;
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) return;
      const uri = await captureRef(captureViewRef.current, {
        format: "png",
        quality: 1,
      });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Shayari", asset, false);
      Toast.show("Saved to gallery!", { duration: Toast.durations.SHORT });
    } catch {
      alert("Error", "Failed to save image.");
    } finally {
      setCustomShareModalVisible(false);
    }
  };

  // const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  // const onViewableItemsChanged = useRef(({ viewableItems }) => {
  //   setRenderedCount((prev) => {
  //     const count = prev + viewableItems.length;
  //     if (count >= 6 && !adCooldownRef.current) {
  //       adCooldownRef.current = true;
  //       showRewardAd();
  //       setTimeout(() => (adCooldownRef.current = false), 30000);
  //       return 0;
  //     }
  //     return count;
  //   });
  // }).current;

  const handleEdit = useCallback((item) => {
    navigation.navigate("HomeStack", {
      screen: "ShayariEditScreen",
      params: { shayari: item },
    });
  }, [navigation]);

  const didInit = useRef(false);
  const onEndReachedCalledDuringMomentum = useRef(false);
  useEffect(() => {
    fetchShayaris(1);
    didInit.current = true;
  }, []);


  useEffect(() => {
    console.log("Page:", page);
    console.log("Visible:", visibleData.length);
    console.log("HasMore:", hasMore);
  }, [visibleData, page, hasMore]);

  useFocusEffect(useCallback(() => { loadFavorites(); }, []));

  const ShayariCard = ({ item, index }) => {
    const backgroundColor = bgColors[index % bgColors.length];
    const textColor = backgroundColor === "#ffffff" ? "#111" : "#fff";
    const isFavorite = favorites.some((fav) => fav._id === item._id);
    const isCopied = copiedId === item._id;

    return (
      <View style={[styles.card, { backgroundColor }]}>
        <View style={styles.textWrapper}>
          <Text style={[styles.text, { color: textColor }]}>
            {item.text.replace(/\\n/g, "\n")}
          </Text>
        </View>
        <View style={styles.iconBar}>
          <TouchableOpacity onPress={() => handleCopy(item)}>
            {isCopied ? <TickIcon width={40} height={40} fill="#000" /> : <CopyIcon width={40} height={40} fill="#000" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <EditIcon width={40} height={40} fill="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleFavorite(item)}>
            {isFavorite ? <LikedIcon width={22} height={20} fill="#000" /> : <FavIcon width={40} height={40} fill="#000" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare(item, null, index)}>
            <ShareIcon width={40} height={40} fill="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={[styles.list, { flex: 1, justifyContent: "center" }]}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  return (
    <>
      <FlatList
        data={visibleData}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            onEndReachedCalledDuringMomentum.current = true;
            loadMoreShayaris();
          }
        }}
        onEndReachedThreshold={0.1}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <>
            <ShayariCard item={item} index={index} />
            {(index + 1) % 5 === 0 && (
              <View style={{ width: "100%", alignItems: "center" }}>
                <NativeCard />
              </View>
            )}
          </>
        )}
        // onViewableItemsChanged={onViewableItemsChanged}
        // viewabilityConfig={viewabilityConfig}

        ListFooterComponent={() =>
          isFetchingMore ? (
            <ActivityIndicator size="small" color="#999" style={{ marginVertical: 20 }} />
          ) : null
        }

      />

      {customShareModalVisible && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCustomShareModalVisible(false)}
              >
                <CrossXMark width={40} height={40} fill="#000" />
              </TouchableOpacity>
              <View
                style={{ position: "absolute", top: -9999, left: -9999 }}
                ref={captureViewRef}
                collapsable={false}
              >
                <View
                  style={[styles.card, {
                    backgroundColor: selectedColors.bg,
                    justifyContent: "center",
                    padding: 20,
                    height: CARD_HEIGHT,
                    width: CARD_WIDTH - 13,
                  }]}
                >
                  <Text
                    style={[styles.text, {
                      color: selectedColors.bg === "#ffffff" ? "#111" : "#fff",
                    }]}
                  >
                    {selectedShayari?.text.replace(/\\n/g, "\n")}
                  </Text>
                </View>
              </View>

              <NativeCard />

              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.shareButton, { gap: 7 }]} onPress={() => {
                  Share.share({ message: selectedShayari?.text.replace(/\\n/g, "\n") });
                  setCustomShareModalVisible(false);
                }}>
                  <TextIcon width={16} height={20} fill="#000" />
                  <Text style={styles.shareButtonText}>Share Text</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.shareButton, { gap: 7 }]} onPress={shareAsImage}>
                  <Gallery width={16} height={20} fill="#000" />
                  <Text style={styles.shareButtonText}>Share Image</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.saveButton, { gap: 7 }]} onPress={saveToGallery}>
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

const styles = StyleSheet.create({
  list: {
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 10,
    marginBottom: moderateScale(25),
  },
  card: {
    width: CARD_WIDTH,
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
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    paddingTop: 30,
    alignItems: "center",
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
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19173D",
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    textAlign: "center",
  },
});