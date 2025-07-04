import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface TransactionFiltersProps {
  filters: {
    status: string;
    method: string;
  };
  onFiltersChange: (filters: { status: string; method: string }) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const statusOptions = ["", "success", "pending", "failed"];
  const methodOptions = ["", "card", "bank", "wallet", "upi"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter by Status</Text>
      <View style={styles.filterRow}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filters.status === status && styles.activeChip,
            ]}
            onPress={() => onFiltersChange({ ...filters, status })}
          >
            <Text
              style={[
                styles.filterText,
                filters.status === status && styles.activeText,
              ]}
            >
              {status || "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.title}>Filter by Method</Text>
      <View style={styles.filterRow}>
        {methodOptions.map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.filterChip,
              filters.method === method && styles.activeChip,
            ]}
            onPress={() => onFiltersChange({ ...filters, method })}
          >
            <Text
              style={[
                styles.filterText,
                filters.method === method && styles.activeText,
              ]}
            >
              {method || "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeChip: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  filterText: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "capitalize",
  },
  activeText: {
    color: "#ffffff",
  },
});
