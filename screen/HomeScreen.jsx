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
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShayariFeedScreen from "./ShayariFeedScreen";
import { AuthContext } from "../AuthContext";
import SvgImageWithFallback from "../SvgImage";
import WritePencil from "../assets/pencil 2 (1).svg";
import AllShayari from "../assets/allshayariicon.svg";
import MyShayari from "../assets/myshayariicon.svg";
import Fav from "../assets/favouriteicon.svg";
import WheelSpin from "../assets/wheelspin.svg";

const { width } = Dimensions.get("screen");
const numColumns = 3;
const cardSize = width / numColumns - 20;
const iconSize = PixelRatio.roundToNearestPixel(44);
const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [spotlightShayaris, setSpotlightShayaris] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [isLogin, setIsLogin] = useState(false);
  const { userId, isLogin } = useContext(AuthContext);
  console.log("userId", userId);

  const getSpotlightShayaris = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/shayaris/"
      );
      const randomShayaris = res.data
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSpotlightShayaris(randomShayaris);
    } catch (error) {
      console.error("Error fetching spotlight shayaris:", error);
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

  // useFocusEffect(
  //   useCallback(() => {
  //     const checkLogin = async () => {
  //       const val = await AsyncStorage.getItem("IsLogin");
  //       setIsLogin(val === "true");
  //     };
  //     checkLogin();
  //   }, [])
  // );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getAllCategories(), getSpotlightShayaris()]);
      setLoading(false);
    };
    fetchData();
  }, [getAllCategories, getSpotlightShayaris]);

  const toggleShowAll = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

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
          <SvgImageWithFallback uri={item.iconUrl} size={44} />
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
  console.log(theme.background);

  return (
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
          data={showAll ? categories : categories.slice(0, 9)}
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
          {/* <View style={styles.iconWrapper}>
            <WritePencil />
          </View> */}

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
      <View style={styles.contestBox}>
        {/* <Image
          source={require("../assets/fortune-wheel 2.png")}
          style={styles.contestIcon}
        /> */}
        <WheelSpin />
        <View>
          <Text style={styles.contestHeading}>Spin The Wheel</Text>
          <Text style={styles.contestText}>
            Play shyari game and unlock{"\n"} surprises
          </Text>
          <TouchableOpacity
            style={styles.playbtn}
            onPress={() => navigation.navigate("WheelGame")}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: "Kameron_700Bold",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Play Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spotlight Shayaris */}
      <ShayariSpotlightSlider data={spotlightShayaris} />

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
                <item.icon width={28} height={28} />
              </View>

              {/* <Image source={item.icon} style={styles.quickIcon} /> */}
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
  );
};

export default React.memo(HomeScreen);
const FONTSIZE = Dimensions.get("screen").fontScale;
const WIDTH = Dimensions.get("screen").width;
const PADDINGHORIZONTAL = Dimensions.get("screen").scale;
const HEIGHT = Dimensions.get("screen").height;
console.log("fontsize->>>>", FONTSIZE);
console.log("width->>>>", WIDTH);
console.log("height->>>>", HEIGHT);
console.log("scale->>>>", PADDINGHORIZONTAL);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1B1B1D",
  },
  section: {
    paddingHorizontal: PADDINGHORIZONTAL + 4,
    paddingTop: 10,
  },
  titleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  titleText: {
    fontSize: FONTSIZE + 19,
    color: "#fff",
    fontFamily: "Manrope_700Bold",
  },
  viewAll: {
    color: "#FFFFFF",
    fontSize: FONTSIZE + 13,
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
    marginBottom: 4,
  },
  title: {
    fontSize: FONTSIZE + 17,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
    maxWidth: cardSize,
    fontFamily: "Manrope_700Bold",
  },
  writeBox: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#1F2B35",
    paddingVertical: PADDINGHORIZONTAL + 20,
    paddingHorizontal: 2,
    borderRadius: 16,
    alignItems: "center",
  },
  writeHeading: {
    color: "#ffffff",
    fontSize: FONTSIZE + 20,
    textAlign: "center",
    lineHeight: 30,
    fontFamily: "Manrope_400Regular",
  },
  writeButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: PADDINGHORIZONTAL + 10,
    width: WIDTH - 100,
    marginVertical: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  iconWrapper: {
    width: 40,
    height: 40,
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
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  buttonTitle: {
    textAlign: "center",
    color: "#000",
    fontSize: FONTSIZE + 20,
    fontFamily: "Kameron_600SemiBold",
  },

  toggleBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  contestBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D457E",
    marginHorizontal: PADDINGHORIZONTAL + 14,
    marginVertical: 20,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  contestIcon: {
    width: 116,
    height: 116,
    resizeMode: "contain",
  },
  contestText: {
    color: "#fff",
    fontSize: FONTSIZE + 16,
    lineHeight: FONTSIZE + 20,
    fontFamily: "Kameron_400Regular",
    marginVertical: 8,
  },
  contestHeading: {
    color: "#fff",
    fontSize: FONTSIZE + 19,
    fontFamily: "Kameron_700Bold",
  },
  playbtn: {
    backgroundColor: "#6784CA",
    borderRadius: 40,
    padding: PADDINGHORIZONTAL + 10,
    color: "#fff",
    marginVertical: 5,
    width: 120,
    elevation: 2,
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
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  quickText: {
    fontSize: FONTSIZE + 17,
    fontFamily: "Kameron_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    opacity: 0.1,
  },
  postsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  postsTitle: {
    fontSize: FONTSIZE + 17,
    fontWeight: "bold",
  },
  postCard: {
    width: 250,
    padding: 16,
    borderRadius: 12,
    marginRight: 10,
  },
  postText: {
    fontSize: FONTSIZE + 13,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
