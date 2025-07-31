import React, { useContext, useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import CopyIcon from "./assets/copy.svg";
import TickIcon from "./assets/tick.svg";
import FavIcon from "./assets/favourite.svg";
import LikedIcon from "./assets/heart.svg";
import EditIcon from "./assets/edit.svg";
import ShareIcon from "./assets/share.svg";
import ExpandIcon from "./assets/expand.svg";
import WhiteCopyIcon from "./assets/copyWhite.svg";
import WhiteFavIcon from "./assets/heartWhite.svg";
import WhiteEditIcon from "./assets/whiteedit.svg";
import WhiteShareIcon from "./assets/shareWhite.svg";
import WhiteExpandIcon from "./assets/expand (1) 1.svg";
import BlackTick from "./assets/tick black.svg";
import Toast from "react-native-root-toast";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function ShayariCardActions({
  title,
  shayari,
  filteredShayaris,
  onFavoriteToggle,
  onShare,
  isSpotlightScreen = false,
  isExpand = true,
  isEdit = true,
  isBg = false,
  isCat = false,
}) {
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    checkIsFav();
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shayari.text);
    setCopied(true);
    // Toast.show("Copied to clipboard!");
    // setTimeout(() => setCopied(false), 2000);
  };

  const checkIsFav = async () => {
    const stored = await AsyncStorage.getItem("favorites");
    const parsed = stored ? JSON.parse(stored) : [];
    setIsFav(parsed.some((item) => item._id === shayari._id));
  };

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const parsed = stored ? JSON.parse(stored) : [];

      const alreadyFav = parsed.find((item) => item._id === shayari._id);
      let updated;
      if (alreadyFav) {
        updated = parsed.filter((item) => item._id !== shayari._id);
        Toast.show("Removed from Favorites");

        // ✅ Notify parent to remove from visible list (if on Favorites screen)
        if (onFavoriteToggle) {
          onFavoriteToggle(shayari._id);
        }
      } else {
        updated = [...parsed, shayari];
        Toast.show("Added to Favorites");
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      setIsFav(!alreadyFav);
    } catch (e) {
      console.log("Failed to toggle favorite", e);
    }
  };

  const handleEdit = () => {
    if (title === "My Post Shayari") {
      navigation.navigate("Writeshayari", {
        shayari: shayari,
      });
    }
    else {

      navigation.navigate("HomeStack", {
        screen: "ShayariEditScreen",
        params: { shayari },
      });
    }
  };

  const handleExpand = () => {
    navigation.navigate("HomeStack", {
      screen: "ShayariFullView",
      params: {
        title,
        shayariList: filteredShayaris,
        shayari,
        initialIndex: filteredShayaris.findIndex((s) => s._id === shayari._id),
      },
    });
  };

  const getActionStyle = () => {
    if (isBg) return styles.actionsDark;
    if (isSpotlightScreen) return styles.actions2;
    return styles.actions;
  };

  return (
    <View style={getActionStyle()}>
      <TouchableOpacity onPress={handleCopy}>
        {copied ? (
          isCat ? (
            <BlackTick width={22} height={20} />
          ) : (
            <TickIcon width={22} height={20} />
          )
        ) : isSpotlightScreen || isBg ? (
          <WhiteCopyIcon width={22} height={20} />
        ) : (
          <CopyIcon width={22} height={20} />
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleFavorite}>
        {isFav ? (
          <LikedIcon width={22} height={20} />
        ) : isSpotlightScreen || isBg ? (
          <WhiteFavIcon width={22} height={20} />
        ) : (
          <FavIcon width={22} height={20} />
        )}
      </TouchableOpacity>

      {isEdit && (
        <TouchableOpacity onPress={handleEdit}>
          {isSpotlightScreen || isBg ? (
            <WhiteEditIcon width={22} height={20} />
          ) : (
            <EditIcon width={22} height={20} />
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onShare}>
        {isSpotlightScreen || isBg ? (
          <WhiteShareIcon width={22} height={20} />
        ) : (
          <ShareIcon width={22} height={20} />
        )}
      </TouchableOpacity>

      {isExpand && (
        <TouchableOpacity onPress={handleExpand}>
          {isSpotlightScreen || isBg ? (
            <WhiteExpandIcon width={22} height={20} />
          ) : (
            <ExpandIcon width={22} height={20} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
  },
  actions2: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 2,
    backgroundColor: "transparent",
  },
});
