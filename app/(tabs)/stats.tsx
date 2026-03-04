// app/(tabs)/stats.tsx
import { useMyAdvancedStats, useMyStatsEvolution } from "@/hooks/useStats";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatMs(ms: number) {
  if (!ms) return "-";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}m ${Math.round(r)}s`;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Chip({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
      <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-400">
        {label}
      </Text>
      <Text className="text-xs font-extrabold text-white">{value}</Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  hint,
  accent = "cyan",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "cyan" | "violet" | "emerald";
}) {
  const accentText =
    accent === "violet"
      ? "text-violet-200"
      : accent === "emerald"
        ? "text-emerald-200"
        : "text-cyan-200";

  return (
    <Pressable
      className="flex-1 overflow-hidden rounded-[26px] border border-white/10 bg-[#10182A]"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.98 : 1,
      })}
    >
      <View className="absolute inset-0 bg-white/[0.02]" />
      <View className="p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-400">
            {label}
          </Text>
        </View>

        <Text className="mt-3 text-[30px] font-extrabold text-white">
          {value}
        </Text>

        {hint ? (
          <Text className={cn("mt-2 text-xs font-semibold", accentText)}>
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function ProgressRing({
  value,
  label,
  caption,
  scoreLabel,
  qualityLabel,
  qualityValue,
  targetLabel,
  targetValue,
}: {
  value: number;
  label: string;
  caption?: string;
  scoreLabel: string;
  qualityLabel: string;
  qualityValue: string;
  targetLabel: string;
  targetValue: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <View className="overflow-hidden rounded-[28px] border border-white/10 bg-[#10182A]">
      <View className="absolute inset-0 bg-white/[0.02]" />
      <View className="p-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold text-slate-300">
              {label}
            </Text>
            {caption ? (
              <Text className="mt-1 text-xs text-slate-400">{caption}</Text>
            ) : null}
          </View>

          <View className="items-end">
            <Text className="text-2xl font-extrabold text-white">{v}%</Text>
            <Text className="mt-1 text-[11px] font-semibold uppercase tracking-[1px] text-slate-400">
              {scoreLabel}
            </Text>
          </View>
        </View>

        <View className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <View
            className="h-full rounded-full bg-[#19D3FF]"
            style={{ width: `${v}%` }}
          />
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <Chip label={qualityLabel} value={qualityValue} />
          <Chip label={targetLabel} value={targetValue} />
        </View>
      </View>
    </View>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <View
      className={cn(
        "overflow-hidden rounded-[26px] border border-white/10 bg-[#10182A]",
        className,
      )}
    >
      <View className="absolute inset-0 bg-white/[0.02]" />
      <View className="p-5">
        <View className="h-3 w-24 rounded-full bg-white/10" />
        <View className="mt-4 h-8 w-28 rounded-2xl bg-white/10" />
        <View className="mt-3 h-3 w-20 rounded-full bg-white/10" />
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useMyAdvancedStats();

  const {
    data: evolution,
    isError: evolutionError,
    refetch: refetchEvolution,
  } = useMyStatsEvolution();

  const accuracy = useMemo(() => {
    if (!stats) return 0;
    return Math.round(stats.accuracy_pct);
  }, [stats]);

  const accuracyQuality = useMemo(() => {
    if (accuracy >= 80) return t("statsScreen.qualityHigh");
    if (accuracy >= 60) return t("statsScreen.qualityGood");
    return t("statsScreen.qualityImproving");
  }, [accuracy, t]);

  const last30Days = useMemo(() => {
    if (!evolution) return { attempts: 0, score: 0, activeDays: 0 };

    return evolution.points.reduce(
      (acc, point) => ({
        attempts: acc.attempts + point.attempts,
        score: acc.score + point.total_score,
        activeDays: acc.activeDays + (point.attempts > 0 ? 1 : 0),
      }),
      { attempts: 0, score: 0, activeDays: 0 },
    );
  }, [evolution]);

  const error = statsError || evolutionError ? t("statsScreen.error") : null;

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchEvolution()]);
    setRefreshing(false);
  }

  return (
    <ScrollView
      className="flex-1 bg-[#070B14]"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        paddingHorizontal: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
          tintColor="#19D3FF"
        />
      }
    >
      <View className="mb-6">
        <View className="overflow-hidden rounded-[34px] border border-white/10 bg-[#0E1628]">
          <View className="absolute inset-0 bg-white/[0.02]" />
          <View className="p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-3xl font-extrabold text-white">
                  {t("statsScreen.title")}
                </Text>
                <Text className="mt-2 text-sm leading-5 text-slate-300">
                  {t("statsScreen.subtitle")}
                </Text>
              </View>

            </View>
          </View>
          <View className="h-px bg-white/10" />
          <View className="h-1 bg-[#19D3FF]/40" />
        </View>
      </View>

      {statsLoading && !stats ? (
        <View className="gap-3">
          <SkeletonCard />
          <View className="flex-row gap-3">
            <SkeletonCard className="flex-1" />
            <SkeletonCard className="flex-1" />
          </View>
          <View className="flex-row gap-3">
            <SkeletonCard className="flex-1" />
            <SkeletonCard className="flex-1" />
          </View>
        </View>
      ) : stats ? (
        <View className="gap-4">
          <ProgressRing
            value={accuracy}
            label={t("statsScreen.accuracy")}
            caption={t("statsScreen.subtitle")}
            scoreLabel={t("statsScreen.score")}
            qualityLabel={t("statsScreen.quality")}
            qualityValue={accuracyQuality}
            targetLabel={t("statsScreen.target")}
            targetValue="80%"
          />

          <View className="gap-3">
            <View className="flex-row gap-3">
              <MetricCard
                label={t("statsScreen.bestScore")}
                value={stats.best_score}
                hint={t("statsScreen.personalRecord")}
                accent="violet"
              />
              <MetricCard
                label={t("statsScreen.avgTime")}
                value={formatMs(stats.average_time_ms)}
                hint={t("statsScreen.speed")}
                accent="cyan"
              />
            </View>

            <View className="flex-row gap-3">
              <MetricCard
                label={t("statsScreen.sessions")}
                value={stats.total_sessions}
                hint={t("statsScreen.volume")}
                accent="cyan"
              />
              <MetricCard
                label={t("statsScreen.correct")}
                value={stats.correct_attempts}
                hint={t("statsScreen.precision")}
                accent="emerald"
              />
            </View>

            <View className="flex-row gap-3">
              <MetricCard
                label={t("statsScreen.currentStreak")}
                value={stats.current_streak_days}
                hint={t("statsScreen.consistency")}
                accent="emerald"
              />
              <MetricCard
                label={t("statsScreen.bestStreak")}
                value={stats.best_streak_days}
                hint={t("statsScreen.maximum")}
                accent="violet"
              />
            </View>
          </View>

          <View className="overflow-hidden rounded-[30px] border border-white/10 bg-[#10182A]">
            <View className="absolute inset-0 bg-white/[0.02]" />
            <View className="p-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-semibold text-slate-300">
                    {t("statsScreen.last30Days")}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-400">
                    {t("statsScreen.recentPaceSummary")}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-400">
                    {t("statsScreen.activeDays")}
                  </Text>
                  <Text className="mt-1 text-xl font-extrabold text-white">
                    {last30Days.activeDays}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row gap-3">
                <MetricCard
                  label={t("statsScreen.score")}
                  value={last30Days.score}
                  hint={t("statsScreen.total")}
                  accent="violet"
                />
                <MetricCard
                  label={t("statsScreen.attempts")}
                  value={last30Days.attempts}
                  hint={t("statsScreen.total")}
                  accent="cyan"
                />
              </View>
            </View>
            <View className="h-px bg-white/10" />
            <View className="h-1 bg-[#19D3FF]/40" />
          </View>

          {error ? (
            <View className="rounded-[22px] border border-red-500/30 bg-red-500/10 p-4">
              <Text className="text-sm font-semibold text-red-200">
                {error}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View className="overflow-hidden rounded-[28px] border border-white/10 bg-[#10182A]">
          <View className="absolute inset-0 bg-white/[0.02]" />
          <View className="p-6">
            <Text className="text-base font-extrabold text-white">
              {t("statsScreen.title")}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-slate-300">
              {t("statsScreen.empty")}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
