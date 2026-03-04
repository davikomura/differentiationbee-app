// components/home/StatsGrid.tsx
import type { MyStats } from "@/types/stats";
import React from "react";
import { Text, View } from "react-native";

export function StatsGrid({
  t,
  stats,
}: {
  t: (key: string, options?: any) => string;
  stats: MyStats | null;
}) {
  const accuracyText = stats ? `${Math.round(stats.accuracy_pct)}%` : "0%";

  return (
    <View className="mb-5 rounded-[28px] border border-white/10 bg-[#10182A] p-5">
      <Text className="mb-4 text-base font-extrabold text-white">
        {t("home.statsCard.title")}
      </Text>

      <View className="flex-row flex-wrap justify-between">
        <View className="mb-3 w-[49%] rounded-2xl border border-white/10 bg-white/5 p-4">
          <Text className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-slate-400">
            {t("home.statsCard.sessions")}
          </Text>
          <Text className="mt-2 text-2xl font-black text-white">
            {stats?.total_sessions ?? 0}
          </Text>
        </View>

        <View className="mb-3 w-[49%] rounded-2xl border border-white/10 bg-white/5 p-4">
          <Text className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-slate-400">
            {t("home.statsCard.attempts")}
          </Text>
          <Text className="mt-2 text-2xl font-black text-white">
            {stats?.total_attempts ?? 0}
          </Text>
        </View>

        <View className="w-[49%] rounded-2xl border border-white/10 bg-white/5 p-4">
          <Text className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-slate-400">
            {t("home.statsCard.accuracy")}
          </Text>
          <Text className="mt-2 text-2xl font-black text-white">
            {accuracyText}
          </Text>
        </View>

        <View className="w-[49%] rounded-2xl border border-white/10 bg-white/5 p-4">
          <Text className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-slate-400">
            {t("home.statsCard.score")}
          </Text>
          <Text className="mt-2 text-2xl font-black text-white">
            {stats?.total_score ?? 0}
          </Text>
        </View>
      </View>
    </View>
  );
}
