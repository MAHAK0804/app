// ShayariListScreen.js
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
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
} from "react-native-google-mobile-ads";
import NativeCard from "../NativeCardAds";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 30;
const CARD_HEIGHT = CARD_WIDTH * 0.92;
const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED, {
  requestNonPersonalizedAdsOnly: true,
});

const API_URL = "https://hindishayari.onrender.com/api";
const ITEMS_PER_PAGE = 6;

export default function ShayariListScreen({ route }) {
  const cardRefs = useRef({});
  const insets = useSafeAreaInsets();
  const { type } = route.params || {};
  const { theme } = useTheme();

  const [shayariList, setShayariList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedCardRef, setSelectedCardRef] = useState(null);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const [categoryClickCount, setCategoryClickCount] = useState(0);

  const { userId } = useContext(AuthContext);
  const [rewardLoaded, setRewardLoaded] = useState(false);

  const rewardedAdRef = useRef(null);

  // --- REWARDED AD LOGIC ---
  useEffect(() => {
    rewardedAdRef.current = rewarded;
    const unsubscribeLoaded = rewardedAdRef.current.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setRewardLoaded(true)
    );
    const unsubscribeEarned = rewardedAdRef.current.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => console.log("User earned reward of ", reward)
    );

    rewardedAdRef.current.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  const showRewardAd = async () => {
    if (rewardLoaded) {
      try {
        await rewardedAdRef.current.show();
      } catch (e) {
        console.log("Reward Ad show error:", e);
      }
    } else {
      console.log("Reward ad not loaded yet, trying to load now.");
    }
  };

  // --- DATA FETCHING LOGIC ---

  const fetchShayaris = useCallback(
    async (pageNum, categoryId, isInitialFetch = false) => {
      if (isFetchingMore && !isInitialFetch) return;
      console.log(categoryId);

      if (isInitialFetch) {
        setInitialLoading(true);
        setShayariList([]);
        setPage(1);
        setHasMore(true);
      } else if (!hasMore) {
        return;
      }
      setIsFetchingMore(true);

      try {
        const categoryQuery = categoryId && categoryId !== "All" ? `&category=${categoryId}` : "";
        const res = await axios.get(
          `${API_URL}/shayaris?page=${pageNum}&limit=${ITEMS_PER_PAGE}${categoryQuery}`
        );

        const newShayaris = res.data.shayaris || [];
        setShayariList((prev) =>
          isInitialFetch ? newShayaris : [...prev, ...newShayaris]
        );
        setHasMore(newShayaris.length === ITEMS_PER_PAGE);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching shayaris ->", error);
        setHasMore(false);
      } finally {
        setInitialLoading(false);
        setIsFetchingMore(false);
        setLoading(false);
      }
    },
    [isFetchingMore, hasMore]
  );

  const fetchMyShayaris = async () => {
    setInitialLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/shayaris/all`);
      setShayariList(res.data.filter((el) => el.userId._id === userId));
    } catch (error) {
      console.error("Error fetching my shayaris ->", error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  const fetchFavoritesList = async () => {
    setInitialLoading(true);
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const parsed = stored ? JSON.parse(stored) : [];
      setShayariList(parsed);
    } catch (e) {
      console.error("Failed to load favorites list", e);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const parsed = stored ? JSON.parse(stored) : [];
      setFavorites(parsed);
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data.reverse());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // --- USEEFFECT HOOKS ---

  useEffect(() => {
    loadFavorites();
    if (type === "all") {
      fetchCategories();
      // Initial fetch for "All" category, using server-side filtering
      fetchShayaris(1, "All", true);
    } else if (type === "mine") {
      fetchMyShayaris();
    } else if (type === "favorites") {
      fetchFavoritesList();
    } else if (type === "category" && route.params?.categoryId) {
      // Fetch for a specific category passed from the route
      fetchShayaris(1, route.params.categoryId, true);
      setSelectedCategory(route.params.categoryId);
    }
  }, [type, route.params?.categoryId]);

  // This useEffect now runs only when a new category is selected on the "All" screen.
  // It triggers a fresh API call for that category's data.
  useEffect(() => {
    if (type === "all") {
      fetchShayaris(1, selectedCategory, true);
    }
  }, [selectedCategory, type]);

  // --- HANDLERS ---

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore && !initialLoading) {
      fetchShayaris(page + 1, selectedCategory, false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    const newCategory = categoryId === "all" ? "All" : categoryId;
    setSelectedCategory(newCategory);
    setCategoryClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount % 3 === 0) {
        showRewardAd();
      }
      return newCount;
    });
  };

  const handleShare = useCallback((item, ref) => {
    setSelectedShayari(item);
    setSelectedCardRef(ref);
    setCustomShareModalVisible(true);
  }, []);

  const handleRemoveFromFavorites = (shayariId) => {
    if (type === "favorites") {
      setShayariList((prev) => prev.filter((item) => item._id !== shayariId));
    }
    setFavorites((prev) => prev.filter((item) => item._id !== shayariId));
  };

  // --- SHAYARI CARD COMPONENT ---
  const ShayariCard = ({ item, index }) => {
    const currentRef = cardRefs.current[item._id] || React.createRef();
    cardRefs.current[item._id] = currentRef;
    console.log(item);

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
              title={item.title}
              shayari={item}
              favorites={favorites}
              onShare={() => handleShare(item, currentRef)}
              onFavoriteToggle={handleRemoveFromFavorites}
              filteredShayaris={shayariList}
            />
          </View>
        </View>
        {((index + 1) % 5 === 0) && (
          <NativeCard />
        )}
      </>
    );
  };

  // --- RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
                onPress={() => handleCategoryChange(item._id)}
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

      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4E47A7" />
        </View>
      ) : (
        <>
          {shayariList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No Shayari Found</Text>
            </View>
          ) : (
            <FlatList
              data={shayariList}
              renderItem={({ item, index }) => (
                <ShayariCard item={item} index={index} />
              )}
              keyExtractor={(item) => item._id}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.7}
              ListFooterComponent={() =>
                isFetchingMore ? (
                  <ActivityIndicator size="small" color="#999" style={{ marginVertical: 20 }} />
                ) : null
              }
              contentContainerStyle={{
                paddingHorizontal: scale(10),
                paddingBottom: insets.bottom + 60,
              }}
            />
          )}
        </>
      )}

      <View style={{ position: "absolute", bottom: insets.bottom, left: 0, right: 0 }}>
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
    paddingBottom: scale(75),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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