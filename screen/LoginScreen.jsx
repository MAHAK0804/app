import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useFormik } from "formik";
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  // CheckBox,
} from "react-native";
import * as Yup from "yup";
import { fontScale, scaleFont } from "../Responsive";

export default function LoginScreen() {
  const navigation = useNavigation();
  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      agree: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      phone: Yup.string()
        .required("Email is required")
        .test(
          "is-valid-email",
          "Enter a valid email",
          function (value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return emailRegex.test(value);
          }
        ),
      agree: Yup.bool().oneOf([true], "You must accept Terms & Conditions"),
    }),
    onSubmit: async (values) => {
      const { phone } = values;

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phone);

      try {
        let response;

        if (isEmail) {
          response = await axios.post(
            "https://hindishayari.onrender.com/api/users/auth/request-otp",
            {
              name: values.name,
              email: values.phone,
            }
          );

          alert("Otp is Sent To your mail Id");
          navigation.replace("VerifyOTPScreen", {
            name: values.name,
            email: values.phone,
          });
        }




        console.log("Login Response:", response.data);
      } catch (error) {
        console.log("Login Error ->", error.message);
        alert("Failed to send OTP. Please try again.");
      }
    },
  });

  return (
    <View style={styles.background}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>Login to Shayari App</Text>
        <Text
          style={{
            color: "#fff",
            paddingBottom: 10,
            fontFamily: "Manrope_600SemiBold",
            fontSize: fontScale * scaleFont(16),
          }}
        >
          Name
        </Text>
        <TextInput
          placeholder="Name*"
          placeholderTextColor="#ccc"
          value={formik.values.name}
          onChangeText={formik.handleChange("name")}
          onBlur={formik.handleBlur("name")}
          style={styles.input}
        />
        {formik.touched.name && formik.errors.name && (
          <Text style={styles.errorText}>{formik.errors.name}</Text>
        )}
        <Text
          style={{
            color: "#fff",
            paddingBottom: 10,
            fontFamily: "Manrope_600SemiBold",
            fontSize: fontScale * scaleFont(16),
          }}
        >
          E-mail ID
        </Text>
        <TextInput
          placeholder="E-mail ID*"
          placeholderTextColor="#ccc"
          value={formik.values.phone}
          onChangeText={formik.handleChange("phone")}
          onBlur={formik.handleBlur("phone")}
          style={styles.input}
        />
        {formik.touched.phone && formik.errors.phone && (
          <Text style={styles.errorText}>{formik.errors.phone}</Text>
        )}

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            onPress={() => formik.setFieldValue("agree", !formik.values.agree)}
            style={styles.checkboxBox}
          >
            {formik.values.agree && (
              <Ionicons name="checkmark" size={18} color="#000" />
            )}
          </TouchableOpacity>

          <Text style={styles.checkboxLabel}>
            I agree to the Terms & Conditions
          </Text>
        </View>
        {formik.touched.agree && formik.errors.agree && (
          <Text style={styles.errorText}>{formik.errors.agree}</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={formik.handleSubmit}>
          <Text style={styles.buttonText}>Generate Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#08041C" },
  container: { paddingHorizontal: 24, paddingVertical: 20 },
  backButton: { padding: 24 },
  backIcon: { fontSize: fontScale * scaleFont(34), color: "#fff" },
  title: {
    fontSize: fontScale * scaleFont(30),
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Manrope_700Bold",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginLeft: 5,
    fontSize: fontScale * scaleFont(12),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#393649",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: fontScale * scaleFont(20),
    fontFamily: "Manrope_600SemiBold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    color: "#fff",
    marginLeft: 10,
    fontSize: fontScale * scaleFont(14),
    fontFamily: "Manrope_500Medium",
  },
});
