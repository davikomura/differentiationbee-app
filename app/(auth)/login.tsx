// app/(auth)/login.tsx
import { signIn } from "@/services/authSession";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AuthLoginScreen() {
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.length > 0 && !loading;
  }, [username, password, loading]);

  function validate() {
    const u = username.trim();
    let ok = true;

    setUsernameError(null);
    setPasswordError(null);
    setFormError(null);

    if (!u) {
      setUsernameError(t("auth.login.errors.requiredFields"));
      ok = false;
    }
    if (!password) {
      setPasswordError(t("auth.login.errors.requiredFields"));
      ok = false;
    }
    return ok;
  }

  async function handleLogin() {
    Keyboard.dismiss();
    if (!validate()) return;

    const normalizedUsername = username.trim();

    setLoading(true);
    setFormError(null);

    try {
      await signIn(normalizedUsername, password);
      // router.replace("/(tabs)");
    } catch (error: any) {
      setFormError(t("auth.login.errors.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6">
          <Text className="text-4xl font-extrabold text-white">
            {t("auth.login.title")}
          </Text>
          <Text className="mt-2 text-base leading-6 text-zinc-400">
            {t("auth.login.subtitle")}
          </Text>
        </View>

        <View className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5">
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-zinc-200">
              {t("auth.login.usernameLabel")}
            </Text>

            <View
              className={[
                "rounded-2xl border bg-zinc-900 px-4 py-3",
                usernameError ? "border-red-500/70" : "border-zinc-800",
                loading ? "opacity-70" : "",
              ].join(" ")}
            >
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                onChangeText={(v) => {
                  setUsername(v);
                  if (usernameError) setUsernameError(null);
                  if (formError) setFormError(null);
                }}
                placeholder={t("auth.login.usernamePlaceholder")}
                placeholderTextColor="#71717a"
                value={username}
                className="text-base text-white"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                textContentType="username"
                autoComplete="username"
                accessibilityLabel={t("auth.login.usernameLabel")}
              />
            </View>

            {usernameError ? (
              <Text className="mt-2 text-sm text-red-400">{usernameError}</Text>
            ) : (
              <Text className="mt-2 text-xs text-zinc-500"></Text>
            )}
          </View>

          <View className="mb-3">
            <Text className="mb-2 text-sm font-medium text-zinc-200">
              {t("auth.login.passwordLabel")}
            </Text>

            <View
              className={[
                "flex-row items-center rounded-2xl border bg-zinc-900 px-4 py-3",
                passwordError ? "border-red-500/70" : "border-zinc-800",
                loading ? "opacity-70" : "",
              ].join(" ")}
            >
              <TextInput
                ref={passwordRef}
                editable={!loading}
                onChangeText={(v) => {
                  setPassword(v);
                  if (passwordError) setPasswordError(null);
                  if (formError) setFormError(null);
                }}
                placeholder={t("auth.login.passwordPlaceholder")}
                placeholderTextColor="#71717a"
                secureTextEntry={!showPassword}
                value={password}
                className="flex-1 text-base text-white"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                textContentType="password"
                autoComplete="password"
                accessibilityLabel={t("auth.login.passwordLabel")}
              />

              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword
                    ? t("auth.login.hidePassword")
                    : t("auth.login.showPassword")
                }
                className="ml-3 rounded-xl px-3 py-2"
              >
                <Text className="text-sm font-semibold text-zinc-300">
                  {showPassword
                    ? t("auth.login.hide")
                    : t("auth.login.show")}{" "}
                </Text>
              </Pressable>
            </View>

            {passwordError ? (
              <Text className="mt-2 text-sm text-red-400">{passwordError}</Text>
            ) : null}
          </View>

          {formError ? (
            <View className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <Text className="text-sm text-red-200">{formError}</Text>
            </View>
          ) : (
            <View className="mb-4" />
          )}

          <Pressable
            className={[
              "h-12 items-center justify-center rounded-2xl",
              canSubmit ? "bg-emerald-500" : "bg-zinc-800",
            ].join(" ")}
            disabled={!canSubmit}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel={t("auth.login.button")}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text
                className={[
                  "text-base font-semibold",
                  canSubmit ? "text-zinc-900" : "text-zinc-400",
                ].join(" ")}
              >
                {t("auth.login.button")}
              </Text>
            )}
          </Pressable>

          <View className="mt-4 flex-row items-center justify-between">
            <Pressable
              disabled={loading}
              // onPress={() => router.push("/(auth)/forgot-password")}
              className="rounded-xl px-2 py-2"
            >
              <Text className="text-sm font-medium text-zinc-300">
                {t("auth.login.forgotPassword")}
              </Text>
            </Pressable>

            <Pressable
              disabled={loading}
              // onPress={() => router.push("/(auth)/register")}
              className="rounded-xl px-2 py-2"
            >
              <Text className="text-sm font-semibold text-emerald-400">
                {t("auth.login.createAccount")}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text className="mt-6 text-center text-xs text-zinc-600"></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
