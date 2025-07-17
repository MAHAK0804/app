// components/CustomAlert.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function CustomAlert({ visible, title, message, onClose }) {
  console.log(visible);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
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
  box: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#191734",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
