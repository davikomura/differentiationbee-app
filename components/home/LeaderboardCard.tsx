// components/home/LeaderboardCard.tsx
import type { LeaderboardEntry } from "@/types/leaderboard";
import React from "react";
import { Text, View } from "react-native";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function LeaderboardCard({
  t,
  leaderboard,
}: {
  t: (key: string, options?: any) => string;
  leaderboard: LeaderboardEntry[];
}) {
  return (
    <View className="rounded-[28px] border border-white/10 bg-[#10182A] p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-extrabold text-white">
          {t("home.ranking.title")}
        </Text>
        <Text className="text-xs font-semibold text-slate-400">
          Top {leaderboard.length}
        </Text>
      </View>

      {leaderboard.length > 0 ? (
        <View className="gap-2">
          {leaderboard.map((entry) => {
            const isTop3 = entry.rank <= 3;
            return (
              <View
                key={entry.user_id}
                className={cn(
                  "flex-row items-center justify-between rounded-2xl border border-white/10 px-4 py-3",
                  isTop3 ? "bg-cyan-400/10" : "bg-white/5",
                )}
              >
                <View className="flex-row items-center">
                  <View
                    className={cn(
                      "mr-3 h-8 w-8 items-center justify-center rounded-full border",
                      isTop3
                        ? "border-cyan-300/30 bg-cyan-300/10"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-xs font-black",
                        isTop3 ? "text-cyan-200" : "text-slate-200",
                      )}
                    >
                      #{entry.rank}
                    </Text>
                  </View>
                  <Text className="text-[15px] font-bold text-white">
                    {entry.username}
                  </Text>
                </View>

                <View className="rounded-full border border-[#F7C948]/25 bg-[#F7C948]/10 px-3 py-1.5">
                  <Text className="text-[12px] font-black text-[#F7C948]">
                    {entry.points} pts
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text className="text-sm text-slate-300">
          {t("home.ranking.empty")}
        </Text>
      )}
    </View>
  );
}
