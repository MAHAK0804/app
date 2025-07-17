import React, { useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ShayariSpotlightSlider({ data = [] }) {
  const scrollX = useRef(new Animated.Value(0)).current;

  const latestShayaris = useMemo(() => data.slice(0, 3), [data]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={require("./assets/Rectangle 22.png")} // fallback static background
        style={styles.bgImage}
      />
      <View style={styles.absoluteContent}>
        <Text style={styles.title}>Shayari Spotlight</Text>
        <Text style={styles.quote}>
          {(item.text || "").replace(/\\n/g, "\n")}
        </Text>
      </View>
    </View>
  );

  if (!latestShayaris.length) return null;

  return (
    <View>
      <Animated.FlatList
        data={latestShayaris}
        keyExtractor={(item) => item._id || item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width - 30,
    height: 215,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 10,
    marginHorizontal: 20,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
    borderRadius: 15,
  },
  absoluteContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 23,
    color: "#fff",
    marginBottom: 50,
    fontFamily: "Kameron_500Medium",
  },
  quote: {
    fontSize: 21,
    color: "#fff",
    fontWeight: "500",
    lineHeight: 26,
    textAlign: "center",
    fontFamily: "Kameron_500Medium",
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
