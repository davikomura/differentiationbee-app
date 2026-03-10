// app/(tabs)/home.tsx
import { DailyChallengeCard } from "@/components/home/DailyChallengeCard";
import { StatsGrid } from "@/components/home/StatsGrid";
import { getDailyChallenge } from "@/services/game";
import { listMySessions, startSession } from "@/services/sessions";
import { getMyStats } from "@/services/stats";
import { useAuthStore } from "@/stores/auth";
import type { AxiosError } from "axios";
import type { DailyChallenge } from "@/types/game";
import type { MyStats } from "@/types/stats";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HomeState = {
  dailyChallenge: DailyChallenge | null;
  stats: MyStats | null;
  activeSessionId: number | null;
};

const EMPTY_STATE: HomeState = {
  dailyChallenge: null,
  stats: null,
  activeSessionId: null,
};

type ApiErrorResponse = {
  detail?: string;
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const [state, setState] = useState<HomeState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    try {
      if (authStatus === "unauthenticated") {
        router.replace("/(auth)/login");
        return;
      }

      setError(null);

      const [, dailyChallenge, stats, sessions] = await Promise.all([
        refreshUser(),
        getDailyChallenge(),
        getMyStats(),
        listMySessions({ limit: 20 }),
      ]);

      const activeSession = sessions.find((session) => session.is_active) ?? null;
      setState({
        dailyChallenge,
        stats,
        activeSessionId: activeSession?.id ?? null,
      });
    } catch {
      setError(t("home.errors.loadFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authStatus, refreshUser, router, t]);

  useEffect(() => {
    if (authStatus === "loading") {
      return;
    }

    void loadHomeData();
  }, [authStatus, loadHomeData]);

  function goToSession(sessionId: number) {
    router.push({
      pathname: "/solo/[id]",
      params: { id: String(sessionId) },
    });
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadHomeData();
  }

  async function handleStartPracticeSession() {
    try {
      const session = await startSession({ mode: "practice" });
      goToSession(session.id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const detail = axiosError.response?.data?.detail ?? "";

      if (axiosError.response?.status === 409) {
        const sessions = await listMySessions({ limit: 20 });
        const activeSession = sessions.find((session) => session.is_active);

        if (activeSession) {
          goToSession(activeSession.id);
          return;
        }
      }

      setError(detail || t("home.errors.sessionStartFailed"));
    }
  }

  const { dailyChallenge, stats, activeSessionId } = state;

  if (loading || authStatus === "loading") {
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
        paddingTop: insets.top + 14,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#19D3FF"
        />
      }
    >
      <View className="mb-6">
        <View className="pr-3">
          <Text className="text-[12px] font-extrabold uppercase tracking-[2.5px] text-cyan-300/90">
            {t("home.header.kicker")}
          </Text>
          <Text className="mt-2 text-[32px] font-black leading-[36px] text-white">
            {t("home.header.greeting", {
              name: user?.username ?? t("home.header.fallbackName"),
            })}
          </Text>
          <Text className="mt-2 text-[15px] leading-6 text-slate-300">
            {t("home.header.subtitle")}
          </Text>
        </View>

        <View className="mt-5 h-px bg-white/10" />
      </View>

      <DailyChallengeCard
        t={t}
        dailyChallenge={dailyChallenge}
        onPress={() => void handleStartPracticeSession()}
      />

      {!dailyChallenge ? (
        <View className="mb-5 rounded-[28px] border border-white/10 bg-[#0D1424] p-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-extrabold text-white">
              {t("home.actions.playNow")}
            </Text>
          </View>

          <Text className="text-sm leading-5 text-slate-300">
            {t("home.actions.playHint")}
          </Text>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              className="h-12 flex-1 items-center justify-center rounded-2xl bg-[#F7C948]"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              onPress={() => void handleStartPracticeSession()}
            >
              <Text className="text-[15px] font-black text-[#08111F]">
                {activeSessionId
                  ? t("home.actions.resumeSession")
                  : t("home.actions.startSession")}
              </Text>
            </Pressable>

            <Pressable
              className="h-12 w-28 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              onPress={() => setError(t("home.errors.rankedQueuePending"))}
            >
              <Text className="text-[12px] font-extrabold uppercase tracking-[1.5px] text-cyan-300">
                {t("home.actions.ranked")}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <StatsGrid t={t} stats={stats} />

      {error ? (
        <View className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <Text className="text-sm font-semibold text-red-200">{error}</Text>
        </View>
      ) : null}

      <View className="h-6" />
    </ScrollView>
  );
}
