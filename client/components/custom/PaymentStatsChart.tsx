import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
  TouchableOpacity,
  RefreshControl,
  ColorValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { AxiosError } from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
const screenWidth = Dimensions.get("window").width;

interface StatsData {
  totalPaymentsToday: number;
  totalPaymentsThisWeek: number;
  totalRevenue: number;
  failedTransactions: number;
  revenueChart: { date: string; revenue: number }[];
}

export const PaymentStatsChart: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week"
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const animateCards = () => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(
        "https://payment-beta-ebon.vercel.app/payments/stats"
      );
      const data = await res.json();
      if (res.ok) {
        setStats(data);
        if (!isRefresh) {
          animateCards();
        }
      } else {
        throw new Error(data?.error || "Failed to fetch stats");
      }
    } catch (error: AxiosError | any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!stats) return;

    const htmlContent = `
      <h1>Payment Report</h1>
      <p><strong>Today's Payments:</strong> ${stats.totalPaymentsToday}</p>
      <p><strong>This Week's Payments:</strong> ${
        stats.totalPaymentsThisWeek
      }</p>
      <p><strong>Total Revenue:</strong> ₹${stats.totalRevenue}</p>
      <p><strong>Success Rate:</strong> ${getSuccessRate()}%</p>
      <p><strong>Failed Transactions:</strong> ${stats.failedTransactions}</p>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Sharing not available on this device.");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not generate PDF.");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    fetchStats(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSuccessRate = () => {
    if (!stats) return 0;
    const total = stats.totalPaymentsThisWeek;
    const failed = stats.failedTransactions;
    return total > 0 ? (((total - failed) / total) * 100).toFixed(1) : 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="analytics-outline" size={64} color="#cbd5e1" />
        <Text style={styles.errorTitle}>No data available</Text>
        <Text style={styles.errorSubtitle}>
          Unable to load payment statistics
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchStats()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = {
    labels: stats.revenueChart.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        data: stats.revenueChart.map((d) => d.revenue),
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
    gradientColors,
  }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
    gradientColors: string[];
  }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient colors={gradientColors} style={styles.statCardGradient}>
        <View style={styles.statCardContent}>
          <View style={styles.statCardHeader}>
            <View
              style={[styles.iconContainer, { backgroundColor: color + "20" }]}
            >
              <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
          <Text style={styles.statValue}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#667eea"]}
          tintColor="#667eea"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Cards Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Today's Payments"
          value={stats.totalPaymentsToday.toLocaleString()}
          icon="today-outline"
          color="#10b981"
          subtitle="transactions"
          gradientColors={["#ffffff", "#f0fdf4"]}
        />

        <StatCard
          title="This Week"
          value={stats.totalPaymentsThisWeek.toLocaleString()}
          icon="calendar-outline"
          color="#3b82f6"
          subtitle="transactions"
          gradientColors={["#ffffff", "#eff6ff"]}
        />

        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="trending-up-outline"
          color="#8b5cf6"
          subtitle="all time"
          gradientColors={["#ffffff", "#faf5ff"]}
        />

        <StatCard
          title="Success Rate"
          value={`${getSuccessRate()}%`}
          icon="checkmark-circle-outline"
          color="#f59e0b"
          subtitle="this week"
          gradientColors={["#ffffff", "#fffbeb"]}
        />
      </View>

      {/* Failed Transactions Alert */}
      {stats.failedTransactions > 0 && (
        <Animated.View
          style={[
            styles.alertCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.alertContent}>
            <Ionicons name="warning-outline" size={24} color="#ef4444" />
            <View style={styles.alertText}>
              <Text style={styles.alertTitle}>Failed Transactions</Text>
              <Text style={styles.alertDescription}>
                {stats.failedTransactions} transactions failed this week
              </Text>
            </View>
            <TouchableOpacity style={styles.alertButton}>
              <Text style={styles.alertButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Chart Section */}
      <Animated.View
        style={[
          styles.chartSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Revenue Trends</Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === "week" && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod("week")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === "week" && styles.periodButtonTextActive,
                ]}
              >
                7D
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === "month" && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod("month")}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === "month" && styles.periodButtonTextActive,
                ]}
              >
                30D
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={Math.max(screenWidth, chartData.labels.length * 60)}
              height={240}
              chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#667eea",
                  fill: "#667eea",
                },
                propsForBackgroundLines: {
                  strokeDasharray: "5,5",
                  stroke: "#e2e8f0",
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
              withHorizontalLines={true}
              withVerticalLines={false}
              withInnerLines={true}
              withOuterLines={false}
              yAxisLabel="₹"
              yAxisSuffix=""
              segments={4}
            />
          </View>
        </ScrollView>

        {/* Chart Insights */}
        <View style={styles.chartInsights}>
          <View style={styles.insightItem}>
            <View style={styles.insightDot} />
            <Text style={styles.insightText}>
              Peak:{" "}
              {formatCurrency(
                Math.max(...stats.revenueChart.map((d) => d.revenue))
              )}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: "#f59e0b" }]} />
            <Text style={styles.insightText}>
              Avg:{" "}
              {formatCurrency(
                stats.revenueChart.reduce((a, b) => a + b.revenue, 0) /
                  stats.revenueChart.length
              )}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleExportPDF}>
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.actionButtonGradient}
          >
            <Ionicons name="share-outline" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Share Analytics</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 24,
  },
  scrollContainer: {
    padding: 10,
    borderRadius: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e2e8f0",
    opacity: 0.9,
  },
  statsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
  },
  statCard: {
    width: (screenWidth - 70) / 2,
    marginBottom: 12,
  },
  statCardGradient: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statCardContent: {
    padding: 20,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  alertCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  alertText: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
  alertDescription: {
    fontSize: 14,
    color: "#7f1d1d",
    marginTop: 2,
  },
  alertButton: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  alertButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  chartSection: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: "#667eea",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  periodButtonTextActive: {
    color: "#ffffff",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  chartInsights: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#667eea",
    marginRight: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  retryButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
