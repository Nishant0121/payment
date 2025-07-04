import React from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TransactionList } from "@/components/custom/TransactionList";
import { LinearGradient } from "expo-linear-gradient";

export default function TransactionsPage() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header with gradient */}
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>Transactions</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your payments</ThemedText>
        </View>
      </LinearGradient>

      {/* Transaction List */}
      <View style={styles.content}>
        <TransactionList />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#e2e8f0",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginTop: -12,
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
