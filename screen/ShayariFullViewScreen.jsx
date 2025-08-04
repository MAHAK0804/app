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
import CustomAlert from "../CustomAlert";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/heart.svg";
import ShayariCardActions from "../Action";
import CustomShareModal from "../CustomShareModal";
import { fontScale, scale, scaleFont } from "../Responsive";
import WhiteCopyIcon from "../assets/copy.svg";
import WhiteFavIcon from "../assets/favourite ( stroke ).svg";
import WhiteEditIcon from "../assets/edit.svg";
import WhiteShareIcon from "../assets/share.svg";
import { useRewardAd } from "../RewardContext";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = SCREEN_HEIGHT - scale(240);

export default function ShayariFullViewScreen({ route }) {
  console.log(route.params);
  const insets = useSafeAreaInsets();

  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const [shayaris, setShaayris] = useState(null);
  const cardRef = useRef(null);
  // const shayari = route.params.shayari.text.replace(/\\n/g, "\n");
  const navigation = useNavigation();
  const [isFav, setIsFav] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = useCallback((item) => {
    setSelectedShayari(item);
    setCustomShareModalVisible(true);
  }, []);



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
  // const { showRewardAd } = useRewardAd();
  const handleCopy = async () => {
    if (!shayaris) return;

    await Clipboard.setStringAsync(shayaris.text);

    // // Track copy count
    // const current = Number(await AsyncStorage.getItem("Copycount")) || 0;
    // const updatedCount = current + 1;
    // console.log("updateCount", updatedCount);

    // await AsyncStorage.setItem("Copycount", String(updatedCount));

    // // ✅ Show ad after every 3 copies
    // if (updatedCount % 3 === 0) {
    //   showRewardAd(); // <-- You must define this function (see below)
    // }

    setCopiedId(shayaris._id);
    setIsCopied(true);

    setTimeout(() => {
      setCopiedId(null);
      setIsCopied(false);
    }, 2000);
  };


  const toggleFavorite = async () => {
    if (!shayaris) return;

    const isAlreadyFav = favorites.some((fav) => fav._id === shayaris._id);
    const updatedFavorites = isAlreadyFav
      ? favorites.filter((fav) => fav._id !== shayaris._id)
      : [...favorites, shayaris];

    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      setIsFav(!isAlreadyFav); // update UI state
      Toast.show(
        isAlreadyFav ? "Removed from Favorites" : "Added to Favorites",
        {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        }
      );
    } catch (e) {
      console.error("Failed to update favorites", e);
    }
  };

  useEffect(() => {
    if (shayaris) {
      setIsCopied(copiedId === shayaris._id);
      const isAlreadyFav = favorites.some((fav) => fav._id === shayaris._id);
      setIsFav(isAlreadyFav);
    }
  }, [shayaris, favorites, copiedId]);

  const { shayariList, initialIndex } = route.params;

  const flatListRef = useRef(null);

  console.log("isFav", isFav);

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
      const currentShayari = viewableItems[0].item;
      setShaayris(currentShayari);

      // Update copied state
      setIsCopied(copiedId === currentShayari._id);

      // Update favorite state
      const isAlreadyFav = favorites.some((fav) => fav._id === currentShayari._id);
      setIsFav(isAlreadyFav);
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
                  console.log(shayari);

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

      <View style={styles.actionsDark}>
        <TouchableOpacity onPress={handleCopy}>
          {isCopied ? (
            <TickIcon width={40} height={40} />
          ) : (
            <WhiteCopyIcon width={40} height={40} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleFavorite}>
          {isFav ? (
            <LikedIcon width={25} height={40} />
          ) : (
            <WhiteFavIcon width={40} height={40} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!shayaris) return;
            if (route.params.title === "My Post Shayari") {
              navigation.navigate("HomeStack", {
                screen: "Writeshayari",
                params: { shayari: shayaris }
              })
            } else {

              navigation.navigate("HomeStack", {
                screen: "ShayariEditScreen",
                params: { shayari: shayaris },
              });
            }
          }}
        >
          <WhiteEditIcon width={40} height={40} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleShare(shayaris)}>
          <WhiteShareIcon width={40} height={40} />
        </TouchableOpacity>
      </View>



      {/* Custom Share Modal */}
      <CustomShareModal
        visible={customShareModalVisible}
        shayari={selectedShayari}
        onClose={() => setCustomShareModalVisible(false)}
        cardRef={cardRef}
      />
      <View style={{ position: 'absolute', bottom: insets.bottom, left: 0, right: 0 }}>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
            networkExtras: {
              collapsible: "bottom",
            },
          }}
        />
      </View>
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
  actionsDark: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 9,
    backgroundColor: "#191734",
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  }

});
