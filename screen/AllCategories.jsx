import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import SvgImageWithFallback from "../SvgImage";

const { width } = Dimensions.get("window");
const numColumns = 3;
const cardSize = width / numColumns - 20;

export default function AllCategories() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://hindishayari.onrender.com/api/categories/"
      );
      setCategories(response.data.reverse());
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4E47A7" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background, flex: 1 }}>
      <View style={styles.section}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
          numColumns={numColumns}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContent}
          initialNumToRender={12}
          maxToRenderPerBatch={15}
          windowSize={5}
          removeClippedSubviews
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 6,
    paddingTop: 10,
    paddingBottom: 20,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
    fontFamily: "Manrope_700Bold",
  },
});
