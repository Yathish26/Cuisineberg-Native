// Works.jsx
import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";

export default function Works() {
  const steps = [
    {
      title: "1. Scan the QR Code",
      description: "Customers scan the table QR code using their phone to access the menu instantly.",
      image: "https://cdn.pixabay.com/photo/2021/07/14/12/31/qr-code-6464032_1280.png",
    },
    {
      title: "2. Explore the Digital Menu",
      description: "View high-quality images, ingredients, allergens, and nutrition details.",
      image: "https://cdn.pixabay.com/photo/2018/01/21/22/22/menu-3095886_1280.jpg",
    },
    {
      title: "3. Customize & Place Order",
      description: "Select dishes, customize preferences, and place the order directly from your phone.",
      image: "https://cdn.pixabay.com/photo/2016/11/29/06/15/food-1867396_1280.jpg",
    },
    {
      title: "4. Track & Enjoy",
      description: "Get real-time updates, estimated time, and call the waiter only when needed.",
      image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bar-1236688_1280.jpg",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>How It Works</Text>

      {steps.map((step, index) => (
        <View key={index} style={styles.card}>
          <Image source={{ uri: step.image }} style={styles.image} />
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#111827",
  },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#374151",
  },
});
