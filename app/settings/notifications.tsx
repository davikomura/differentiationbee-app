// app/settings/notifications.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function NotificationRow({
  title,
  description,
  icon,
  value,
  onChange,
}: {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="rounded-[20px] border border-white/10 bg-[#0B1220] px-5 py-4">
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/5">
          <MaterialCommunityIcons name={icon} size={22} color="#67E8F9" />
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-[16px] font-bold text-white">{title}</Text>
          <Text className="mt-1 text-sm text-slate-400">{description}</Text>
        </View>

        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: "#1E293B", true: "#22D3EE" }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

export default function NotificationsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

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
          {t("settingsScreen.items.notifications.title")}
        </Text>

        <Text className="mt-1 text-sm leading-6 text-slate-400">
          {t("settingsScreen.notificationsHelp")}
        </Text>
      </View>

      <View className="gap-3">
        <NotificationRow
          icon="bell-outline"
          title={t("settingsScreen.placeholders.pushTitle")}
          description={t("settingsScreen.placeholders.pushDescription")}
          value={pushEnabled}
          onChange={setPushEnabled}
        />

        <NotificationRow
          icon="email-outline"
          title={t("settingsScreen.placeholders.emailTitle")}
          description={t("settingsScreen.placeholders.emailDescription")}
          value={emailEnabled}
          onChange={setEmailEnabled}
        />
      </View>
    </ScrollView>
  );
}
