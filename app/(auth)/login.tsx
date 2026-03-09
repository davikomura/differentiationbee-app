// app/(auth)/login.tsx
import { useAuthStore } from "@/stores/auth";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AuthLoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    registered?: string;
    username?: string;
  }>();
  const signIn = useAuthStore((state) => state.signIn);

  const [username, setUsername] = useState(
    typeof params.username === "string" ? params.username : "",
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [focusedField, setFocusedField] = useState<
    "username" | "password" | null
  >(null);

  const passwordRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.length > 0 && !loading;
  }, [username, password, loading]);

  const GOLD = "#F7C948";
  const CYAN = "#19D3FF";

  function validate() {
    let ok = true;

    setUsernameError(null);
    setPasswordError(null);
    setFormError(null);

    if (!username.trim()) {
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

    setLoading(true);
    try {
      await signIn(username.trim(), password);
      router.replace("/(tabs)/home");
    } catch {
      setFormError(t("auth.login.errors.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  const borderFor = (field: "username" | "password", hasError: boolean) => {
    if (hasError) return "border-red-500/70";
    if (focusedField === field) return "border-cyan-400/80";
    return "border-zinc-800/80";
  };

  React.useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const handleShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    };

    const handleHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(showEvent, handleShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
    >
      <ImageBackground
        source={require("@/assets/auth/login-bg.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="absolute inset-0 bg-black/70" />

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: Math.max(40, keyboardHeight + 48),
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-10 items-start">
            <Text className="text-4xl font-extrabold text-white tracking-tight">
              {t("auth.login.title")}
            </Text>

            <Text className="mt-3 max-w-[320px] text-base leading-6 text-zinc-300">
              {t("auth.login.subtitle")}
            </Text>
          </View>

          <View
            className="rounded-[28px] border border-white/10 bg-black/55 p-6"
            style={{
              backdropFilter: "blur(8px)",
              shadowColor: "#000",
              shadowOpacity: 0.6,
              shadowRadius: 24,
              elevation: 18,
            }}
          >
            {params.registered === "1" && (
              <View className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                <Text className="text-sm text-emerald-100">
                  {t("auth.login.success.registered")}
                </Text>
              </View>
            )}

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-zinc-200">
                {t("auth.login.usernameLabel")}
              </Text>

              <View
                className={[
                  "rounded-2xl border bg-black/70 px-4 py-3",
                  borderFor("username", !!usernameError),
                ].join(" ")}
              >
                <TextInput
                  value={username}
                  editable={!loading}
                  autoCapitalize="none"
                  placeholder={t("auth.login.usernamePlaceholder")}
                  placeholderTextColor="#94A3B8"
                  className="text-base text-white"
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(v) => {
                    setUsername(v);
                    setUsernameError(null);
                    setFormError(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              {usernameError && (
                <Text className="mt-2 text-sm text-red-400">
                  {usernameError}
                </Text>
              )}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-zinc-200">
                {t("auth.login.passwordLabel")}
              </Text>

              <View
                className={[
                  "flex-row items-center rounded-2xl border bg-black/70 px-4 py-3",
                  borderFor("password", !!passwordError),
                ].join(" ")}
              >
                <TextInput
                  ref={passwordRef}
                  value={password}
                  editable={!loading}
                  secureTextEntry={!showPassword}
                  placeholder={t("auth.login.passwordPlaceholder")}
                  placeholderTextColor="#94A3B8"
                  className="flex-1 text-base text-white"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(v) => {
                    setPassword(v);
                    setPasswordError(null);
                    setFormError(null);
                  }}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />

                <Pressable onPress={() => setShowPassword((s) => !s)}>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: CYAN }}
                  >
                    {showPassword ? t("auth.login.hide") : t("auth.login.show")}
                  </Text>
                </Pressable>
              </View>

              {passwordError && (
                <Text className="mt-2 text-sm text-red-400">
                  {passwordError}
                </Text>
              )}
            </View>

            {formError && (
              <View className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3">
                <Text className="text-sm text-red-200">{formError}</Text>
              </View>
            )}

            <Pressable
              disabled={!canSubmit}
              onPress={handleLogin}
              className="h-12 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: canSubmit ? GOLD : "#27272A",
                shadowColor: canSubmit ? CYAN : "transparent",
                shadowOpacity: 0.5,
                shadowRadius: 18,
                elevation: canSubmit ? 14 : 0,
              }}
            >
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text
                  className="text-base font-extrabold tracking-wide"
                  style={{ color: canSubmit ? "#0B0F17" : "#A1A1AA" }}
                >
                  {t("auth.login.button")}
                </Text>
              )}
            </Pressable>

            <View className="mt-5 flex-row justify-between">
              <Text className="text-sm text-zinc-300">
                {t("auth.login.forgotPassword")}
              </Text>

              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text
                    className="text-sm font-extrabold"
                    style={{ color: CYAN }}
                  >
                    {t("auth.login.createAccount")}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
