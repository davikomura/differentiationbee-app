// app/(tabs)/leaderboard.tsx
import {
  useGlobalLeaderboard,
  useGlobalLeaderboardByTier,
} from "@/hooks/useLeaderboard";
import { useAuthStore } from "@/stores/auth";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { useMemo, useState } from "react";
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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Avatar({ name }: { name: string }) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "?";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [name]);

  return (
    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
      <Text className="text-[11px] font-extrabold text-white">{initials}</Text>
    </View>
  );
}

function Rank({ value }: { value: number }) {
  const tone =
    value === 1
      ? "text-[#F7C948]"
      : value === 2
        ? "text-slate-200"
        : value === 3
          ? "text-[#FF7A90]"
          : "text-slate-400";

  return (
    <Text className={cn("w-8 text-right text-sm font-extrabold", tone)}>
      {value}
    </Text>
  );
}

function LeaderboardItem({
  entry,
  t,
  isLast,
  rankingLabel,
}: {
  entry: LeaderboardEntry;
  t: (key: string, options?: any) => string;
  isLast: boolean;
  rankingLabel: string;
}) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between py-4",
        isLast ? "" : "border-b border-white/8",
      )}
    >
      <View className="flex-row items-center gap-3">
        <Rank value={entry.rank} />
        <Avatar name={entry.username} />
        <View>
          <Text className="text-base font-bold text-white">
            {entry.username}
          </Text>
          <Text className="mt-0.5 text-xs text-slate-400">
            {entry.rank <= 3 ? "Top player" : rankingLabel}
          </Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-[10px] uppercase tracking-[1px] text-slate-500">
          {t("leaderboardScreen.pointsLabel", { defaultValue: "Points" })}
        </Text>
        <Text className="mt-1 text-base font-extrabold text-white">
          {t("leaderboardScreen.points", { points: entry.points })}
        </Text>
      </View>
    </View>
  );
}

function SkeletonList() {
  return (
    <View className="mt-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <View
          key={i}
          className={cn(
            "flex-row items-center justify-between py-4",
            i === 9 ? "" : "border-b border-white/8",
          )}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-4 w-8 rounded bg-white/10" />
            <View className="h-10 w-10 rounded-2xl bg-white/10" />
            <View className="gap-2">
              <View className="h-4 w-40 rounded bg-white/10" />
              <View className="h-3 w-24 rounded bg-white/10" />
            </View>
          </View>
          <View className="h-4 w-20 rounded bg-white/10" />
        </View>
      ))}

      <View className="mt-4 items-center">
        <ActivityIndicator color="#19D3FF" />
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [filterMode, setFilterMode] = useState<"global" | "tier">("global");
  const currentTier = useAuthStore((state) => state.user?.tier);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const globalQuery = useGlobalLeaderboard({ limit: 20 });
  const tierQuery = useGlobalLeaderboardByTier(
    filterMode === "tier" ? currentTier?.key ?? "" : "",
    { limit: 20 },
  );
  const { data, isLoading, isFetching, isRefetching, error, refetch } =
    filterMode === "tier" ? tierQuery : globalQuery;

  const items: LeaderboardEntry[] = data?.items ?? [];
  const errorMessage = error ? t("leaderboardScreen.error") : null;
  const rankingLabel =
    filterMode === "tier"
      ? t("leaderboardScreen.filterTier", { defaultValue: "Tier ranking" })
      : t("leaderboardScreen.globalRankingLabel", {
          defaultValue: "Global ranking",
        });

  return (
    <ScrollView
      className="flex-1 bg-[#070B14]"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 24,
        paddingHorizontal: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            void Promise.all([refetch(), refreshUser()]);
          }}
          tintColor="#19D3FF"
        />
      }
    >
      <View className="mb-4">
        <Text className="text-3xl font-extrabold text-white">
          {t("leaderboardScreen.title")}
        </Text>

        <View className="mt-4 flex-row gap-2">
          <Pressable
            className={cn(
              "rounded-2xl border px-4 py-2",
              filterMode === "global"
                ? "border-cyan-300 bg-cyan-300/15"
                : "border-white/10 bg-white/5",
            )}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            onPress={() => setFilterMode("global")}
          >
            <Text
              className={cn(
                "text-xs font-extrabold uppercase tracking-[1px]",
                filterMode === "global" ? "text-cyan-300" : "text-slate-300",
              )}
            >
              {t("leaderboardScreen.filterGlobal", { defaultValue: "Global" })}
            </Text>
          </Pressable>

          {currentTier ? (
            <Pressable
              className={cn(
                "rounded-2xl border px-4 py-2",
                filterMode === "tier"
                  ? "border-cyan-300 bg-cyan-300/15"
                  : "border-white/10 bg-white/5",
              )}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              onPress={() => setFilterMode("tier")}
            >
              <Text
                className={cn(
                  "text-xs font-extrabold uppercase tracking-[1px]",
                  filterMode === "tier" ? "text-cyan-300" : "text-slate-300",
                )}
              >
                {currentTier.title}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <Text className="max-w-[70%] text-base leading-6 text-slate-300">
            {filterMode === "tier" && currentTier
              ? t("leaderboardScreen.tierSubtitle", {
                  defaultValue: "Veja quem esta liderando na tier {{tier}}.",
                  tier: currentTier.title,
                })
              : t("leaderboardScreen.subtitle")}
          </Text>

          <View className="items-end">
            <Text className="text-[10px] uppercase tracking-[1px] text-slate-500">
              {t("leaderboardScreen.topLabel", { defaultValue: "Top" })}
            </Text>
            <Text className="text-sm font-extrabold text-white">
              {items.length}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <SkeletonList />
      ) : items.length > 0 ? (
        <View className="mt-2">
          {items.map((entry, idx) => (
            <LeaderboardItem
              key={entry.user_id}
              entry={entry}
              t={t}
              isLast={idx === items.length - 1}
              rankingLabel={rankingLabel}
            />
          ))}
        </View>
      ) : (
        <View className="mt-6 items-center">
          <Text className="text-sm text-slate-300">
            {t("leaderboardScreen.empty")}
          </Text>
        </View>
      )}

      {!isLoading && isFetching ? (
        <View className="mt-4 items-center">
          <ActivityIndicator color="#19D3FF" />
        </View>
      ) : null}

      {errorMessage ? (
        <View className="mt-5 rounded-2xl bg-red-500/10 p-4">
          <Text className="text-sm text-red-200">{errorMessage}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
