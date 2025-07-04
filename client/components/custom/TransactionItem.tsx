import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TransactionItemProps {
  item: {
    _id: string;
    amount: number;
    status: string;
    method: string;
    receiver?: string;
    timestamp?: string;
  };
  onPress: (item: any) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "failed":
      case "declined":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "card":
        return "card-outline";
      case "bank":
        return "business-outline";
      case "wallet":
        return "wallet-outline";
      case "upi":
        return "phone-portrait-outline";
      default:
        return "swap-horizontal-outline";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Ionicons
            name={getMethodIcon(item.method)}
            size={24}
            color={getStatusColor(item.status)}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
          <Text style={styles.receiver} numberOfLines={1}>
            {item.receiver || "Unknown recipient"}
          </Text>
          {item.timestamp && (
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "15" },
          ]}
        >
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.method}>{item.method}</Text>
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  receiver: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#94a3b8",
  },
  rightSection: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  status: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  method: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
    textTransform: "capitalize",
  },
});
