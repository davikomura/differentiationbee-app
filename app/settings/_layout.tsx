// app/settings/_layout.tsx
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SettingsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#050814",
        },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "800",
        },
        contentStyle: {
          backgroundColor: "#050814",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: t("settingsScreen.title") }}
      />
      <Stack.Screen
        name="language"
        options={{ title: t("settingsScreen.items.language.title") }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: t("settingsScreen.items.notifications.title") }}
      />
      <Stack.Screen
        name="security"
        options={{ title: t("settingsScreen.items.security.title") }}
      />
    </Stack>
  );
}
