import React, { useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
  Image,
  ImageBackground,
  Button,
  NativeModules,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import { useTheme } from "./ThemeContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { fontScale, scale, scaleFont } from "./Responsive";
import MyShayari from "./assets/myshayariicon.svg";

export default function CustomDrawerContent(props) {
  const { theme, isDark, toggleTheme } = useTheme();
  // const [user, setUser] = useState(null); // Will hold name and email
  const { user, logout, isLogin } = useContext(AuthContext);

  const navigation = useNavigation();

  // Function to open the app's store page for rating
  const rateApp = () => {
    // Replace 'com.yourapp.package' with your actual Android package name
    Linking.openURL("market://details?id=com.yourapp.package").catch((err) =>
      console.error("An error occurred opening store link", err)
    );
  };

  // Function to open the developer's page with more apps
  const moreApps = () => {
    Linking.openURL(
      "https://play.google.com/store/apps/developer?id=YourPublisherName"
    ).catch((err) =>
      console.error("An error occurred opening developer link", err)
    );
  };

  // Function to handle logout, clearing AsyncStorage items
  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
    navigation.navigate("Home");
  };

  return (
    // DrawerContentScrollView provides the basic scrollable drawer functionality
    <DrawerContentScrollView
      {...props}
      style={[styles.drawerContainer, { backgroundColor: theme.background }]}
    >
      {/* Header Section with ImageBackground */}
      <ImageBackground
        source={require("./assets/Rectangle 55.png")}
        style={styles.headerBackground}
        imageStyle={styles.headerImageStyle}
      >
        {/* Overlay to ensure text readability on the background image */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {user ? (
            <>
              <View style={[styles.headerOverlay]}>
                {/* Profile Image - Placeholder */}
                <Image
                  source={require("./assets/Ellipse 32.png")} // Placeholder for Aayushi's image
                  style={styles.profileImage}
                />
                <Text style={styles.appName}>{user.name}</Text>
                <Text style={styles.email}>
                  {user.email ? user.email : user.phone}
                </Text>
              </View>
              {/* <Text
                style={{
                  color: "#fff",
                  fontSize: 25,
                  marginRight: 10,
                  paddingVertical: 15,
                }}
              >
                Hindi Shayari Lok
              </Text> */}
            </>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 20,
              }}
            >
              <Text
                style={{ color: "#fff", fontSize: fontScale * scaleFont(25) }}
              >
                Hindi Shayari Lok
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>

      {/* Menu Items Section */}
      <View style={styles.menuItemsContainer}>
        {/* Home Item */}
        <TouchableOpacity
          style={[styles.menuItem]}
          onPress={() =>
            navigation.navigate("Shayari", {
              type: "favorites",
              title: "Favourite",
            })
          }
        >
          <Ionicons name="heart" size={22} color="red" />
          <Text style={[styles.menuText, { color: theme.text }]}>
            Favourites
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem]}
          onPress={() =>
            navigation.navigate("Shayari", {
              type: "mine",
              title: "My Shayari",
            })
          }
        >
          <MyShayari width={scale(28)} height={scale(28)} />
          <Text style={[styles.menuText, { color: theme.text }]}>
            My Shayaris
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem]}
          onPress={() =>
            isLogin
              ? navigation.navigate("Writeshayari")
              : navigation.navigate("LoginScreen")
          }
        >
          <Image
            source={require("./assets/pencil 2.png")}
            style={styles.pencilIcon}
          />
          <Text style={[styles.menuText, { color: theme.text }]}>
            Write Own Shayari
          </Text>
        </TouchableOpacity>
        {/* FeedbackItem */}
        <TouchableOpacity style={styles.menuItem} onPress={moreApps}>
          <FontAwesome5 name="at" size={22} color={theme.text} />
          <Text style={[styles.menuText, { color: theme.text }]}>Feedback</Text>
        </TouchableOpacity>
        {/*share Item */}
        <TouchableOpacity style={styles.menuItem} onPress={moreApps}>
          <Ionicons name="share-social-outline" size={22} color={theme.text} />
          <Text style={[styles.menuText, { color: theme.text }]}>Share</Text>
        </TouchableOpacity>
        {/* Rate Us Item */}
        <TouchableOpacity style={styles.menuItem} onPress={rateApp}>
          <Ionicons name="star" size={22} color="gold" />
          <Text style={[styles.menuText, { color: theme.text }]}>Rate </Text>
        </TouchableOpacity>
        {/* privacy Item */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("PrivacyPolicy")}
        >
          <MaterialIcons name="flag" size={22} color={theme.text} />
          <Text style={[styles.menuText, { color: theme.text }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
        {/* More Apps Item */}
        <TouchableOpacity style={styles.menuItem} onPress={moreApps}>
          <MaterialIcons name="grid-view" size={22} color={theme.text} />
          <Text style={[styles.menuText, { color: theme.text }]}>
            Other Apps
          </Text>
        </TouchableOpacity>
        <Button
          title="Show Interstitial Ad"
          onPress={() => navigation.navigate("Ads")}
        />
        {/* Logout Item */}
        {user && (
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={22} color={theme.text} />{" "}
            <Text style={[styles.menuText, { color: theme.text }]}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </DrawerContentScrollView>
  );
}

// --- StyleSheet for React Native Components ---
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1, // Ensures the drawer content fills the available space
  },
  headerBackground: {
    width: "100%",
    height: 180, // Fixed height for the header background
    justifyContent: "center",
    alignItems: "center",
  },
  headerImageStyle: {
    resizeMode: "cover", // Ensures the image covers the area
  },
  headerOverlay: {
    flex: 1, // Takes full space of ImageBackground
    width: "100%",
    // justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Half of width/height for a perfect circle
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 3,
  },
  pencilIcon: {
    width: scale(20),
    height: scale(20),
    resizeMode: "contain",
  },
  appName: {
    fontSize: fontScale * scaleFont(22),
    fontWeight: "bold",
    color: "#fff", // White text for header
    marginTop: 8,
  },
  email: {
    color: "#fff", // White text for header
    fontSize: fontScale * scaleFont(14),
    marginTop: 4,
  },
  menuItemsContainer: {
    paddingTop: 10, // Add some padding above the menu items
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16, // Spacing between icon and text
  },
  menuText: {
    fontSize: fontScale * scaleFont(16),
    flex: 1, // Allows text to take remaining space
    fontFamily: "Manrope_400Regular",
  },
});
