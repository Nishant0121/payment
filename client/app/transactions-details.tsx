import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface TransactionDetail {
  _id: string;
  amount: number;
  status: string;
  method: string;
  receiver?: string;
  referenceId?: string;
  timestamp?: string;
}

export default function TransactionDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(
          `https://payment-beta-ebon.vercel.app/payments/${id}`
        );
        const data = await response.json();
        setTransaction(data);
      } catch (err) {
        console.error("Failed to load transaction", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Transaction not found</Text>
        <Text style={styles.errorSubtitle}>
          The transaction you&apos;re looking for doesn&apos;t exist
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      {/* Header */}
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(transaction.status) + "20" },
            ]}
          >
            <Ionicons
              name={
                transaction.status.toLowerCase() === "success"
                  ? "checkmark-circle"
                  : transaction.status.toLowerCase() === "pending"
                  ? "time"
                  : "close-circle"
              }
              size={32}
              color={getStatusColor(transaction.status)}
            />
          </View>
          <Text style={styles.amountText}>
            {formatAmount(transaction.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(transaction.status) + "15" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {transaction.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Details Cards */}
        <View style={styles.detailsContainer}>
          <DetailCard
            icon="person-outline"
            title="Recipient"
            value={transaction.receiver || "Unknown"}
          />

          <DetailCard
            icon="card-outline"
            title="Payment Method"
            value={transaction.method}
          />

          <DetailCard
            icon="document-text-outline"
            title="Reference ID"
            value={transaction.referenceId || "N/A"}
          />

          <DetailCard
            icon="time-outline"
            title="Date & Time"
            value={
              transaction.timestamp
                ? new Date(transaction.timestamp).toLocaleString()
                : "N/A"
            }
          />

          <DetailCard
            icon="key-outline"
            title="Transaction ID"
            value={transaction._id}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="download-outline" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Download Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="share-outline" size={20} color="#6366f1" />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const DetailCard = ({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) => (
  <View style={styles.detailCard}>
    <View style={styles.detailHeader}>
      <Ionicons name={icon as any} size={20} color="#6366f1" />
      <Text style={styles.detailTitle}>{title}</Text>
    </View>
    <Text style={styles.detailValue} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  statusIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  amountText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsContainer: {
    gap: 12,
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryButtonText: {
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
  },
  backButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
