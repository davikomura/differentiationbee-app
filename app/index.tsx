// app/index.tsx
import { useAuthStore } from "@/stores/auth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const status = useAuthStore((state) => state.status);

  if (!isHydrated || status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#F7C948" />
      </View>
    );
  }

  return (
    <Redirect
      href={status === "authenticated" ? "/(tabs)/home" : "/(auth)/login"}
    />
  );
}
