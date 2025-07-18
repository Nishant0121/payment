import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaFrameContext } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { AddUserForm } from "@/components/custom/AddUserForn";

export default function AddUserScreen() {
  return (
    <SafeAreaFrameContext value={null}>
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
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title" style={styles.title}>
                Add User
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.subtitle}>
              Fill out the form to create a new user.
            </ThemedText>

            <View style={styles.formContainer}>
              <AddUserForm />
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaFrameContext>
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
  titleContainer: {
    backgroundColor: "transparent",
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
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
