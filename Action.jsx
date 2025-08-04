import React, { useContext, useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import CopyIcon from "./assets/copyBlack.svg";
import TickIcon from "./assets/tick.svg";
import FavIcon from "./assets/favouriteBlack.svg";
import LikedIcon from "./assets/heart.svg";
import EditIcon from "./assets/editBlack.svg";
import ShareIcon from "./assets/shareBlack.svg";
import ExpandIcon from "./assets/expandBlack.svg";
import WhiteCopyIcon from "./assets/copy.svg";
import WhiteFavIcon from "./assets/favourite ( stroke ).svg";
import WhiteEditIcon from "./assets/edit.svg";
import WhiteShareIcon from "./assets/share.svg";
import WhiteExpandIcon from "./assets/expand (1) 1.svg";
import BlackTick from "./assets/tick black.svg";
import Toast from "react-native-root-toast";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useRewardAd } from "./RewardContext";

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
  isIcon = true
}) {
  const [copied, setCopied] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [copyCount, setCopyCount] = useState(0);
  console.log("copy count", copyCount);




  const navigation = useNavigation();

  useEffect(() => {
    checkIsFav();
  }, []);
  // const { showRewardAd } = useRewardAd();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shayari.text);

    // const current = Number(await AsyncStorage.getItem("Copycount")) || 0;
    // const updatedCount = current + 1;
    // console.log("updateCount", updatedCount);

    // await AsyncStorage.setItem("Copycount", String(updatedCount));
    // setCopyCount(updatedCount);
    setCopied(true);

    // ✅ Show rewarded ad after every 3 copies
    // if (updatedCount % 3 === 0) {
    //   showRewardAd();
    // }

    setTimeout(() => setCopied(null), 2000);
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
      {isIcon &&
        <TouchableOpacity onPress={handleCopy}>
          {copied ? (
            isCat ? (
              <BlackTick width={40} height={40} />
            ) : (
              <TickIcon width={40} height={40} />
            )
          ) : isSpotlightScreen || isBg ? (
            <WhiteCopyIcon width={40} height={40} />
          ) : (
            <CopyIcon width={40} height={40} />
          )}
        </TouchableOpacity>
      }

      {isIcon &&

        <TouchableOpacity onPress={toggleFavorite}>
          {isFav ? (
            <LikedIcon width={25} height={40} />
          ) : isSpotlightScreen || isBg ? (
            <WhiteFavIcon width={40} height={40} />
          ) : (
            <FavIcon width={40} height={40} />
          )}
        </TouchableOpacity>
      }

      {isEdit && (
        <TouchableOpacity onPress={handleEdit}>
          {isSpotlightScreen || isBg ? (
            <WhiteEditIcon width={40} height={40} />
          ) : (
            <EditIcon width={40} height={40} />
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onShare}>
        {isSpotlightScreen || isBg ? (
          <WhiteShareIcon width={40} height={40} />
        ) : (
          <ShareIcon width={40} height={40} />
        )}
      </TouchableOpacity>

      {isExpand && (
        <TouchableOpacity onPress={handleExpand}>
          {isSpotlightScreen || isBg ? (
            <WhiteExpandIcon width={40} height={40} />
          ) : (
            <ExpandIcon width={40} height={40} />
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
