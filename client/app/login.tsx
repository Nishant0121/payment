import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const API_URL = "https://payment-beta-ebon.vercel.app";

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      console.log(API_URL);
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/login`,
        {
          username,
          password,
        }
      );

      const { message, token, user } = response.data;

      console.log("Login successful:", message);
      console.log("Token:", token);
      console.log("User:", user);

      // Store token securely
      await SecureStore.setItemAsync("token", token);

      // Store user info locally
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Navigate to the tabs screen
      router.replace("/(tabs)");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;

      console.error("Login failed:", err);
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.loginContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo/Icon Section */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#ffffff", "#f8f9fa"]}
                style={styles.logoBackground}
              >
                <Ionicons name="lock-closed" size={40} color="#667eea" />
              </LinearGradient>
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>
              Sign in to continue to your account
            </Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#667eea"
                  style={styles.inputIcon}
                />
                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="#667eea"
                  theme={{
                    colors: {
                      primary: "#667eea",
                      background: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#667eea"
                  style={styles.inputIcon}
                />
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="transparent"
                  activeOutlineColor="#667eea"
                  theme={{
                    colors: {
                      primary: "#667eea",
                      background: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={login}
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              disabled={isLoading}
            >
              <LinearGradient
                colors={
                  isLoading ? ["#cccccc", "#999999"] : ["#764ba2", "#667eea"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View
                      style={[styles.loadingDot, { opacity: fadeAnim }]}
                    />
                    <Text style={styles.loginButtonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loginContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    padding: 30,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 15,
    top: 15,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    paddingLeft: 45,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#666666",
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signUpText: {
    color: "#666666",
    fontSize: 16,
  },
  signUpLink: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "bold",
  },
});
