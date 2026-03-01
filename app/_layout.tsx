// app/_layout.tsx
import { initI18n } from "@/lib/i18n";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function setupI18n() {
      try {
        await initI18n();
      } catch (error) {
        console.error("Failed to initialize i18n", error);
      } finally {
        if (mounted) {
          setI18nReady(true);
        }
      }
    }

    setupI18n();

    return () => {
      mounted = false;
    };
  }, []);

  if (!i18nReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
