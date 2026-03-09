// app/settings/security.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SecurityCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View className="rounded-[20px] border border-white/10 bg-[#0B1220] px-5 py-4">
      <View className="flex-row items-start">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/5">
          <MaterialCommunityIcons name={icon} size={22} color="#67E8F9" />
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-[16px] font-bold text-white">{title}</Text>
          <Text className="mt-1 text-sm leading-6 text-slate-400">
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function SecuritySettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <ScrollView
      className="flex-1 bg-[#050814]"
      contentContainerStyle={{
        paddingTop: insets.top + 6,
        paddingBottom: Math.max(insets.bottom + 24, 32),
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="pt-2 pb-5">
        <Text className="text-[26px] font-black text-white">
          {t("settingsScreen.items.security.title")}
        </Text>

        <Text className="mt-1 text-sm leading-6 text-slate-400">
          {t("settingsScreen.securityHelp")}
        </Text>
      </View>

      <View className="gap-3">
        <SecurityCard
          icon="lock-outline"
          title={t("settingsScreen.placeholders.passwordTitle")}
          description={t("settingsScreen.placeholders.passwordDescription")}
        />

        <SecurityCard
          icon="devices"
          title={t("settingsScreen.placeholders.sessionsTitle")}
          description={t("settingsScreen.placeholders.sessionsDescription")}
        />
      </View>
    </ScrollView>
  );
}
