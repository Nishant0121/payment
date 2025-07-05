import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { HapticTab } from "@/components/HapticTab";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userString = await SecureStore.getItemAsync("user");
      const user = userString ? JSON.parse(userString) : null;
      setUserRole(user?.role ?? null);
    };

    loadUser();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: Platform.OS === "ios" ? "absolute" : "relative",
          height: 70,
          backgroundColor: "#ffffffee",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <Ionicons name="swap-horizontal-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-payment"
        options={{
          title: "Add Payment",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
