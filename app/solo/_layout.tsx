// app/solo/_layout.tsx
import { Stack } from "expo-router";

export default function SoloLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#070B14" },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#070B14" },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Solo",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
