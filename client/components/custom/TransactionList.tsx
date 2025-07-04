import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import { TransactionItem } from "./TransactionItem";
import { TransactionFilters } from "./TransactionFilters";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export interface Transaction {
  _id: string;
  amount: number;
  status: string;
  method: string;
  receiver?: string;
  referenceId?: string;
  timestamp?: string;
}

export const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<{
    status: string;
    method: string;
  }>({ status: "", method: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();

  const handleNavigate = (item: Transaction) => {
    router.push({
      pathname: "/transactions-details",
      params: { id: item._id },
    });
  };

  const fetchTransactions = async (reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const query = `page=${currentPage}&limit=10`;
      const response = await fetch(
        `https://payment-beta-ebon.vercel.app/payments?${query}`
      );
      const data = await response.json();

      if (reset) {
        setTransactions(data.payments);
        setPage(1);
      } else {
        setTransactions((prev) => [...prev, ...data.payments]);
      }

      setHasMore(data.payments.length === 10);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchTransactions();
    }
  };

  const filteredData = transactions.filter((t) => {
    const statusMatch = filters.status ? t.status === filters.status : true;
    const methodMatch = filters.method ? t.method === filters.method : true;
    return statusMatch && methodMatch;
  });

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No transactions found</Text>
      <Text style={styles.emptySubtitle}>
        Your transactions will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TransactionFilters filters={filters} onFiltersChange={setFilters} />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TransactionItem item={item} onPress={handleNavigate} />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366f1"]}
            tintColor="#6366f1"
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
    color: "#64748b",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
});
