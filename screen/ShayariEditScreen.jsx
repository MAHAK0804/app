import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";

import { Ionicons, Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import WheelColorPicker from "react-native-wheel-color-picker";
import * as ImagePicker from "expo-image-picker";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-root-toast";
import CustomAlert from "../CustomAlert";
import TextIcon from "../assets/blacktext.svg";
import WhiteText from "../assets/text.svg";
import UploadIcon from "../assets/gallery.svg";
import CopyIcon from "../assets/copyWhite.svg";
import FavIcon from "../assets/heartWhite.svg";
import ShareIcon from "../assets/shareWhite.svg";
import TickIcon from "../assets/tick.svg";
import LikedIcon from "../assets/heartfill.svg";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 10;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

export default function ShayariCardExact({ route }) {
  const navigation = useNavigation();
  const [fontSize, setFontSize] = useState(23);
  const [opacity, setOpacity] = useState(0.9);
  const [fontFamily, setFontFamily] = useState("Kameron_600SemiBold");
  const [fontWeight, setFontWeight] = useState("normal"); // 'normal' or 'bold'
  const [fontStyle, setFontStyle] = useState("normal"); // 'normal' or 'italic'
  const [showFontOptions, setShowFontOptions] = useState(false);
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [fontColor, setFontColor] = useState("#000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/shayariZoom.jpg")
  );
  const [favorites, setFavorites] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const cardRef = useRef(null);
  const [showforSave, setshowforSave] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState(null);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [textAlign, setTextAlign] = useState("center");
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setCustomAlertVisible(true);
  };
  const [customShareModalVisible, setCustomShareModalVisible] = useState(false);
  const [selectedCardRef, setSelectedCardRef] = useState(null);
  const [selectedShayari, setSelectedShayari] = useState(null);
  const shayari = route.params.shayari.text.replace(/\\n/g, "\n");
  const handleShare = useCallback((item) => {
    setshowforSave(false);

    setSelectedShayari(item);
    setSelectedCardRef(cardRef);
    setCustomShareModalVisible(true);
  }, []);
  useEffect(() => {
    if (customAlertVisible) {
      setshowforSave(true);
      return;
    }
  }, [customAlertVisible]);
  const pickImageFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = { uri: result.assets[0].uri };
      setBackgroundImage(selectedImage);
      setBackgroundColor(null); // remove any background color
      setShowBgPicker(false); // hide picker after selecting
    }
  };

  const menuItems = [
    { id: "1", name: "Fonts", iconName: "type", type: "image" },
    { id: "2", name: "Styles", iconName: "italic", type: "icon" },
    { id: "3", name: "Font color", type: "color", color: "#08448A" },
    { id: "4", name: "Background", type: "background", iconName: "image" },
    { id: "5", name: "Background color", type: "color", color: "#FF8B8B" },
    { id: "6", name: "Font align", iconName: "align-center", type: "icon" },
  ];
  const fonts = [
    { name: "Hind_600SemiBold", label: "Hindi" },
    { name: "Baloo2_600SemiBold", label: "Baloo" },
    { name: "Rajdhani_600SemiBold", label: "Rajdhani" },
    { name: "TiroDevanagariHindi_400Regular", label: "TiroDevanagar" },
    { name: "Yantramanav_400Regular", label: "Yantramanav" },

    { name: "serif", label: "Serif" }, // system font
    { name: "monospace", label: "Monospace" }, // system font
    { name: "sans-serif", label: "Sans-serif" }, // system font
    { name: "Manrope_600SemiBold", label: "Manrope" },
    { name: "Kameron_600SemiBold", label: "Kameron" },
    // { name: "Pacifico_600SemiBold", label: "Pacifico" },
    // { name: "Lobster_600SemiBold", label: "Lobster" },
    // { name: "PlayfairDisplay_600SemiBold", label: "Playfair" },

    // { name: "Raleway_600SemiBold", label: "Raleway" },
  ];

  const handleItemPress = (itemName) => {
    setShowFontOptions(false);
    setShowStyleOptions(false);
    setShowColorPicker(false);
    setShowBgPicker(false);
    setShowBgColorPicker(false);

    if (itemName === "Fonts") {
      setShowFontOptions(!showFontOptions);
    } else if (itemName === "Styles") {
      setShowStyleOptions(!showStyleOptions);
    } else if (itemName === "Font color") {
      setShowColorPicker(!showColorPicker);
    } else if (itemName === "Background") {
      setShowBgPicker(!showBgPicker);
    } else if (itemName === "Background color") {
      setShowBgColorPicker(!showBgColorPicker);
    } else if (itemName === "Font align") {
      toggleTextAlign();
    }
  };
  const toggleTextAlign = () => {
    setTextAlign((prevAlign) => {
      if (prevAlign === "left") return "center";
      if (prevAlign === "center") return "right";
      return "left";
    });
  };

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
  const isFav = favorites.some((fav) => fav._id === route.params.shayari._id);

  const isCopied = copiedId === route.params.shayari._id;
  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.log("Failed to save favorites", error);
    }
  };

  const toggleFavorite = useCallback(
    (shayari) => {
      const isFav = favorites.some((item) => item._id === shayari._id);
      const updated = isFav
        ? favorites.filter((item) => item._id !== shayari._id)
        : [...favorites, shayari];

      saveFavorites(updated);

      Toast.show(isFav ? "Removed from Favorites" : "Added to Favorites", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    },
    [favorites]
  );

  const handleCopy = useCallback((item) => {
    Clipboard.setStringAsync(item.text);
    setCopiedId(item._id);
    Toast.show("Copied to clipboard!", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
    });
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const shareAsImage = async () => {
    if (!selectedCardRef) return;
    try {
      const uri = await captureRef(selectedCardRef, {
        format: "png",
        quality: 1,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Shayari Image",
        });
        setCustomAlertVisible(true);
      } else {
        showCustomAlert("Error", "Sharing not available on this device.");
      }

      setCustomShareModalVisible(false);
    } catch (error) {
      console.log("Error sharing as image:", error);
      showCustomAlert("Error", "Failed to share as image.");
    } finally {
      setshowforSave(false);
    }
  };
  const saveToGallery = async () => {
    if (!selectedCardRef) return;

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Toast.show("Permission denied");
        return;
      }

      const uri = await captureRef(selectedCardRef, {
        format: "png",
        quality: 1,
      });
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Shayari", asset, false);
      setCustomAlertVisible(true);
      setAlertTitle("Successfully");
      setAlertMessage("Saved to gallery");
    } catch (err) {
      console.log("Save error", err);
    } finally {
      setCustomShareModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Shayari Card Row */}
      <View style={styles.cardRow}>
        <View ref={cardRef} collapsable={false}>
          <CustomAlert
            visible={customAlertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setCustomAlertVisible(false)}
          />

          <ImageBackground
            source={backgroundImage}
            imageStyle={styles.imageBorder}
            style={[
              styles.backgroundCard,
              backgroundColor && { backgroundColor },
              opacity && { opacity }, // ✅ correct style object
            ]}
            resizeMode="cover"
          >
            <View style={styles.innerRow}>
              {/* Text Size */}
              {showforSave && (
                <View style={styles.sliderCard}>
                  <View style={styles.sliderColumn}>
                    <Slider
                      style={styles.verticalSlider}
                      minimumValue={10}
                      maximumValue={30}
                      value={fontSize}
                      onValueChange={setFontSize}
                      minimumTrackTintColor="#000"
                      maximumTrackTintColor="#000"
                      thumbTintColor="#000"
                    />
                  </View>
                </View>
              )}

              {/* Shayari Text */}
              <View style={styles.textWrapper}>
                <Text
                  style={[
                    styles.shayariText,
                    {
                      fontSize,
                      // opacity,
                      fontFamily,
                      fontWeight,
                      fontStyle,
                      color: fontColor,
                      textAlign,
                    },
                  ]}
                >
                  {shayari}
                </Text>
              </View>

              {/* Opacity */}
              {showforSave && (
                <View style={styles.sliderCard}>
                  <View style={styles.sliderColumn}>
                    <View
                      style={{ position: "relative", alignItems: "center" }}
                    >
                      <Slider
                        style={styles.verticalSlider}
                        minimumValue={0.8}
                        maximumValue={1}
                        step={0.05}
                        value={opacity}
                        onValueChange={setOpacity}
                        minimumTrackTintColor="#000"
                        maximumTrackTintColor="#000"
                        thumbTintColor="#000"
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
            {/* Font Family Selector */}
            {showFontOptions && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.fontScrollViewAbsolute} // New style for absolute positioning
                contentContainerStyle={styles.fontScrollViewContent}
              >
                {fonts.map((font) => (
                  <TouchableOpacity
                    key={font.name}
                    style={[
                      styles.fontItem,
                      fontFamily === font.name && styles.fontItemSelected,
                    ]}
                    onPress={() => setFontFamily(font.name)}
                  >
                    <Text
                      style={{
                        fontFamily: font.name,
                        fontSize: 16,
                        color: fontFamily === font.name ? "#fff" : "#000",
                      }}
                    >
                      {font.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {showStyleOptions && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.fontScrollViewAbsolute} // New style for absolute positioning
                contentContainerStyle={styles.fontScrollViewContent}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginTop: 10,
                    // backgroundColor: "#f1f1f1",
                    paddingVertical: 5,
                  }}
                >
                  {/* Regular */}
                  <TouchableOpacity
                    style={[
                      styles.fontItem,
                      fontWeight === "normal" &&
                        fontStyle === "normal" &&
                        styles.fontItemSelected,
                    ]}
                    onPress={() => {
                      setFontWeight("normal");
                      setFontStyle("normal");
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color:
                          fontWeight === "normal" && fontStyle === "normal"
                            ? "#fff"
                            : "#000",
                      }}
                    >
                      Regular
                    </Text>
                  </TouchableOpacity>

                  {/* Bold */}
                  <TouchableOpacity
                    style={[
                      styles.fontItem,
                      fontWeight === "bold" && styles.fontItemSelected,
                    ]}
                    onPress={() => {
                      setFontWeight("bold");
                      setFontStyle("normal");
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 14,
                        color: fontWeight === "bold" ? "#fff" : "#000",
                      }}
                    >
                      Bold
                    </Text>
                  </TouchableOpacity>

                  {/* Italic */}
                  <TouchableOpacity
                    style={[
                      styles.fontItem,
                      fontStyle === "italic" && styles.fontItemSelected,
                    ]}
                    onPress={() => {
                      setFontStyle("italic");
                      setFontWeight("normal");
                    }}
                  >
                    <Text
                      style={{
                        fontStyle: "italic",
                        fontSize: 14,
                        color: fontStyle === "italic" ? "#fff" : "#000",
                      }}
                    >
                      Italic
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
            {showColorPicker && (
              <View style={styles.colorPickerContainer}>
                <WheelColorPicker
                  initialColor={fontColor}
                  onColorChangeComplete={(color) => {
                    setFontColor(color); // only update color, don't close yet
                  }}
                  style={{ width: "100%", height: 100 }}
                />
              </View>
            )}
            {showBgPicker && (
              <View style={styles.bgPickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {/* Upload from gallery option */}
                  <TouchableOpacity
                    onPress={pickImageFromGallery}
                    style={[
                      styles.bgImageOption2,
                      {
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Image
                      source={require("../assets/Mask group.png")}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </TouchableOpacity>

                  {/* Predefined background images */}
                  {[
                    require("../assets/shayariZoom.jpg"),

                    require("../assets/shayaribg2.png"),

                    require("../assets/allShayaribg.png"),
                    require("../assets/myshayaribg.png"),
                    require("../assets/editbg.png"),
                    require("../assets/edittextbg.png"),
                    require("../assets/favbg.png"),
                    require("../assets/fullviewBg.png"),
                    require("../assets/shayaribg3.png"),
                    require("../assets/shyaribg4.png"),
                    require("../assets/shayaribg5.png"),
                    require("../assets/shayaribg6.png"),
                  ].map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setBackgroundImage(img);
                        setBackgroundColor(null);
                      }}
                      style={styles.bgImageOption}
                    >
                      <Image
                        source={img}
                        style={{
                          width: 80,
                          height: 80,
                        }}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {showBgColorPicker && (
              <View style={styles.colorPickerContainer}>
                <WheelColorPicker
                  initialColor={backgroundColor || "#ffffff"}
                  onColorChangeComplete={(color) => {
                    setBackgroundColor(color);
                    setBackgroundImage(null); // remove image
                  }}
                  style={{ width: "100%", height: 180 }}
                />
              </View>
            )}
          </ImageBackground>
        </View>
      </View>
      {customShareModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCustomShareModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>

            <View style={styles.previewBox} />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.shareButton, { gap: 7 }]}
                onPress={() => {
                  Share.share({
                    message: selectedShayari?.text.replace(/\\n/g, "\n"),
                  });
                  setCustomShareModalVisible(false);
                }}
              >
                <WhiteText width={18} height={18} />

                <Text style={styles.shareButtonText}>Share Text</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareAsImage}
              >
                <Ionicons
                  name="image-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.shareButtonText}>Share Image</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
              <Ionicons
                name="download-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.shareButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Action Buttons */}
      <View style={{ marginBottom: 20 }}>
        <ImageBackground
          source={require("../assets/bg.png")}
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            padding: 10,
          }}
        >
          <TouchableOpacity onPress={() => handleCopy(route.params.shayari)}>
            {isCopied ? (
              <TickIcon width={22} height={20} fill="#000" />
            ) : (
              <CopyIcon width={22} height={20} fill="#000" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleShare(route.params.shayari)}>
            <ShareIcon width={22} height={20} fill="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleFavorite(route.params.shayari)}
          >
            {isFav ? (
              <LikedIcon width={22} height={20} fill="#000" />
            ) : (
              <FavIcon width={22} height={20} fill="#000" />
            )}
          </TouchableOpacity>
        </ImageBackground>

        {/* Grid Menu */}
        <View style={styles.gridContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => handleItemPress(item.name)}
            >
              <View style={styles.iconWrapper}>
                {item.type === "icon" && (
                  <Feather name={item.iconName} size={23} color="#000" />
                )}
                {item.type === "image" && (
                  <TextIcon width={22} height={20} fill="#000" />
                )}
                {item.type === "color" && (
                  <View
                    style={[styles.colorBox, { backgroundColor: item.color }]}
                  />
                )}
                {item.type === "background" && (
                  <ImageBackground
                    source={require("../assets/shayaribg3.png")}
                    style={styles.backgroundPreview}
                    imageStyle={{ borderRadius: 15 }}
                  />
                )}
              </View>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 1,
  },
  backgroundCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
  },

  imageBorder: {
    borderRadius: 20,
    resizeMode: "cover",
  },
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  sliderCard: {
    height: "100%",
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  sliderColumn: {
    height: "10%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verticalLabel: {
    transform: [{ rotate: "-90deg" }],
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },
  verticalSlider: {
    transform: [{ rotate: "-90deg" }],
    width: SCREEN_HEIGHT * 0.35,
    height: 40,
  },

  opacityPreview: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bbb",
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  shayariText: {
    textAlign: "center",
    lineHeight: 40,
    color: "#fff",
    width: "100%",
    padding: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 40) / 4,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },

  fontScrollView: {
    marginTop: 10,
    maxHeight: 60,
  },

  iconWrapper: {
    width: 62,
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#262237",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
    overflow: "hidden",
  },
  colorBox: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  backgroundPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  itemText: {
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
  },
  fontScrollViewAbsolute: {
    position: "absolute",
    bottom: 10, // Adjust this value to control distance from bottom
    left: 0,
    right: 0,
    height: 70, // Height for the font selector scroll view
    borderRadius: 10,
    // marginHorizontal: 10,
    paddingVertical: 5,
  },
  fontScrollViewContent: {
    alignItems: "center", // Center font items vertically in the scroll view
    paddingHorizontal: 5,
  },
  fontItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    // marginRight: 10,
    borderWidth: 1,
    borderColor: "#191734",
    marginHorizontal: 5,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  fontItemSelected: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    color: "#fff",
    backgroundColor: "#191734",
  },
  colorPickerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bgPickerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bgImageOption: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#191734",
  },
  bgImageOption2: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
    width: 80,
    height: 80,
  },
  alertOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  alertBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },

  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
    textAlign: "center",
  },

  alertMessage: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },

  alertButton: {
    backgroundColor: "#08448A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  alertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    fontSize: 14,
    fontWeight: "600",
  },
});
