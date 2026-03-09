// app/(tabs)/profile.tsx
import { useAuthStore } from "@/stores/auth";
import type { CurrentUser } from "@/types/profile";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

type ProfileState = {
  user: CurrentUser | null;
  loading: boolean;
  refreshing: boolean;
  signingOut: boolean;
  error: string | null;
};

const INITIAL_STATE: ProfileState = {
  user: null,
  loading: false,
  refreshing: false,
  signingOut: false,
  error: null,
};

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="mb-4">
      {eyebrow ? (
        <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-cyan-300/90">
          {eyebrow}
        </Text>
      ) : null}
      <Text className="mt-1 text-xl font-black text-white">{title}</Text>
      {subtitle ? (
        <Text className="mt-1 text-sm leading-6 text-slate-400">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-sm font-medium text-slate-400">{label}</Text>
      <Text className="max-w-[58%] text-right text-sm font-bold text-white">
        {value}
      </Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "cyan" | "yellow" | "violet" | "emerald";
}) {
  const accentMap = {
    cyan: "bg-cyan-400/15 border-cyan-300/20",
    yellow: "bg-yellow-400/15 border-yellow-300/20",
    violet: "bg-violet-400/15 border-violet-300/20",
    emerald: "bg-emerald-400/15 border-emerald-300/20",
  };

  return (
    <View
      className={`flex-1 rounded-[24px] border bg-[#0F172A] p-4 ${accentMap[accent ?? "cyan"]}`}
    >
      <Text className="text-[11px] font-extrabold uppercase tracking-[1.5px] text-slate-400">
        {label}
      </Text>
      <Text className="mt-3 text-2xl font-black text-white">{value}</Text>
    </View>
  );
}

function ProfileHero({
  username,
  subtitle,
  kicker,
  overviewLabel,
}: {
  username: string;
  subtitle: string;
  kicker: string;
  overviewLabel: string;
}) {
  const initials = useMemo(() => {
    const parts = username.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [username]);

  return (
    <View className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0B1220]">
      <View className="p-6">
        <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-cyan-300/90">
          {kicker}
        </Text>

        <View className="mt-5 flex-row items-center">
          <View className="h-20 w-20 items-center justify-center rounded-[24px] border border-cyan-300/20 bg-cyan-400/10">
            <Text className="text-2xl font-black text-cyan-200">
              {initials}
            </Text>
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-3xl font-black text-white">{username}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-300">
              {subtitle}
            </Text>
          </View>
        </View>
      </View>

      <View className="border-t border-white/10 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase tracking-[1.5px] text-slate-500">
            {overviewLabel}
          </Text>
          <View className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
            <View className="h-full w-16 rounded-full bg-cyan-400" />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const signOut = useAuthStore((state) => state.signOut);
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    if (authStatus === "authenticated" && !user) {
      setState((current) => ({ ...current, loading: true }));
      void loadProfile();
    }
  }, [authStatus, user]);

  async function loadProfile() {
    try {
      const user = await refreshUser();
      setState((current) => ({
        ...current,
        user,
        error: null,
      }));
    } catch {
      setState((current) => ({
        ...current,
        error: t("profileScreen.error"),
      }));
    } finally {
      setState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
      }));
    }
  }

  async function handleRefresh() {
    setState((current) => ({ ...current, refreshing: true }));
    await loadProfile();
  }

  async function handleSignOut() {
    try {
      setState((current) => ({ ...current, signingOut: true }));
      await signOut();
      router.replace("/(auth)/login");
    } finally {
      setState((current) => ({ ...current, signingOut: false }));
    }
  }

  const effectiveUser = state.user ?? user;

  if ((state.loading && !effectiveUser) || authStatus === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-[#050814]">
        <View className="items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-[24px] border border-cyan-400/20 bg-cyan-400/10">
            <ActivityIndicator color="#22D3EE" />
          </View>
          <Text className="text-sm font-semibold text-slate-400">
            {t("profileScreen.kicker")}
          </Text>
        </View>
      </View>
    );
  }

  const username = effectiveUser?.username ?? t("profileScreen.fallbackName");
  const email = effectiveUser?.email ?? t("profileScreen.unavailable");
  const role = effectiveUser?.role ?? t("profileScreen.unavailable");
  const points = effectiveUser?.points ?? 0;
  const tier = effectiveUser?.tier?.title ?? t("profileScreen.noTier");

  return (
    <ScrollView
      className="flex-1 bg-[#050814]"
      contentContainerStyle={{
        paddingTop: insets.top + 14,
        paddingBottom: Math.max(insets.bottom + 24, 32),
        paddingHorizontal: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={state.refreshing}
          onRefresh={() => void handleRefresh()}
          tintColor="#22D3EE"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] font-extrabold uppercase tracking-[2px] text-slate-500">
            {t("profileScreen.kicker")}
          </Text>
          <Text className="mt-1 text-2xl font-black text-white">
            {t("tabs.profile")}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/settings")}
          accessibilityRole="button"
          accessibilityLabel={t("profileScreen.openSettings")}
          className="h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-[#0B1220]"
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Ionicons name="settings-sharp" size={20} color="#22D3EE" />
        </Pressable>
      </View>

      <ProfileHero
        kicker={t("profileScreen.kicker")}
        username={username}
        subtitle={t("profileScreen.subtitle")}
        overviewLabel={t("profileScreen.overviewLabel")}
      />

      <View className="mt-6">
        <SectionTitle
          title={t("profileScreen.progressTitle")}
          subtitle={t("profileScreen.progressSubtitle")}
        />

        <View className="gap-3">
          <View className="flex-row gap-3">
            <StatCard
              label={t("profileScreen.points")}
              value={points}
              accent="cyan"
            />
            <StatCard
              label={t("profileScreen.tier")}
              value={tier}
              accent="violet"
            />
          </View>
        </View>
      </View>

      <View className="mt-6 rounded-[28px] border border-white/10 bg-[#0B1220] p-5">
        <SectionTitle
          eyebrow={t("profileScreen.accountEyebrow")}
          title={t("profileScreen.personalInfoTitle")}
          subtitle={t("profileScreen.personalInfoSubtitle")}
        />

        <InfoRow label={t("profileScreen.email")} value={email} />
        <View className="h-px bg-white/8" />
        <InfoRow label={t("profileScreen.role")} value={role} />
        <View className="h-px bg-white/8" />
        <InfoRow label={t("profileScreen.tier")} value={tier} />
      </View>

      {state.error ? (
        <View className="mt-5 rounded-[22px] border border-red-500/25 bg-red-500/10 p-4">
          <Text className="text-sm font-semibold leading-6 text-red-200">
            {state.error}
          </Text>
        </View>
      ) : null}

      <Pressable
        className={`mt-6 h-14 items-center justify-center rounded-[22px] ${
          state.signingOut ? "bg-[#D9B23D]/70" : "bg-[#F7C948]"
        }`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
        onPress={() => void handleSignOut()}
        disabled={state.signingOut}
      >
        {state.signingOut ? (
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color="#08111F" />
            <Text className="text-[15px] font-black text-[#08111F]">
              {t("profileScreen.signingOut")}
            </Text>
          </View>
        ) : (
          <Text className="text-[15px] font-black text-[#08111F]">
            {t("profileScreen.signOut")}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
