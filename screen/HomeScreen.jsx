import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
  useContext,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  PixelRatio,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import ShayariSpotlightSlider from "../SpotlightShayariSlider";
const PostSlider = React.lazy(() => import("../PostSlider"));
import ShayariFeedScreen from "./ShayariFeedScreen";
import { AuthContext } from "../AuthContext";
import SvgImageWithFallback from "../SvgImage";
import AllShayari from "../assets/allshayariicon.svg";
import MyShayari from "../assets/myshayariicon.svg";
import Fav from "../assets/favouriteicon.svg";
import WheelSpin from "../assets/wheelspin.svg";
import { fontScale, moderateScale, scale, scaleFont } from "../Responsive";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("screen");
const numColumns = 3;
const cardSize = width / numColumns - 20;
const iconSize = PixelRatio.roundToNearestPixel(44);
const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [spotlightShayaris, setSpotlightShayaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, isLogin } = useContext(AuthContext);

  const getSpotlightShayaris = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/shayaris/"
      );
      const randomShayaris = res.data
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      return randomShayaris; // ✅ Only return the data
    } catch (error) {
      console.error("Error fetching spotlight shayaris:", error);
      return []; // fallback
    }
  }, []);


  const getAllCategories = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/categories/"
      );
      setCategories(res.data.reverse());
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getAllCategories();
      const shayaris = await getSpotlightShayaris();
      setSpotlightShayaris(shayaris); // ✅ Only here we set it once
      setLoading(false);
    };
    fetchData();
  }, [getAllCategories, getSpotlightShayaris]);

  const quickLinks = useMemo(
    () => [
      {
        icon: AllShayari,
        title: "All Shayari",
        type: "all",
        route: "Allshayaris",
      },
      {
        icon: MyShayari,
        title: "My Shayari",
        type: "mine",

        route: "MyShayari",
      },
      {
        icon: Fav,
        title: "Favourites",
        type: "favorites",

        route: "Favourite",
      },
    ],
    []
  );

  const renderCategory = useCallback(
    ({ item }) => (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() =>
            navigation.navigate("Shayari", {
              type: "category",
              title: item.title,
              categoryId: item._id,
            })
          }
        >
          <SvgImageWithFallback uri={item.iconUrl} />
        </TouchableOpacity>
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
      </View>
    ),
    [navigation, theme.card, theme.text]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4E47A7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ backgroundColor: theme.background, flex: 1 }}>
        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.titleHeader}>
            <Text style={styles.titleText}>Categories</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllCategories")}
            >
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories.slice(0, 9)}
            contentContainerStyle={styles.gridContent}
            keyExtractor={(item) => item._id}
            numColumns={numColumns}
            scrollEnabled={false}
            renderItem={renderCategory}
            initialNumToRender={9}
            removeClippedSubviews
            maxToRenderPerBatch={9}
            windowSize={5}
          />
        </View>

        {/* Write Shayari Box */}
        <View style={styles.writeBox}>
          <Text style={styles.writeHeading}>लिखो अपनी कहानी, शायरी</Text>
          <Text style={styles.writeHeading}>की ज़ुबान में</Text>
          <TouchableOpacity
            style={styles.writeButton}
            onPress={() =>
              isLogin
                ? navigation.navigate("Writeshayari")
                : navigation.navigate("LoginScreen")
            }
          >
            <View style={styles.iconWrapper}>
              <Image
                source={require("../assets/pencil 2.png")}
                style={styles.pencilIcon}
              />
            </View>

            <View style={{ marginLeft: 12 }}>
              <Text
                style={styles.buttonTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Write Your Own Shayari
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contest Section */}
        {/* <View style={styles.contestBox}>
          <View style={styles.wheelIconWrapper}>
            <WheelSpin width={scale(116)} height={scale(116)} />
          </View>
          <View>
            <Text style={styles.contestHeading}>Spin The Wheel</Text>
            <Text style={styles.contestText}>
              Play shyari game and unlock{"\n"}surprises
            </Text>
            <TouchableOpacity
              style={styles.playbtn}
              onPress={() => navigation.navigate("WheelGame")}
            >
              <Text style={styles.playbtnText}>Play now</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Spotlight Shayaris */}
        <ShayariSpotlightSlider
          data={spotlightShayaris}
          fetchNewShayaris={getSpotlightShayaris}
        />

        {/* Quick Links */}
        <View
          style={[styles.quickLinksContainer, { backgroundColor: theme.card }]}
        >
          <FlatList
            data={quickLinks}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickRow}
                onPress={() =>
                  navigation.navigate("Shayari", {
                    type: item.type,
                    title: item.title,
                  })
                }
              >
                <View style={styles.quickIcon}>
                  <item.icon width={scale(28)} height={scale(28)} />
                </View>

                <Text style={[styles.quickText, { color: theme.text }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            scrollEnabled={false}
          />
        </View>

        {/* Posts Slider */}
        {userId && (
          <Suspense fallback={<ActivityIndicator size="small" color="#4E47A7" />}>
            <PostSlider />
          </Suspense>
        )}
        {/* Shayri Feed */}
        <Text
          style={[styles.titleText, { paddingHorizontal: 20, marginVertical: 3 }]}
        >
          Most Loved Shayaris
        </Text>
        <ShayariFeedScreen />
      </ScrollView>
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
};

export default React.memo(HomeScreen);
const WIDTH = Dimensions.get("screen").width;
const PADDINGHORIZONTAL = Dimensions.get("screen").scale;
const HEIGHT = Dimensions.get("screen").height;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B1B1D",
  },
  section: {
    paddingHorizontal: moderateScale(4),
    paddingTop: 10,
  },
  titleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(10),
    marginBottom: moderateScale(16),
  },
  titleText: {
    fontSize: fontScale * scaleFont(19),
    color: "#fff",
    fontFamily: "Manrope_700Bold",
  },
  viewAll: {
    color: "#FFFFFF",
    fontSize: fontScale * scaleFont(16),
    fontFamily: "Manrope_500Medium",
  },
  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    margin: 7,
    width: cardSize,
  },
  card: {
    width: cardSize,
    height: cardSize,
    borderRadius: 20,
    margin: 5,
    backgroundColor: "#2C273C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: iconSize,
    height: iconSize,
    borderRadius: 12,
    marginBottom: moderateScale(4),
  },
  title: {
    fontSize: fontScale * scaleFont(17),
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
    maxWidth: cardSize,
    fontFamily: "Manrope_700Bold",
  },
  writeBox: {
    minHeight: scale(120), // ensures space for both lines
    marginHorizontal: moderateScale(10),
    marginVertical: moderateScale(20),
    backgroundColor: "#1F2B35",
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(16),
    alignItems: "center",
    justifyContent: "center", // ✅ vertically center content
  },

  writeHeading: {
    color: "#ffffff",
    fontSize: scaleFont(20), // more consistent cross-device
    textAlign: "center",
    lineHeight: scaleFont(26),
    fontFamily: "Manrope_500Medium", // slightly bolder for clarity
    paddingHorizontal: 10, // allow breathing room on smaller screens
  },

  writeButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    width: WIDTH - 100,
    marginVertical: moderateScale(20),
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  iconWrapper: {
    width: scale(40),
    height: scale(40),
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },

  pencilIcon: {
    width: scale(22),
    height: scale(22),
    resizeMode: "contain",
  },
  buttonTitle: {
    textAlign: "center",
    color: "#000",
    fontSize: fontScale * scaleFont(16),
    fontFamily: "Kameron_600SemiBold",
  },

  contestBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D457E",
    marginHorizontal: moderateScale(14),
    marginVertical: moderateScale(20),
    borderRadius: 16,
    padding: moderateScale(14),
    gap: 10,
  },

  wheelIconWrapper: {
    width: scale(90),
    height: scale(48),
    justifyContent: "center",
    alignItems: "center",
  },

  contestHeading: {
    color: "#fff",
    fontSize: fontScale * scaleFont(16),
    fontFamily: "Kameron_700Bold",
  },
  contestText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(14),
    lineHeight: fontScale * scaleFont(22),
    fontFamily: "Kameron_400Regular",
    marginVertical: 2,
  },
  playbtn: {
    backgroundColor: "#6784CA",
    borderRadius: 40,
    padding: moderateScale(10),
    color: "#fff",
    marginVertical: 5,
    width: scale(120),
    elevation: 2,
    textAlign: "center",
  },
  playbtnText: {
    color: "#fff",
    fontFamily: "Kameron_700Bold",
    fontSize: fontScale * scaleFont(14),
    textAlign: "center",
  },

  quickLinksContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 20,
  },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  quickIcon: {
    width: scale(30),
    height: scale(28),
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  quickText: {
    fontSize: fontScale * scaleFont(17),
    fontFamily: "Kameron_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    opacity: 0.1,
  },
});
