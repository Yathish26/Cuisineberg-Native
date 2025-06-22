// Order.jsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function Order() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start Your Order</Text>
        <Text style={styles.subtitle}>Choose your favorite dishes and enjoy!</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Margherita Pizza</Text>
        <Text style={styles.cardDesc}>Classic pizza with fresh tomatoes, mozzarella, and basil.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pasta Alfredo</Text>
        <Text style={styles.cardDesc}>Creamy alfredo sauce with penne pasta and parmesan.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Add more items as needed */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "#dbeafe",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#374151",
  },
  card: {
    backgroundColor: "#f9fafb",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827",
  },
  cardDesc: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
