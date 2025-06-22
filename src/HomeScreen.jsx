import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChefHat, Smartphone, TrendingUp, PieChart } from "lucide-react-native";

export default function HomeScreen() {
  const navigation = useNavigation();

  const features = [
    {
      Icon: Smartphone,
      title: "Interactive Digital Menus",
      desc: "Stunning food photography, detailed ingredients, nutritional facts, and chef's recommendations."
    },
    {
      Icon: TrendingUp,
      title: "Real-Time Specials",
      desc: "Restaurants can instantly push today's specials, seasonal items, and promotions."
    },
    {
      Icon: PieChart,
      title: "Smart Restaurant Tools",
      desc: "eMenu management, KOT orders, bill summaries, and daily sales reports - all in one."
    }
  ];

  return (
    <ScrollView style={styles.scroll}>
      <StatusBar style="auto" />

      {/* Hero Section */}
      <View style={styles.hero}>
        <ChefHat size={64} color="#2563eb" style={styles.iconSpacing} />
        <Text style={styles.heroTitle}>Revolutionizing Dining</Text>
        <Text style={styles.heroSubtitle}>Digital Menus & Beyond</Text>
        <Text style={styles.heroDescription}>
          Replace physical menus with interactive digital experiences that showcase your food's story, ingredients, and nutrition.
        </Text>

        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Order")}
          >
            <Text style={styles.primaryButtonText}>Start Ordering</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Restaurant")}
          >
            <Text style={styles.secondaryButtonText}>For Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Transform Your Dining Experience</Text>
        {features.map((feature, i) => {
          const Icon = feature.Icon;
          return (
            <View key={i} style={styles.featureCard}>
              <Icon size={32} color="#2563eb" style={styles.iconSpacing} />
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          );
        })}
      </View>

      {/* Demo */}
      <View style={styles.demoSection}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1074&q=80" }}
          style={styles.demoImage}
        />
        <Text style={styles.demoTitle}>Experience the Future of Dining</Text>
        <Text style={styles.demoText}>
          ✓ Beautiful food photography{'\n'}
          ✓ Ingredient & nutritional info{'\n'}
          ✓ Allergen alerts & dietary filters{'\n'}
          ✓ Instant daily updates
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("HowItWorks")}
          style={[styles.primaryButton , { marginTop: 16 }]}
        >
          <Text style={[styles.primaryButtonText]}>See How It Works</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  hero: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: "#dbeafe",
  },
  iconSpacing: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily:"LeagueSpartan-Regular",
    textAlign: "center",
    color: "#111827",
  },
  heroSubtitle: {
    fontSize: 20,
    marginTop: 8,
    textAlign: "center",
    color: "#2563eb",
  },
  heroDescription: {
    marginTop: 16,
    textAlign: "center",
    color: "#374151",
    paddingHorizontal: 8,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderColor: "#2563eb",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  featuresSection: {
    padding: 24,
    backgroundColor: "#f9fafb",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#111827",
  },
  featureCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  featureDesc: {
    color: "#374151",
  },
  demoSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: "#dbeafe",
  },
  demoImage: {
    width: "100%",
    height: 224,
    borderRadius: 12,
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  demoText: {
    color: "#374151",
    lineHeight: 22,
  },
});
