import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import "react-native-reanimated";
import * as SecureStore from "expo-secure-store";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // TEMPORARY: mock auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // In a real app, check for token in secure storage here
    const checkAuth = async () => {
      const storedToken = await SecureStore.getItemAsync("token");
      setIsAuthenticated(!!storedToken);
    };
    checkAuth();
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="login" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
