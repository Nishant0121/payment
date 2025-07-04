import React, { useState, useRef } from "react";
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
import { AxiosError } from "axios";

export const AddPaymentForm = () => {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [status, setStatus] = useState("success");
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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

  const statusOptions = [
    {
      label: "Success",
      value: "success",
      color: "#4CAF50",
      icon: "checkmark-circle",
    },
    { label: "Pending", value: "pending", color: "#FF9800", icon: "time" },
    {
      label: "Failed",
      value: "failed",
      color: "#F44336",
      icon: "close-circle",
    },
  ];

  const methodOptions = [
    { label: "UPI", value: "upi", color: "#6C63FF", icon: "phone-portrait" },
    { label: "Card", value: "card", color: "#FF6B6B", icon: "card" },
    {
      label: "Net Banking",
      value: "netbanking",
      color: "#4ECDC4",
      icon: "globe",
    },
    { label: "Wallet", value: "wallet", color: "#45B7D1", icon: "wallet" },
  ];

  const handleSubmit = async () => {
    if (!amount || !receiver || !status || !method) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert("Validation Error", "Amount must be greater than 0.");
      return;
    }

    const paymentData = {
      amount: parseFloat(amount),
      receiver,
      status,
      method,
      referenceId:
        "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
    };

    try {
      setLoading(true);
      const response = await fetch(
        "https://payment-beta-ebon.vercel.app/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          `Payment created successfully with ID: ${data.id}`
        );
        setAmount("");
        setReceiver("");
        setStatus("success");
        setMethod("upi");
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (error: AxiosError | any) {
      Alert.alert("Error", "Failed to submit payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    if (numericValue) {
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(parseFloat(numericValue));
      return formatted;
    }
    return "";
  };

  const getStatusOption = (value: string) =>
    statusOptions.find((option) => option.value === value) || statusOptions[0];

  const getMethodOption = (value: string) =>
    methodOptions.find((option) => option.value === value) || methodOptions[0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="cash" size={18} color="#667eea" /> Amount
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.amountInput]}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#a0a0a0"
                value={amount}
                onChangeText={setAmount}
              />
              {amount && (
                <Text style={styles.amountPreview}>{formatAmount(amount)}</Text>
              )}
            </View>
          </View>

          {/* Receiver Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="person" size={18} color="#667eea" /> Receiver
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter receiver ID or phone number"
                placeholderTextColor="#a0a0a0"
                value={receiver}
                onChangeText={setReceiver}
              />
            </View>
          </View>

          {/* Status Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="flag" size={18} color="#667eea" /> Status
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
            >
              <View style={styles.pickerButtonContent}>
                <Ionicons
                  name={getStatusOption(status).icon as any}
                  size={20}
                  color={getStatusOption(status).color}
                />
                <Text style={styles.pickerButtonText}>
                  {getStatusOption(status).label}
                </Text>
                <Ionicons
                  name={showStatusPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#667eea"
                />
              </View>
            </TouchableOpacity>
            {showStatusPicker && (
              <View style={styles.pickerContainer}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerOption,
                      status === option.value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setStatus(option.value);
                      setShowStatusPicker(false);
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

          {/* Method Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="card" size={18} color="#667eea" /> Payment Method
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowMethodPicker(!showMethodPicker)}
            >
              <View style={styles.pickerButtonContent}>
                <Ionicons
                  name={getMethodOption(method).icon as any}
                  size={20}
                  color={getMethodOption(method).color}
                />
                <Text style={styles.pickerButtonText}>
                  {getMethodOption(method).label}
                </Text>
                <Ionicons
                  name={showMethodPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#667eea"
                />
              </View>
            </TouchableOpacity>
            {showMethodPicker && (
              <View style={styles.pickerContainer}>
                {methodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerOption,
                      method === option.value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setMethod(option.value);
                      setShowMethodPicker(false);
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
              colors={loading ? ["#cccccc", "#999999"] : ["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.submitButtonText}>Processing...</Text>
                </View>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Ionicons name="send" size={20} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Submit Payment</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.securityText}>
              Your payment is secured with end-to-end encryption
            </Text>
          </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    padding: 25,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    padding: 15,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#333333",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  amountInput: {
    paddingRight: 100,
  },
  amountPreview: {
    position: "absolute",
    right: 15,
    top: 15,
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    color: "#333333",
    flex: 1,
    marginLeft: 10,
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
    color: "#333333",
    marginLeft: 10,
  },
  submitButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 5,
    },
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
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f8f0",
    borderRadius: 10,
  },
  securityText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 6,
  },
});
