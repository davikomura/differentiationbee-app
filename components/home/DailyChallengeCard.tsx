// components/home/DailyChallengeCard.tsx
import { Latex } from "@/components/ui/Latex";
import type { DailyChallenge } from "@/types/game";
import React from "react";
import { Pressable, Text, View } from "react-native";

export function DailyChallengeCard({
  t,
  dailyChallenge,
  onPress,
}: {
  t: (key: string, options?: any) => string;
  dailyChallenge: DailyChallenge | null;
  onPress?: () => void;
}) {
  return (
    <View className="mb-5 rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-5">
      <View className="mb-3 flex-row flex-wrap items-center justify-between gap-2">
        <Text className="text-[12px] font-extrabold uppercase tracking-[2.5px] text-cyan-200/90">
          {t("home.daily.title")}
        </Text>

        {dailyChallenge ? (
          <View className="flex-row flex-wrap items-center gap-2">
            <View className="rounded-full border border-white/10 bg-[#08111F]/70 px-3 py-1">
              <Text className="text-[11px] font-bold text-slate-200">
                {t("home.daily.date", {
                  date: dailyChallenge.challenge_date,
                })}
              </Text>
            </View>

            <View className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1">
              <Text className="text-[11px] font-black text-cyan-200">
                {t("home.daily.level", { level: dailyChallenge.level })}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {dailyChallenge ? (
        <>
          {dailyChallenge.expression_latex ? (
            <Latex latex={dailyChallenge.expression_latex} />
          ) : (
            <View className="rounded-2xl border border-white/10 bg-[#08111F]/70 p-4">
              <Text className="text-base leading-6 text-white">
                {dailyChallenge.expression_str}
              </Text>
            </View>
          )}

          <Pressable
            onPress={onPress}
            className="mt-4 h-12 items-center justify-center rounded-2xl bg-[#19D3FF]"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Text className="text-[15px] font-black text-[#08111F]">
              {t("home.actions.playNow")}
            </Text>
          </Pressable>
        </>
      ) : (
        <Text className="text-sm text-slate-200">{t("home.daily.empty")}</Text>
      )}
    </View>
  );
}
