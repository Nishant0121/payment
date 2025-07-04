import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

const roleOptions = [
  { label: "Admin", value: "admin", color: "#f44336", icon: "person-circle" },
  { label: "Manager", value: "manager", color: "#ff9800", icon: "people" },
  { label: "Intern", value: "intern", color: "#2196f3", icon: "school" },
];

export const AddUserForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("intern");
  const [loading, setLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const getRoleOption = (value: string) =>
    roleOptions.find((opt) => opt.value === value) || roleOptions[0];

  const handleSubmit = async () => {
    if (!username || !password || !role) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    const userData = { username, password, role };

    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Error", "Authorization token not found.");
        return;
      }

      const response = await fetch(
        "https://payment-beta-ebon.vercel.app/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          `User created successfully with ID: ${data.userId}`
        );
        setUsername("");
        setPassword("");
        setRole("intern");
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="person" size={18} color="#667eea" /> Username
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor="#a0a0a0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="lock-closed" size={18} color="#667eea" /> Password
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#a0a0a0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Role Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="briefcase" size={18} color="#667eea" /> Role
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowRolePicker(!showRolePicker)}
            >
              <View style={styles.pickerButtonContent}>
                <Ionicons
                  name={getRoleOption(role).icon as any}
                  size={20}
                  color={getRoleOption(role).color}
                />
                <Text style={styles.pickerButtonText}>
                  {getRoleOption(role).label}
                </Text>
                <Ionicons
                  name={showRolePicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#667eea"
                />
              </View>
            </TouchableOpacity>
            {showRolePicker && (
              <View style={styles.pickerContainer}>
                {roleOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerOption,
                      role === option.value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setRole(option.value);
                      setShowRolePicker(false);
                    }}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={option.color}
                    />
                    <Text style={styles.pickerOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ["#ccc", "#999"] : ["#667eea", "#764ba2"]}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.submitButtonText}>Creating...</Text>
                </View>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Add User</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    padding: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pickerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    justifyContent: "space-between",
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginLeft: 10,
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f0f0ff",
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  submitButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
