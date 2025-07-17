import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import Svg, { G, Path, Text as SvgText, Circle } from "react-native-svg";
import ConfettiCannon from "react-native-confetti-cannon";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const { width } = Dimensions.get("window");
const size = width * 0.9;
const radius = size / 2;

const wheelColors = [
  "#f06292",
  "#ffd54f",
  "#ba68c8",
  "#4fc3f7",
  "#ff8a65",
  "#ce93d8",
  "#ffb74d",
  "#81d4fa",
  "#fdd835",
  "#e91e63",
  "#f48fb1",
  "#ffca28",
  "#9575cd",
  "#80deea",
  "#f44336",
];

const polarToCartesian = (angle, r) => {
  const a = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: r + r * Math.cos(a),
    y: r + r * Math.sin(a),
  };
};

const describeArc = (startAngle, endAngle, r) => {
  const start = polarToCartesian(startAngle, r);
  const end = polarToCartesian(endAngle, r);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${r} ${r}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
};

export default function CustomWheel() {
  const rotation = useSharedValue(0);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const sliceAngle = categories.length > 0 ? 360 / categories.length : 0;

  const getAllCategories = async () => {
    try {
      const res = await axios.get(
        "https://hindishayari.onrender.com/api/categories/"
      );
      const reversed = res.data.reverse();
      setCategories(reversed);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        await Promise.all(getAllCategories());
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        // setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleSpinComplete = (category) => {
    navigation.navigate("Shayari", { id: category._id });
    // setWinner(category);
    // setShayaris(dummyShayaris[category] || []);
    // setModalVisible(true);
    // setTimeout(() => setShowConfetti(true), 300);
  };

  const startSpin = () => {
    const spinBy = 360 * 5 + Math.floor(Math.random() * 360);
    rotation.value = withTiming(spinBy, { duration: 5000 }, () => {
      const finalAngle = spinBy % 360;
      const index =
        Math.floor((360 - finalAngle) / sliceAngle) % categories.length;
      const selectedCategory = categories[index];
      runOnJS(handleSpinComplete)(selectedCategory);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.bannerText}>Chakr-e-Shayari</Text>

      <View style={styles.pointer} />

      <Animated.View style={[styles.wheelContainer, animatedStyle]}>
        <Svg width={size} height={size}>
          <G>
            {categories.map((label, i) => {
              const startAngle = i * sliceAngle;
              const endAngle = startAngle + sliceAngle;
              const midAngle = (startAngle + endAngle) / 2;

              const path = describeArc(startAngle, endAngle, radius);
              const color = wheelColors[i % wheelColors.length];

              const textRadius = radius * 0.65;
              const angleInRad = (midAngle - 90) * (Math.PI / 180);
              const x = radius + textRadius * Math.cos(angleInRad);
              const y = radius + textRadius * Math.sin(angleInRad);

              return (
                <React.Fragment key={i}>
                  <Path d={path} fill={color} stroke="#fff" strokeWidth={2} />
                  <SvgText
                    x={x}
                    y={y}
                    fill="#000"
                    fontSize={12}
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    transform={`rotate(${midAngle}, ${x}, ${y})`}
                  >
                    {label.title}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Bulb Lights */}
            {categories.map((_, i) => {
              const angle = (i * 360) / categories.length;
              const { x, y } = polarToCartesian(angle, radius + 10);
              return (
                <Circle
                  key={`light-${i}`}
                  cx={x}
                  cy={y}
                  r={6}
                  fill="#fff"
                  stroke="#ffd700"
                  strokeWidth={2}
                />
              );
            })}
          </G>
        </Svg>
      </Animated.View>

      <TouchableOpacity style={styles.button} onPress={startSpin}>
        <Text style={styles.buttonText}>Spin</Text>
      </TouchableOpacity>

      {/* Modal */}
      {/* <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {showConfetti && (
              <ConfettiCannon count={120} origin={{ x: -10, y: 0 }} fadeOut />
            )}
            <Text style={styles.modalTitle}>{winner} Shayaris</Text>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {shayaris.map((shayari, idx) => (
                <Text key={idx} style={styles.shayari}>
                  {`\u2022 ${shayari}`}
                </Text>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setShowConfetti(false);
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 60,
  },
  bannerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffca28",
    backgroundColor: "#ad1457",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    textAlign: "center",
    elevation: 5,
    marginBottom: 20,
  },
  wheelContainer: {
    width: size,
    height: size,
    borderRadius: radius,
    overflow: "hidden",
  },
  pointer: {
    position: "absolute",
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FF0000",
    zIndex: 1,
  },
  button: {
    marginTop: 40,
    backgroundColor: "#8e24aa",
    padding: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flexShrink: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 8,
  },
  shayari: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  closeBtn: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#8e24aa",
    padding: 10,
    borderRadius: 10,
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
