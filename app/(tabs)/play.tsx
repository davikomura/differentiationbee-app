// app/(tabs)/play.tsx
import { listMySessions, startSession } from "@/services/sessions";
import type { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ApiErrorResponse = {
  detail?: string;
};

export default function PlayScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveSession = useCallback(async () => {
    try {
      setError(null);
      const sessions = await listMySessions({ limit: 20 });
      const activeSession =
        sessions.find((session) => session.is_active) ?? null;
      setActiveSessionId(activeSession?.id ?? null);
    } catch {
      setError(t("playScreen.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadActiveSession();
  }, [loadActiveSession]);

  function goToSession(sessionId: number) {
    router.push({
      pathname: "/solo/[id]",
      params: { id: String(sessionId) },
    });
  }

  async function handlePractice() {
    try {
      setStarting(true);
      setError(null);

      if (activeSessionId) {
        goToSession(activeSessionId);
        return;
      }

      const session = await startSession({ mode: "practice" });
      goToSession(session.id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const detail = axiosError.response?.data?.detail ?? "";

      if (axiosError.response?.status === 409) {
        const sessions = await listMySessions({ limit: 20 });
        const activeSession = sessions.find((session) => session.is_active);

        if (activeSession) {
          setActiveSessionId(activeSession.id);
          goToSession(activeSession.id);
          return;
        }
      }

      setError(detail || t("playScreen.startError"));
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#070B14]">
        <ActivityIndicator color="#19D3FF" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#070B14]"
      contentContainerStyle={{
        paddingTop: insets.top + 18,
        paddingBottom: Math.max(insets.bottom + 28, 36),
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER / HERO SEM CARD */}
      <View>
        <View className="flex-row items-center justify-between">
          <View className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5">
            <Text className="text-[11px] font-extrabold uppercase tracking-[2.3px] text-cyan-300">
              {t("playScreen.kicker")}
            </Text>
          </View>

          <View className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <Text className="text-[10px] font-black uppercase tracking-[1.8px] text-slate-300">
              {activeSessionId
                ? t("playScreen.statusActive")
                : t("playScreen.statusStandby")}
            </Text>
          </View>
        </View>

        <Text className="mt-5 text-[38px] font-black leading-[40px] text-white">
          {t("playScreen.title")}
        </Text>

        <Text className="mt-3 max-w-[95%] text-[15px] leading-6 text-slate-300">
          {t("playScreen.subtitle")}
        </Text>
      </View>

      {/* PRACTICE */}
      <View className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-[#10182A]">
        <View className="p-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-cyan-300/80">
                {t("playScreen.mainModeLabel")}
              </Text>
              <Text className="mt-2 text-[22px] font-black text-white">
                {activeSessionId
                  ? t("playScreen.resumeTitle")
                  : t("playScreen.practiceTitle")}
              </Text>
            </View>

            <View className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2">
              <Text className="text-[10px] font-extrabold uppercase tracking-[1.8px] text-cyan-300">
                {t("playScreen.soloBadge")}
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-sm leading-6 text-slate-300">
            {activeSessionId
              ? t("playScreen.resumeDescription", { id: activeSessionId })
              : t("playScreen.practiceDescription")}
          </Text>

          <Pressable
            className="mt-5 overflow-hidden rounded-2xl"
            style={({ pressed }) => ({
              opacity: pressed || starting ? 0.88 : 1,
            })}
            onPress={() => void handlePractice()}
            disabled={starting}
          >
            <View className="items-center justify-center border border-[#F7C948]/40 bg-[#F7C948] px-5 py-4">
              <Text className="text-[15px] font-black uppercase tracking-[1px] text-[#08111F]">
                {starting
                  ? t("playScreen.loading")
                  : activeSessionId
                    ? t("playScreen.resumeButton")
                    : t("playScreen.practiceButton")}
              </Text>
            </View>
            <View className="h-1 bg-white/20" />
          </Pressable>
        </View>
      </View>

      {/* RANKED */}
      <View className="mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-[#10182A]">
        <View className="p-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#F7C948]">
                {t("playScreen.competitiveLabel")}
              </Text>
              <Text className="mt-2 text-[22px] font-black text-white">
                {t("playScreen.rankedTitle")}
              </Text>
            </View>

            <View className="rounded-2xl border border-[#F7C948]/20 bg-[#F7C948]/10 px-3 py-2">
              <Text className="text-[10px] font-extrabold uppercase tracking-[1.8px] text-[#F7C948]">
                {t("playScreen.soonBadge")}
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-sm leading-6 text-slate-300">
            {t("playScreen.rankedDescription")}
          </Text>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-2xl border border-white/10 bg-[#0D1424] px-4 py-3">
              <Text className="text-[10px] font-extrabold uppercase tracking-[2px] text-slate-400">
                {t("playScreen.queueLabel")}
              </Text>
              <Text className="mt-1 text-base font-black text-white">
                {t("playScreen.queueStatus")}
              </Text>
            </View>

            <View className="flex-1 rounded-2xl border border-white/10 bg-[#0D1424] px-4 py-3">
              <Text className="text-[10px] font-extrabold uppercase tracking-[2px] text-slate-400">
                PvP
              </Text>
              <Text className="mt-1 text-base font-black text-[#F7C948]">
                {t("playScreen.pvpStatus")}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {error ? (
        <View className="mt-5 overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/10">
          <View className="h-1 bg-red-400/70" />
          <View className="p-4">
            <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-red-300/90">
              {t("playScreen.alertLabel")}
            </Text>
            <Text className="mt-2 text-sm font-semibold leading-6 text-red-200">
              {error}
            </Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
