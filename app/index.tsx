// app/index.tsx
import { bootstrapAuth } from "@/services/authSession";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [initialHref, setInitialHref] = useState<"/(auth)/login" | "/(tabs)/home" | null>(null);

  useEffect(() => {
    let mounted = true;

    async function resolveRoute() {
      try {
        const tokens = await bootstrapAuth();

        if (!mounted) return;
        setInitialHref(tokens?.access_token ? "/(tabs)/home" : "/(auth)/login");
      } catch {
        if (mounted) {
          setInitialHref("/(auth)/login");
        }
      }
    }

    resolveRoute();

    return () => {
      mounted = false;
    };
  }, []);

  if (!initialHref) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#F7C948" />
      </View>
    );
  }

  return <Redirect href={initialHref} />;
}
