import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { PaymentStatsChart } from "@/components/custom/PaymentStatsChart";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function PaymentStatsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("token");
          await AsyncStorage.removeItem("user");
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.container}>
            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title" style={styles.title}>
                Payment Insights
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.subtitle}>
              Monitor recent transaction trends and performance.
            </ThemedText>

            <View style={styles.chartContainer}>
              <PaymentStatsChart />
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 10,
    borderRadius: 50,
  },
  titleContainer: {
    backgroundColor: "transparent",
    marginTop: 40,
    marginBottom: 10,
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.9,
  },
  chartContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
