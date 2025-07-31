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
  Dimensions,
  NativeModules,
} from "react-native";
import { useTheme } from "../ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import ShayariCardActions from "../Action";
import CustomShareModal from "../CustomShareModal";
import { fontScale, scale, scaleFont } from "../Responsive";
import {
  BannerAd,
  BannerAdSize,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import NativeAdCard from "../NativeCardAds";
import NativeCard from "../NativeCardAds";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 30;
const CARD_HEIGHT = CARD_WIDTH * 0.92;
const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, {
  requestNonPersonalizedAdsOnly: true,
});
export default function ShayariListScreen({ route }) {
  const cardRefs = useRef({});
  const insets = useSafeAreaInsets();
  const { type, title } = route.params || {};
  const { theme } = useTheme();
  const [shayariList, setShayariList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedCardRef, setSelectedCardRef] = useState(null);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const [categoryClickCount, setCategoryClickCount] = useState(0);

  const { userId } = useContext(AuthContext);

  const [rewardLoaded, setRewardLoaded] = useState(false);
  console.log("RewardedAdEventType", RewardedAdEventType);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setRewardLoaded(true)
    );

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward of ', reward);
        // Optional: show toast or logic
      }
    );

    // const unsubscribeClosed = rewarded.addAdEventListener(
    //   RewardedAdEventType.CLOSED,
    //   () => {
    //     setRewardLoaded(false);
    //     rewarded.load(); // Load next ad
    //   }
    // );

    // Initial load
    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      // unsubscribeClosed();
    };
  }, [categoryClickCount]);
  const showRewardAd = async () => {
    if (rewardLoaded) {
      try {
        await rewarded.show();        // 👈 Wait for ad to close
        setRewardLoaded(false);       // 👈 Mark ad as shown
        rewarded.load();              // 👈 Preload next ad
      } catch (e) {
        console.log("Reward Ad show error:", e);
      }
    } else {
      console.log("Reward ad not loaded yet, trying to load now.");
      rewarded.load();
    }
  };


  useEffect(() => {
    setLoading(true);

    if (type === "all") {
      fetchAllShayaris();
      fetchCategories();
    } else if (type === "mine") {
      fetchMyShayaris();
    } else if (type === "category" && route.params?.categoryId) {
      fetchCategoryShayaris(route.params.categoryId);
    } else if (type === "favorites") {
      fetchFavoritesList();
    }

    loadFavorites(); // Always load favorites for heart icon
  }, [type, route.params?.categoryId]);

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

  const fetchFavoritesList = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const parsed = stored ? JSON.parse(stored) : [];
      setShayariList(parsed);
    } catch (e) {
      console.log("Failed to load favorites list", e);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(parsed); // Only for heart icon state
    } catch (e) {
      console.log("Failed to load favorites", e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/categories"
      );
      const reversed = res.data.reverse();
      setCategories(reversed);
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };
  const handleRemoveFromFavorites = (shayariId) => {
    if (type === "favorites") {
      setShayariList((prev) => prev.filter((item) => item._id !== shayariId));
    }

    // Also update heart icon state
    setFavorites((prev) => prev.filter((item) => item._id !== shayariId));
  };

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

  const filteredShayaris = useMemo(() => {
    if (type !== "all") return shayariList;
    if (selectedCategory === "All") return shayariList;
    return shayariList.filter((item) => item.categoryId === selectedCategory);
  }, [shayariList, selectedCategory, type]);

  const handleShare = useCallback((item, ref) => {
    setSelectedShayari(item);
    setSelectedCardRef(ref);
    setCustomShareModalVisible(true);
  }, []);

  const ShayariCard = ({ item, index }) => {
    const currentRef = cardRefs.current[item._id] || React.createRef();
    cardRefs.current[item._id] = currentRef;
    if ((index + 1) % 5 === 0) {

      return (
        <>
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

              <ShayariCardActions
                title={route.params.title}
                shayari={item}
                filteredShayaris={filteredShayaris}
                favorites={favorites} // ✅ Pass for heart icon
                onShare={() => handleShare(item, currentRef)}
                isCat={true}
                onFavoriteToggle={handleRemoveFromFavorites}
              />
            </View>
          </View>
          <NativeCard />
          {/* <BannerAd
            unitId={TestIds.BANNER}
            size={BannerAdSize.MEDIUM_RECTANGLE}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdLoaded={() => console.log('Ad Loaded')}
            onAdFailedToLoad={(error) => console.error('Ad Load Error', error)}
          /> */}
        </>
      );
    };
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

          <ShayariCardActions
            title={route.params.title}
            shayari={item}
            filteredShayaris={filteredShayaris}
            favorites={favorites} // ✅ Pass for heart icon
            onShare={() => handleShare(item, currentRef)}
            isCat={true}
            onFavoriteToggle={handleRemoveFromFavorites}
          />
        </View>
      </View>
    )
  }

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
                    onPress={() => {
                      const isAll = item._id === "all";
                      const newCategory = isAll ? "All" : item._id;
                      setSelectedCategory(newCategory);

                      setCategoryClickCount((prev) => {
                        const newCount = prev + 1;
                        console.log("Category Click Count:", newCount);

                        if (newCount % 4 === 0) {
                          // showAd();
                          console.log("Ad should be shown now");
                          showRewardAd();

                        }

                        return newCount;
                      });
                    }}
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
                        fontSize: fontScale * scaleFont(13),
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
            <>

              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No Shayari Found</Text>
              </View>
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
            </>
          ) : (
            <>

              <FlatList
                data={filteredShayaris}
                renderItem={({ item, index }) => <ShayariCard item={item} index={index} />}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: 16 }}
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
            </>


          )}
        </>
      )}
      <CustomShareModal
        visible={customShareModalVisible}
        onClose={() => setCustomShareModalVisible(false)}
        cardRef={selectedCardRef}
        shayari={selectedShayari}
      />
    </View>
  );
}

const styles = StyleSheet.create({


  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: scale(35),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", // Optional: dynamic from theme
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: "center",
    marginBottom: scale(16),
  },
  card: { width: "100%", height: "100%", borderRadius: 12 },
  captureArea: { flex: 1, overflow: "hidden" },
  imageBackground: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  shayariText: {
    fontSize: fontScale * scaleFont(22),
    color: "#000",
    textAlign: "center",
    lineHeight: fontScale * scaleFont(22) * 1.4,
    fontFamily: "Kameron_500Medium",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: fontScale * scaleFont(18),
    color: "#888",
    fontWeight: "500",
  },
});
