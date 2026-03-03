// app/(tabs)/home.tsx
import { signOut } from "@/services/authSession";
import { getDailyChallenge } from "@/services/game";
import { getGlobalLeaderboard } from "@/services/leaderboard";
import { getCurrentUser } from "@/services/profile";
import { getMyStats } from "@/services/stats";
import { loadTokens } from "@/services/tokenStore";
import type { DailyChallenge } from "@/types/game";
import type { LeaderboardEntry } from "@/types/leaderboard";
import type { CurrentUser } from "@/types/profile";
import type { MyStats } from "@/types/stats";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  user: CurrentUser | null;
  dailyChallenge: DailyChallenge | null;
  leaderboard: LeaderboardEntry[];
  stats: MyStats | null;
};

const EMPTY_STATE: HomeState = {
  user: null,
  dailyChallenge: null,
  leaderboard: [],
  stats: null,
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [state, setState] = useState<HomeState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHomeData() {
    try {
      const tokens = await loadTokens();

      if (!tokens?.access_token) {
        router.replace("/(auth)/login");
        return;
      }

      setError(null);

      const [user, dailyChallenge, leaderboard, stats] = await Promise.all([
        getCurrentUser(),
        getDailyChallenge(),
        getGlobalLeaderboard(),
        getMyStats(),
      ]);

      setState({ user, dailyChallenge, leaderboard, stats });
    } catch {
      setError(t("home.errors.loadFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadHomeData();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadHomeData();
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/(auth)/login");
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#070B14]">
        <ActivityIndicator color="#19D3FF" />
      </View>
    );
  }

  const { user, dailyChallenge, leaderboard, stats } = state;

  return (
    <ScrollView
      className="flex-1 bg-[#070B14]"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 24,
        paddingHorizontal: 24,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#19D3FF"
        />
      }
    >
      <View className="mb-8 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-cyan-300">
            {t("home.header.kicker")}
          </Text>
          <Text className="mt-2 text-3xl font-extrabold text-white">
            {t("home.header.greeting", {
              name: user?.username ?? t("home.header.fallbackName"),
            })}
          </Text>
          <Text className="mt-2 text-base leading-6 text-slate-300">
            {t("home.header.subtitle")}
          </Text>
        </View>

        <Pressable
          onPress={handleSignOut}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
        >
          <Text className="text-sm font-bold text-cyan-300">
            {t("home.actions.signOut")}
          </Text>
        </Pressable>
      </View>

      <View className="mb-5 rounded-[28px] border border-white/10 bg-[#10182A] p-5">
        <Text className="text-sm font-semibold text-slate-400">
          {t("home.stats.points")}
        </Text>
        <Text className="mt-2 text-4xl font-extrabold text-[#F7C948]">
          {user?.points ?? 0}
        </Text>
        <Text className="mt-3 text-base text-white">
          {user?.tier?.title ?? t("home.stats.noTier")}
        </Text>
      </View>

      <View className="mb-5 rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-5">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-cyan-300">
          {t("home.daily.title")}
        </Text>
        {dailyChallenge ? (
          <>
            <Text className="mt-3 text-lg font-bold text-white">
              {t("home.daily.level", { level: dailyChallenge.level })}
            </Text>
            <Text className="mt-2 text-base leading-6 text-slate-100">
              {dailyChallenge.expression_str}
            </Text>
            <Text className="mt-3 text-sm text-slate-300">
              {t("home.daily.date", { date: dailyChallenge.challenge_date })}
            </Text>
          </>
        ) : (
          <Text className="mt-3 text-sm text-slate-300">
            {t("home.daily.empty")}
          </Text>
        )}
      </View>

      <View className="mb-5 rounded-[28px] border border-white/10 bg-[#0D1424] p-5">
        <Text className="text-xl font-extrabold text-white">
          {t("home.actions.playNow")}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-slate-300">
          {t("home.actions.playHint")}
        </Text>
        <Pressable className="mt-4 h-12 items-center justify-center rounded-2xl bg-[#F7C948]">
          <Text className="text-base font-extrabold text-[#08111F]">
            {t("home.actions.startSession")}
          </Text>
        </Pressable>
      </View>

      <View className="mb-5 rounded-[28px] border border-white/10 bg-[#10182A] p-5">
        <Text className="mb-4 text-xl font-extrabold text-white">
          {t("home.statsCard.title")}
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <View className="mb-3 w-[48%] rounded-2xl bg-white/5 p-4">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-400">
              {t("home.statsCard.sessions")}
            </Text>
            <Text className="mt-2 text-2xl font-extrabold text-white">
              {stats?.total_sessions ?? 0}
            </Text>
          </View>
          <View className="mb-3 w-[48%] rounded-2xl bg-white/5 p-4">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-400">
              {t("home.statsCard.attempts")}
            </Text>
            <Text className="mt-2 text-2xl font-extrabold text-white">
              {stats?.total_attempts ?? 0}
            </Text>
          </View>
          <View className="w-[48%] rounded-2xl bg-white/5 p-4">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-400">
              {t("home.statsCard.accuracy")}
            </Text>
            <Text className="mt-2 text-2xl font-extrabold text-white">
              {stats ? `${Math.round(stats.accuracy_pct)}%` : "0%"}
            </Text>
          </View>
          <View className="w-[48%] rounded-2xl bg-white/5 p-4">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-400">
              {t("home.statsCard.score")}
            </Text>
            <Text className="mt-2 text-2xl font-extrabold text-white">
              {stats?.total_score ?? 0}
            </Text>
          </View>
        </View>
      </View>

      <View className="rounded-[28px] border border-white/10 bg-[#10182A] p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-extrabold text-white">
            {t("home.ranking.title")}
          </Text>
          <Text className="text-sm font-semibold text-slate-400">
            Top {leaderboard.length}
          </Text>
        </View>

        {leaderboard.length > 0 ? (
          leaderboard.map((entry) => (
            <View
              key={entry.user_id}
              className="mb-3 flex-row items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
            >
              <View className="flex-row items-center">
                <Text className="w-8 text-base font-extrabold text-cyan-300">
                  #{entry.rank}
                </Text>
                <Text className="text-base font-semibold text-white">
                  {entry.username}
                </Text>
              </View>
              <Text className="text-sm font-bold text-[#F7C948]">
                {entry.points} pts
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-sm text-slate-300">
            {t("home.ranking.empty")}
          </Text>
        )}
      </View>

      {error ? (
        <View className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <Text className="text-sm text-red-200">{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
