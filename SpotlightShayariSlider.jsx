import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  PixelRatio,
} from "react-native";
import { moderateScale, scale, scaleFont, verticalScale } from "./Responsive";
import ShayariCardActions from "./Action";
import CustomShareModal from "./CustomShareModal";

const { width } = Dimensions.get("window");

export default function ShayariSpotlightSlider({
  data = [],
  fetchNewShayaris,
}) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const cardRefs = useRef({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [latestShayaris, setLatestShayaris] = useState(data.slice(0, 3));
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedCardRef, setSelectedCardRef] = useState(null);
  const [selectedShayari, setSelectedShayari] = useState(null);

  const handleShare = useCallback((item, ref) => {
    setSelectedShayari(item);
    setSelectedCardRef(ref);
    setCustomShareModalVisible(true);
  }, []);

  // Fetch new random shayaris
  const refreshShayaris = useCallback(async () => {
    try {
      if (typeof fetchNewShayaris === "function") {
        const newData = await fetchNewShayaris();
        const shuffled = newData.sort(() => 0.5 - Math.random());
        const topThree = shuffled.slice(0, 3);
        setLatestShayaris(topThree);
        setCurrentIndex(0);
        flatListRef.current?.scrollToIndex({ index: 0, animated: false });
      }
    } catch (err) {
      console.error("Error fetching new shayaris:", err);
    }
  }, [fetchNewShayaris]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = currentIndex + 1;

      if (nextIndex < latestShayaris.length) {
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      } else {
        refreshShayaris(); // After last card, fetch new random
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, latestShayaris.length, refreshShayaris]);

  const renderItem = ({ item }) => {
    const currentRef = cardRefs.current[item._id] || React.createRef();
    cardRefs.current[item._id] = currentRef;

    return (
      <View style={styles.card}>
        <Image
          source={require("./assets/Rectangle 22.png")}
          style={styles.bgImage}
        />
        <View style={styles.absoluteContent}>
          <Text style={styles.title}>Shayari Spotlight</Text>
          <View style={styles.captureArea} collapsable={false} ref={currentRef}>
            <Text style={styles.quote}>
              {(item.text || "").replace(/\\n/g, "\n")}
            </Text>
          </View>
          <View style={{ marginBottom: 11, marginRight: 12 }}>
            <ShayariCardActions
              title="SpotLight Shayaris"
              shayari={item}
              filteredShayaris={latestShayaris}
              onShare={() => handleShare(item, currentRef)}
              isSpotlightScreen={true}
            />
          </View>
        </View>
      </View>
    );
  };

  if (!latestShayaris.length) return null;

  return (
    <View>
      <Animated.FlatList
        ref={flatListRef}
        data={latestShayaris}
        keyExtractor={(item) => item._id || item.id}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {latestShayaris.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity: dotOpacity }]}
            />
          );
        })}
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
const fontScale = PixelRatio.getFontScale(); // Usually 1.0, 1.2, 1.5, etc.
const baseFontSize = scaleFont(21); // You already use this as base
const dynamicFontSize = baseFontSize * fontScale;
const dynamicCardHeight = dynamicFontSize * 9.6;

const styles = StyleSheet.create({
  card: {
    width: scale(350),
    // height: dynamicCardHeight,
    minHeight: dynamicCardHeight,
    borderRadius: 18,
    // overflow: "hidden",
    // marginBottom: 10,
    marginHorizontal: 15,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
    borderRadius: 15,
    width: "100%",
    height: "100%",
  },
  captureArea: {
    flex: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  absoluteContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: fontScale * scaleFont(20),
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Kameron_500Medium",
  },
  quote: {
    fontSize: dynamicFontSize,
    color: "#fff",
    lineHeight: dynamicFontSize * 1.4,
    textAlign: "center",
    fontFamily: "Kameron_500Medium",
    marginHorizontal: moderateScale(15),
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
});
