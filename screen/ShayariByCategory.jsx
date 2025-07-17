// ShayariListScreen.js
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Image,
  Share,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-root-toast";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { AuthContext } from "../AuthContext";
import ExpandIcon from "../assets/expand.svg";
import EditIcon from "../assets/edit.svg";
import CopyIcon from "../assets/copy.svg";
import FavIcon from "../assets/favourite.svg";
import ShareIcon from "../assets/share.svg";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/heart.svg";
import TextIcon from "../assets/text.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 30;
const CARD_HEIGHT = CARD_WIDTH * 0.92;

export default function ShayariListScreen({ route }) {
  console.log(route.params);
  const cardRefs = useRef({});

  const { type, title } = route.params || {};
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [shayariList, setShayariList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedCardRef, setSelectedCardRef] = useState(null);
  const [selectedShayari, setSelectedShayari] = useState(null);

  const fetchAllShayaris = async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/shayaris"
      );
      setShayariList(res.data);
    } catch (error) {
      console.log("Error fetching all shayaris:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyShayaris = async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/users/shayaris/all"
      );

      setShayariList(res.data.filter((el) => el.userId._id == userId));
    } catch (error) {
      console.log("Error fetching shayaris ->", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(parsed);
      setShayariList(parsed); // For type === "favorites"
    } catch (e) {
      console.log("Failed to load favorites", e);
    } finally {
      setLoading(false);
    }
  };
  const { userId } = useContext(AuthContext);
  useEffect(() => {
    setLoading(true);

    if (type === "all") {
      fetchAllShayaris();
      fetchCategories();
    } else if (type === "mine") {
      fetchMyShayaris();
    } else if (type === "category" && route.params?.categoryId) {
      fetchCategoryShayaris(route.params.categoryId);
    }
    loadFavorites();
  }, [type, route.params?.categoryId]);
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/categories"
      );
      const reversed = res.data.reverse(); // optional
      setCategories(reversed);
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };
  const filteredShayaris = useMemo(() => {
    if (type !== "all") return shayariList;

    if (selectedCategory === "All") return shayariList;

    return shayariList.filter((item) => item.categoryId === selectedCategory);
  }, [shayariList, selectedCategory, type]);

  const fetchCategoryShayaris = async (categoryId) => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/shayaris"
      );
      const filtered = res.data.filter(
        (item) => item.categoryId === categoryId
      );
      setShayariList(filtered);
    } catch (error) {
      console.log("Error fetching category shayaris:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = useCallback(
    (shayari) => {
      const isFav = favorites.some((item) => item._id === shayari._id);
      const updated = isFav
        ? favorites.filter((item) => item._id !== shayari._id)
        : [...favorites, shayari];

      AsyncStorage.setItem("favorites", JSON.stringify(updated));
      setFavorites(updated);

      if (type === "favorites") setShayariList(updated); // update list if you're on favs screen

      Toast.show(isFav ? "Removed from Favorites" : "Added to Favorites", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    },
    [favorites]
  );

  const handleCopy = useCallback((item) => {
    Clipboard.setStringAsync(item.text);
    setCopiedId(item._id);
    Toast.show("Copied to clipboard!", {
      duration: Toast.durations.LONG,
      position: Toast.positions.TOP,
    });
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleShare = useCallback((item, ref) => {
    setSelectedShayari(item);
    setSelectedCardRef(ref);
    setCustomShareModalVisible(true);
  }, []);

  const shareAsImage = async () => {
    try {
      if (!selectedCardRef?.current) return;
      const uri = await captureRef(selectedCardRef.current, {
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
        showCustomAlert("Error", "Sharing not available on this device.");
      }
      setCustomShareModalVisible(false);
    } catch (error) {
      console.log("Error sharing as image:", error);
      showCustomAlert("Error", "Failed to share as image.");
    }
  };

  const handleExpand = useCallback(
    (item) => {
      navigation.navigate("HomeStack", {
        screen: "ShayariFullView",
        params: { shayari: item, title },
      });
    },
    [navigation, title]
  );
  const handleEdit = useCallback(
    (item) => {
      navigation.navigate("HomeStack", {
        screen: "ShayariEditScreen",
        params: { shayari: item },
      });
    },
    [navigation, title]
  );

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
      const uri = await captureRef(selectedCardRef, {
        format: "png",
        quality: 1,
      });
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

  const ShayariCard = ({ item, type }) => {
    const isFav = favorites.some((fav) => fav._id === item._id);
    const isCopied = copiedId === item._id;

    const currentRef = cardRefs.current[item._id] || React.createRef();
    cardRefs.current[item._id] = currentRef;

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <View style={styles.captureArea} collapsable={false} ref={currentRef}>
            <ImageBackground
              source={require("../assets/shayaribgZoom.png")}
              resizeMode="cover"
              style={styles.imageBackground}
              imageStyle={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: 12,
              }}
            >
              <View style={styles.content}>
                <Text style={styles.shayariText}>
                  {item.text.replace(/\\n/g, "\n")}
                </Text>
              </View>
            </ImageBackground>
          </View>

          <View
            style={[
              styles.actions,
              {
                backgroundColor: type === "category" ? "#FFF0F0" : "#fff",
              },
            ]}
          >
            <TouchableOpacity onPress={() => handleCopy(item)}>
              {isCopied ? (
                <TickIcon width={22} height={20} fill="#000" />
              ) : (
                <CopyIcon width={22} height={20} fill="#000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => toggleFavorite(item)}>
              {isFav ? (
                <LikedIcon width={22} height={20} fill="#000" />
              ) : (
                <FavIcon width={22} height={20} fill="#000" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleEdit(item)}>
              <EditIcon width={22} height={20} fill="#000" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleShare(item, currentRef)}>
              <ShareIcon width={22} height={20} fill="#000" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleExpand(item)}>
              <ExpandIcon width={22} height={20} fill="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4E47A7" />
        </View>
      ) : (
        <>
          {type === "all" && (
            <FlatList
              data={[{ _id: "all", title: "All" }, ...categories]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isActive =
                  (item._id === "all" && selectedCategory === "All") ||
                  selectedCategory === item._id;

                return (
                  <TouchableOpacity
                    onPress={() =>
                      item._id === "all"
                        ? setSelectedCategory("All")
                        : setSelectedCategory(item._id)
                    }
                    style={{
                      paddingHorizontal: 14,
                      height: 36,
                      borderRadius: 20,
                      marginHorizontal: 4,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: isActive ? "#fff" : "#191734",
                      backgroundColor: "#191734",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "normal",
                        fontSize: 13,
                        fontFamily: "Kameron_400Regular",
                        textAlignVertical: "center",
                        includeFontPadding: false,
                      }}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          {filteredShayaris.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No Shayari Found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredShayaris}
              renderItem={({ item }) => <ShayariCard item={item} type={type} />}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
        </>
      )}

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
  container: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: "center",
    marginBottom: 16,
  },
  card: { width: "100%", height: "100%", borderRadius: 12 },
  captureArea: { flex: 1, overflow: "hidden" },
  imageBackground: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  shayariText: {
    fontSize: 22,
    color: "#000",
    textAlign: "center",
    lineHeight: 30,
    // paddingHorizontal: 16,/
    fontFamily: "Kameron_500Medium",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyImage: {
    width: 200,
    height: 200,
    opacity: 0.6,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontWeight: "500",
  },

  actions: {
    width: CARD_WIDTH,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
});
