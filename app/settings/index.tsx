// app/settings/index.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SettingsLink({
  href,
  title,
  description,
  icon,
}: {
  href: "/settings/language" | "/settings/notifications" | "/settings/security";
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        className="rounded-[20px] border border-white/10 bg-[#0B1220] px-5 py-4"
        style={({ pressed }) => ({
          opacity: pressed ? 0.96 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        })}
      >
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/5">
            <MaterialCommunityIcons name={icon} size={22} color="#67E8F9" />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-[17px] font-bold text-white">{title}</Text>
            <Text className="mt-1 text-sm text-slate-400">{description}</Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color="#94A3B8"
          />
        </View>
      </Pressable>
    </Link>
  );
}

export default function SettingsIndexScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <ScrollView
      className="flex-1 bg-[#050814]"
      contentContainerStyle={{
        paddingTop: insets.top + 4,
        paddingBottom: Math.max(insets.bottom + 28, 36),
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="pb-4">
        <Text className="text-[28px] font-black text-white">
          {t("settingsScreen.title")}
        </Text>

        <Text className="mt-1 text-sm text-slate-400">
          {t("settingsScreen.subtitle")}
        </Text>
      </View>

      <View className="gap-4">
        <SettingsLink
          href="/settings/language"
          title={t("settingsScreen.items.language.title")}
          description={t("settingsScreen.items.language.description")}
          icon="translate"
        />

        <SettingsLink
          href="/settings/notifications"
          title={t("settingsScreen.items.notifications.title")}
          description={t("settingsScreen.items.notifications.description")}
          icon="bell-outline"
        />

        <SettingsLink
          href="/settings/security"
          title={t("settingsScreen.items.security.title")}
          description={t("settingsScreen.items.security.description")}
          icon="shield-lock-outline"
        />
      </View>
    </ScrollView>
  );
}
