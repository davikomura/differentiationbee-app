// app/(tabs)/leaderboard.tsx
import { getGlobalLeaderboard } from "@/services/leaderboard";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRanking() {
    try {
      setError(null);
      const data = await getGlobalLeaderboard(20);
      setItems(data);
    } catch {
      setError(t("leaderboardScreen.error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadRanking();
  }, []);

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
        paddingTop: insets.top + 16,
        paddingBottom: 24,
        paddingHorizontal: 24,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadRanking();
          }}
          tintColor="#19D3FF"
        />
      }
    >
      <Text className="text-3xl font-extrabold text-white">
        {t("leaderboardScreen.title")}
      </Text>
      <Text className="mt-2 mb-6 text-base leading-6 text-slate-300">
        {t("leaderboardScreen.subtitle")}
      </Text>

      {items.length > 0 ? (
        items.map((entry) => (
          <View
            key={entry.user_id}
            className="mb-3 flex-row items-center justify-between rounded-[24px] border border-white/10 bg-[#10182A] px-5 py-4"
          >
            <View>
              <Text className="text-xs font-semibold uppercase tracking-[1px] text-cyan-300">
                #{entry.rank}
              </Text>
              <Text className="mt-1 text-lg font-bold text-white">
                {entry.username}
              </Text>
            </View>
            <Text className="text-base font-extrabold text-[#F7C948]">
              {t("leaderboardScreen.points", { points: entry.points })}
            </Text>
          </View>
        ))
      ) : (
        <View className="rounded-[24px] border border-white/10 bg-[#10182A] p-5">
          <Text className="text-sm text-slate-300">
            {t("leaderboardScreen.empty")}
          </Text>
        </View>
      )}

      {error ? (
        <View className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <Text className="text-sm text-red-200">{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
