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
} from "react-native";

import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import WheelColorPicker from "react-native-wheel-color-picker";
import * as ImagePicker from "expo-image-picker";

import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../CustomAlert";
import TextIcon from "../assets/blacktext.svg";
import UploadGallery from "../assets/upload.svg";
import ShayariCardActions from "../Action";
import CustomShareModal from "../CustomShareModal";
import { fontScale, moderateScale, scaleFont } from "../Responsive";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 10;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.57;

export default function ShayariCardExact({ route }) {
  const [fontSize, setFontSize] = useState(23);
  const [opacity, setOpacity] = useState(1);
  const [fontFamily, setFontFamily] = useState("Kameron_600SemiBold");
  const [fontWeight, setFontWeight] = useState("normal"); // 'normal' or 'bold'
  const [fontStyle, setFontStyle] = useState("normal"); // 'normal' or 'italic'
  const [showFontOptions, setShowFontOptions] = useState(false);
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [fontColor, setFontColor] = useState("#000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(
    require("../assets/image_1.webp")
  );
  const [uploadIconKey, setUploadIconKey] = useState(Date.now());

  const [favorites, setFavorites] = useState([]);
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
      setBackgroundColor(null);
      setShowBgPicker(false);
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
    { name: "serif", label: "Serif" },
    { name: "monospace", label: "Monospace" },
    { name: "sans-serif", label: "Sans-serif" },
    { name: "Manrope_600SemiBold", label: "Manrope" },
    { name: "Kameron_600SemiBold", label: "Kameron" },
    { name: "sans-serif", label: " Sans Serif" },
    { name: "sans-serif-light", label: "Sans Serif Light" },
    { name: "sans-serif-medium", label: "Sans Serif Medium" },
    { name: "sans-serif-black", label: "Sans Serif Black" },
    { name: "sans-serif-condensed", label: "Sans Serif Condensed" },
    { name: "cursive", label: "Cursive" },
    { name: "casual", label: "Casual" },
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
      setUploadIconKey(Date.now());
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

  return (
    <View style={styles.container}>
      {/* Shayari Card Row */}
      <View style={styles.cardRow}>
        <CustomAlert
          visible={customAlertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setCustomAlertVisible(false)}
        />

        <View
          style={[
            styles.backgroundCard,
            backgroundColor && { backgroundColor },
          ]}
          ref={cardRef}
          collapsable={false}
        >
          {/* ✅ Background Image with Opacity */}
          {backgroundImage && (
            <Image
              source={backgroundImage}
              style={[
                StyleSheet.absoluteFillObject,
                {
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  resizeMode: "cover",
                  opacity: opacity, // ✅ only image gets opacity
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                },
              ]}
            />
          )}

          {/* ✅ Foreground Content */}
          <View style={styles.innerRow}>
            {/* Font Size Slider */}
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
                    fontFamily,
                    fontWeight,
                    fontStyle,
                    color: fontColor,
                    textAlign,
                    lineHeight: fontSize * 1.4,
                  },
                ]}
              >
                {shayari}
              </Text>
            </View>

            {/* Opacity Slider */}
            {showforSave && (
              <View style={styles.sliderCard}>
                <View style={styles.sliderColumn}>
                  <Slider
                    style={styles.verticalSlider}
                    minimumValue={0}
                    maximumValue={1}
                    step={0.01}
                    value={opacity}
                    onValueChange={setOpacity}
                    minimumTrackTintColor="#000"
                    maximumTrackTintColor="#000"
                    thumbTintColor="#000"
                  />
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
                      fontSize: fontScale * scaleFont(16),
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
                      fontSize: fontScale * scaleFont(14),
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
                      fontSize: fontScale * scaleFont(14),
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
                      fontSize: fontScale * scaleFont(14),
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
                  style={{
                    width: 80,
                    height: 80,
                    paddingRight: 5,
                    marginRight: 10,
                    justifyContent: "center",
                    alignItems: "center",

                  }}
                >
                  <View style={{ width: 80, height: 80 }}>
                    {/* <UploadGallery
                      width="100%"
                      height="100%"
                      key={uploadIconKey}
                    /> */}
                    <Image source={require('../assets/upload.png')} style={{ width: "100%", height: "100%" }} />
                  </View>
                </TouchableOpacity>

                {/* Predefined background images */}
                {[
                  require("../assets/image_1.webp"),
                  require("../assets/image_2.webp"),
                  require("../assets/image_3.3.webp"),
                  require("../assets/image_4.webp"),
                  require("../assets/image_5.webp"),
                  require("../assets/image_6.webp"),
                  require("../assets/image_7.webp"),
                  require("../assets/image_8.webp"),
                  require("../assets/image_9.webp"),
                  require("../assets/image_10.webp"),
                  require("../assets/image_11.webp"),
                  // require("../assets/image_12.webp"),
                  require("../assets/image_13.webp"),
                  // require("../assets/image_14.webp"),
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
        </View>
      </View>

      <CustomShareModal
        visible={customShareModalVisible}
        onClose={() => setCustomShareModalVisible(false)}
        cardRef={selectedCardRef}
        shayari={selectedShayari}
      />
      {/* Action Buttons */}
      <View style={{ marginBottom: 20 }}>
        <ShayariCardActions
          shayari={route.params.shayari}
          onShare={() => handleShare(route.params.shayari)}
          isEdit={false}
          isExpand={false}
          isBg={true}
        />

        {/* Grid Menu */}
        <View style={styles.gridContainer}>
          {menuItems.map((item) => (
            <View style={styles.gridItem}>
              <TouchableOpacity
                key={item.id}
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
                      source={require("../assets/image_5.webp")}
                      style={styles.backgroundPreview}
                      imageStyle={{ borderRadius: 15 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={styles.itemText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
            </View>
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
    marginTop: 10,
  },
  backgroundCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    // borderRadius: 20,
  },

  imageBorder: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

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
    fontSize: fontScale * scaleFont(16),
    fontWeight: "700",
    color: "#444",
  },
  sliderValue: {
    fontSize: fontScale * scaleFont(12),
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
    // maxWidth: 400,
    marginTop: 10,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 70) / 3,
    aspectRatio: 1.25,
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
    padding: moderateScale(50),
    // width: "100%",
    // height: "100%",
    // // borderRadius: 15,
  },
  backgroundPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  itemText: {
    fontSize: fontScale * scaleFont(13),
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
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
  },
  bgImageOption: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#191734",
  },
  bgImageOption2: {
    // borderRadius: 10,
    // overflow: "hidden",
    // width: 80,
    // height: 80,
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
    fontSize: fontScale * scaleFont(18),
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
    textAlign: "center",
  },

  alertMessage: {
    fontSize: fontScale * scaleFont(15),
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
    fontSize: fontScale * scaleFont(16),
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
    fontSize: fontScale * scaleFont(14),
    fontWeight: "600",
  },
});
