// app/settings/language.tsx
import i18n, { changeLanguage, type AppLanguage } from "@/lib/i18n";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LANGUAGE_OPTIONS: {
  value: AppLanguage;
  label: string;
  country: string;
}[] = [
  { value: "pt-BR", label: "Português (Brasil)", country: "BR" },
  { value: "en-US", label: "English (US)", country: "US" },
  { value: "es", label: "Español", country: "ES" },
];

export default function LanguageSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const currentLanguage =
    i18n.language === "pt-BR" ||
    i18n.language === "en-US" ||
    i18n.language === "es"
      ? i18n.language
      : "pt-BR";

  const [selected, setSelected] = useState<AppLanguage>(currentLanguage);
  const [saving, setSaving] = useState(false);

  async function handleSelect(language: AppLanguage) {
    if (saving || language === selected) return;

    setSaving(true);

    try {
      await changeLanguage(language);
      setSelected(language);
    } finally {
      setSaving(false);
    }
  }

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
          {t("settingsScreen.items.language.title")}
        </Text>

        <Text className="mt-1 text-sm text-slate-400">
          {t("settingsScreen.languageHelp")}
        </Text>
      </View>

      <View className="gap-3">
        {LANGUAGE_OPTIONS.map((option) => {
          const isSelected = option.value === selected;

          return (
            <Pressable
              key={option.value}
              onPress={() => void handleSelect(option.value)}
              disabled={saving}
              className={`rounded-[20px] border px-5 py-4 ${
                isSelected
                  ? "border-cyan-300/30 bg-cyan-400/10"
                  : "border-white/10 bg-[#0B1220]"
              }`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.94 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <View className="flex-row items-center">
                <CountryFlag isoCode={option.country} size={22} />

                <View className="ml-4 flex-1">
                  <Text className="text-[16px] font-bold text-white">
                    {option.label}
                  </Text>
                  <Text className="text-sm text-slate-400">{option.value}</Text>
                </View>

                {saving && isSelected ? (
                  <ActivityIndicator color="#22D3EE" />
                ) : (
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? "text-cyan-200" : "text-slate-500"
                    }`}
                  >
                    {isSelected
                      ? t("settingsScreen.selected")
                      : t("settingsScreen.select")}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
