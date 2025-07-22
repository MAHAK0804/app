import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { fontScale, scaleFont } from "../Responsive";

const { width } = Dimensions.get("window");

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to Hindi Shayari App. We value your privacy and are committed
          to protecting your data.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We may collect information like device ID, favorites, and Shayaris you
          write or save.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Data</Text>
        <Text style={styles.paragraph}>
          To personalize your experience, improve app functionality, and store
          your preferences.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell or share your data except for analytics or legal
          reasons.
        </Text>

        <Text style={styles.sectionTitle}>5. Security</Text>
        <Text style={styles.paragraph}>
          Your data is encrypted and securely stored to prevent unauthorized
          access.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          You can manage or delete your data from settings or by contacting us.
        </Text>

        <Text style={styles.sectionTitle}>7. Updates</Text>
        <Text style={styles.paragraph}>
          We may update this policy. Please check this page regularly for
          changes.
        </Text>

        <Text style={styles.sectionTitle}>8. Contact</Text>
        <Text style={styles.paragraph}>
          Email us at support@hindishayariapp.com for any questions about this
          policy.
        </Text>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08041C", // background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
    elevation: 4,

    backgroundColor: "#191734", // card
    borderBottomWidth: 1,
    borderBottomColor: "#2D2A40",
  },
  headerTitle: {
    fontSize: fontScale * scaleFont(18),
    fontWeight: "600",
    color: "#FFFFFF", // primary
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: fontScale * scaleFont(16),
    fontWeight: "700",
    marginTop: 20,
    color: "#FFFFFF", // cardText
  },
  paragraph: {
    fontSize: fontScale * scaleFont(14),
    color: "#D1D1D1", // secondaryText
    marginTop: 8,
    lineHeight: 22,
  },
});
