import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
} from "react-native";
import { fontScale, scaleFont } from "../Responsive";

const categories = [
  "Love",
  "Sad",
  "Bewafa",
  "Yaad",
  "Family",
  "No ads",
  "Sorry",
  "Dard",
  "Happy",
  "Dhokha",
  "Attitude",
  "Shayari Masters",
  "Spin Again",
  "Propose",
  "Newbg",
  "Waqt",
];

const categoryShayaris = {
  Love: "Tere bina jee na paayenge hum...",
  Sad: "Aansu bhi kabhi muskurate hain...",
  Bewafa: "Wafa ki talash thi, bewafa mil gaya...",
  Yaad: "Teri yaadon mein khoya rehta hoon...",
  Family: "Parivaar hi sab kuch hai...",
  "No ads": "Enjoy ad-free experience!",
  Sorry: "Mujhse galti ho gayi, maaf kar do...",
  Dard: "Dard hai dil mein, par chup hai zubaan...",
  Happy: "Khushiyo ka jahan ho tum...",
  Dhokha: "Har kisi pe bharosa theek nahi...",
  Attitude: "Main wo hoon jo kabhi jhuka nahi...",
  "Shayari Masters": "Aap shayari ke master ho!",
  "Spin Again": "Spin again for your luck!",
  Propose: "Kya tum mujhse shaadi karogi?",
  Newbg: "Naye safar ki shuruaat...",
  Waqt: "Waqt sab kuch sikha deta hai...",
};

const WheelGame = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const spinWheel = () => {
    const rounds = 5;
    const randomIndex = Math.floor(Math.random() * categories.length);
    const angle = (360 / categories.length) * randomIndex;
    const spinValue = 360 * rounds + angle;

    Animated.timing(spinAnim, {
      toValue: spinValue,
      duration: 4000,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      setSelected(categories[randomIndex]);
      setModalVisible(true);
    });
  };

  const rotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chakr-e-Shayari</Text>
      <View style={styles.wheelContainer}>
        <Animated.View style={[styles.wheel, { transform: [{ rotate }] }]}>
          {categories.map((item, index) => {
            const angle = (360 / categories.length) * index;
            return (
              <View
                key={index}
                style={[
                  styles.slice,
                  {
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -100 },
                    ],
                  },
                ]}
              >
                <Text style={styles.label}>{item}</Text>
              </View>
            );
          })}
        </Animated.View>
        <View style={styles.pointer}></View>
      </View>
      <TouchableOpacity style={styles.spinButton} onPress={spinWheel}>
        <Text style={styles.spinText}>SPIN</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.popup}>
            <Text style={styles.resultTitle}>{selected}</Text>
            <Text style={styles.resultText}>{categoryShayaris[selected]}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#942D5C",
  },
  title: {
    fontSize: fontScale * scaleFont(26),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 250,
    width: 250,
  },
  wheel: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: "#ffcc00",
    position: "absolute",
    top: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  slice: { position: "absolute", width: 200, alignItems: "center" },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    transform: [{ rotate: "-90deg" }],
    textAlign: "center",
    width: 70,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "yellow",
    position: "absolute",
    top: -5,
  },
  spinButton: {
    backgroundColor: "#ff0000",
    padding: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 40,
  },
  spinText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: fontScale * scaleFont(24),
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultText: {
    fontSize: fontScale * scaleFont(16),
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    fontSize: fontScale * scaleFont(18),
    color: "#007bff",
    fontWeight: "bold",
  },
});

export default WheelGame;
