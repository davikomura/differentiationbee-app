// app/(tabs)/stats.tsx
import { getMyStats } from "@/services/stats";
import type { MyStats } from "@/types/stats";
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="mb-3 rounded-[24px] border border-white/10 bg-[#10182A] p-5">
      <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-400">
        {label}
      </Text>
      <Text className="mt-2 text-2xl font-extrabold text-white">{value}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    try {
      setError(null);
      const data = await getMyStats();
      setStats(data);
    } catch {
      setError(t("statsScreen.error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadStats();
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
            void loadStats();
          }}
          tintColor="#19D3FF"
        />
      }
    >
      <Text className="text-3xl font-extrabold text-white">
        {t("statsScreen.title")}
      </Text>
      <Text className="mt-2 mb-6 text-base leading-6 text-slate-300">
        {t("statsScreen.subtitle")}
      </Text>

      {stats ? (
        <>
          <StatCard
            label={t("statsScreen.sessions")}
            value={stats.total_sessions}
          />
          <StatCard
            label={t("statsScreen.attempts")}
            value={stats.total_attempts}
          />
          <StatCard
            label={t("statsScreen.correct")}
            value={stats.correct_attempts}
          />
          <StatCard
            label={t("statsScreen.accuracy")}
            value={`${Math.round(stats.accuracy_pct)}%`}
          />
          <StatCard
            label={t("statsScreen.bestScore")}
            value={stats.best_score}
          />
          <StatCard
            label={t("statsScreen.avgTime")}
            value={`${stats.average_time_ms} ms`}
          />
        </>
      ) : (
        <View className="rounded-[24px] border border-white/10 bg-[#10182A] p-5">
          <Text className="text-sm text-slate-300">
            {t("statsScreen.empty")}
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
