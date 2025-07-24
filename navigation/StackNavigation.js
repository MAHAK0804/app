import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import CustomDrawerContent from "../CustomDrawerContent";
import HomeScreen from "../screen/HomeScreen";
import { NavigationContainer } from "@react-navigation/native";
import ShayariFullViewScreen from "../screen/ShayariFullViewScreen";
import ShayariEditScreen from "../screen/ShayariEditScreen";
import { useNavigation } from "@react-navigation/native";
import WriteShayari from "../screen/WriteShayari";
import LoginScreen from "../screen/LoginScreen";
import VerifyOTPScreen from "../screen/VerifyOtpScreen";
import ShayariListScreen from "../screen/ShayariByCategory";
import WheelGame from "../screen/WheelGame";
import PrivacyPolicyScreen from "../screen/PrivacyPolicies";
import AllCategories from "../screen/AllCategories";
import { fontScale, scaleFont } from "../Responsive";
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const CustomEditHeader = ({ theme, title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.customHeader}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.iconLeft}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text
          numberOfLines={1}
          style={[styles.headerTitleText, { color: theme.primary }]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};
function HomeStack({ navigation }) {
  const { theme } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          header: () => (
            <View style={[styles.customHeader]}>
              <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                style={styles.iconLeft}
              >
                <Ionicons name="menu" size={24} color={theme.primary} />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text
                  numberOfLines={1}
                  style={[styles.headerTitleText, { color: theme.primary }]}
                >
                  Home
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("HomeStack", {
                    screen: "Shayari",
                    params: {
                      type: "favorites",
                      title: "Favourite",
                    },
                  })
                }
                style={styles.iconLeft}
              >
                <Ionicons name="heart" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="WheelGame"
        component={WheelGame}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Shayari"
        component={ShayariListScreen}
        options={({ route }) => ({
          header: () => (
            <CustomEditHeader theme={theme} title={route.params.title} />
          ),
        })}
      />
      <Stack.Screen
        name="ShayariFullView"
        component={ShayariFullViewScreen}
        options={({ route }) => ({
          header: () => (
            <CustomEditHeader
              theme={theme}
              title={route.params.title || "Favourite Shayari"}
            />
          ),
        })}
      />
      <Stack.Screen
        name="ShayariEditScreen"
        component={ShayariEditScreen}
        options={{
          header: () => <CustomEditHeader theme={theme} title="Edit" />,
        }}
      />
      <Stack.Screen
        name="AllCategories"
        component={AllCategories}
        options={{
          header: () => (
            <CustomEditHeader theme={theme} title="AllCategories" />
          ),
        }}
      />

      <Stack.Screen
        name="Writeshayari"
        component={WriteShayari}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerifyOTPScreen"
        component={VerifyOTPScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function DrawerNavigation() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent Content {...props} />}
        screenOptions={{
          drawerStyle: {
            backgroundColor: theme.background,
          },
          drawerLabelStyle: {
            color: theme.text,
          },
        }}
      >
        <Drawer.Screen
          name="HomeStack"
          component={HomeStack}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#191734",
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 10,
    elevation: 4,
  },
  iconLeft: {
    padding: 1,
  },

  titleContainer: {
    flex: 1,
    alignItems: "start",
    justifyContent: "flex-start",
    marginHorizontal: 10,
  },
  headerTitleText: {
    fontSize: fontScale * scaleFont(20),
    textAlign: "start",
    fontFamily: "Manrope_400Regular",
  },
});
