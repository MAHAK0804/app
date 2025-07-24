import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  FlatList,
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
import LikedIcon from "../assets/heart.svg";
import TextIcon from "../assets/text.svg";
import ShayariCardActions from "../Action";
import CustomShareModal from "../CustomShareModal";
import { fontScale, scale, scaleFont } from "../Responsive";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = SCREEN_HEIGHT - 165;

export default function ShayariFullViewScreen({ route }) {
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const [shayaris, setShaayris] = useState("");
  const cardRef = useRef(null);
  // const shayari = route.params.shayari.text.replace(/\\n/g, "\n");
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
  const { shayariList, initialIndex } = route.params;

  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && initialIndex >= 0) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 100);
    }
  }, [initialIndex]);
  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 80,
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setShaayris(viewableItems[0].item);
    }
  });

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={customAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setCustomAlertVisible(false)}
      />
      <View style={styles.cardRow}>
        <View ref={cardRef} collapsable={false}>
          <ImageBackground
            source={require("../assets/image_1.webp")}
            style={[
              styles.backgroundCard,
              { width: CARD_WIDTH, height: CARD_HEIGHT },
            ]}
            imageStyle={styles.imageBorder}
            resizeMode="cover"
          >
            <View style={styles.textWrapper}>
              <FlatList
                ref={flatListRef}
                data={shayariList}
                keyExtractor={(item) => item._id}
                pagingEnabled
                snapToAlignment="center"
                showsVerticalScrollIndicator={false}
                getItemLayout={(data, index) => ({
                  length: CARD_HEIGHT,
                  offset: CARD_HEIGHT * index,
                  index,
                })}
                initialNumToRender={3}
                windowSize={5}
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => {
                  const shayari = item.text.replace(/\\n/g, "\n");
                  return (
                    <View
                      style={{
                        height: CARD_HEIGHT,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 20,
                      }}
                    >
                      <Text style={styles.shayariText}>{shayari}</Text>
                    </View>
                  );
                }}
              />
            </View>
          </ImageBackground>
        </View>
      </View>

      <ShayariCardActions
        onShare={() => handleShare(shayaris)}
        shayari={shayaris}
        isExpand={false}
        isBg={true}
      />

      {/* Custom Share Modal */}
      <CustomShareModal
        visible={customShareModalVisible}
        shayari={selectedShayari}
        onClose={() => setCustomShareModalVisible(false)}
        cardRef={cardRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 20,
  },
  // backgroundCard: { borderTopRightRadius: 12, borderTopLeftRadius: 12 },
  // imageBorder: { borderTopRightRadius: 12, borderTopLeftRadius: 12 },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
  },
  shayariText: {
    textAlign: "center",
    lineHeight: fontScale * scaleFont(22) * 1.4,
    color: "#000",
    // width: "100%",
    // padding: 10,
    fontSize: fontScale * scaleFont(22),
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
    fontSize: fontScale * scaleFont(14),
    fontWeight: "600",
  },
});
