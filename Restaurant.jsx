// Restaurant.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function Restaurant() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Partner with Us</Text>
        <Text style={styles.subtitle}>
          Join our platform and digitize your dining experience.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Join Us?</Text>

        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>Digital Menus</Text>
          <Text style={styles.benefitDesc}>
            Ditch the paper. Showcase your menu with rich visuals and interactive options.
          </Text>
        </View>

        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>Easy Orders</Text>
          <Text style={styles.benefitDesc}>
            Enable customers to place orders directly from their phones.
          </Text>
        </View>

        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>Realtime Updates</Text>
          <Text style={styles.benefitDesc}>
            Update specials, pricing, or availability anytime from your dashboard.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.ctaButton}>
        <Text style={styles.ctaText}>Register Your Restaurant</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  header: {
    backgroundColor: "#dbeafe",
    paddingVertical: 40,
    paddingHorizontal: 20,
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  benefitCard: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  benefitDesc: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 4,
  },
  ctaButton: {
    margin: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
