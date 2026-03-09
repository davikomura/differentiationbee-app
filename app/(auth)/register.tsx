// app/(auth)/register.tsx
import { register } from "@/services/auth";
import type { AxiosError } from "axios";
import { Link, useRouter } from "expo-router";
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
  type DimensionValue,
  Text,
  TextInput,
  View,
} from "react-native";

type ApiErrorResponse = {
  detail?: string;
};

type FocusedField =
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | null;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

type PasswordStrength = "weak" | "medium" | "strong";
type PasswordStrengthMeta = {
  label: string;
  color: string;
  width: DimensionValue;
};

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 12) score += 1;

  if (score >= 5) return "strong";
  if (score >= 3) return "medium";
  return "weak";
}

function getApiErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.detail ?? null;
}

export default function AuthRegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const canSubmit = useMemo(() => {
    return (
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      !loading
    );
  }, [confirmPassword.length, email, loading, password.length, username]);

  const GOLD = "#F7C948";
  const CYAN = "#19D3FF";
  const passwordStrength = password ? getPasswordStrength(password) : null;

  const passwordStrengthMeta: PasswordStrengthMeta | null = passwordStrength
    ? {
        weak: {
          label: t("auth.register.passwordStrength.weak"),
          color: "#EF4444",
          width: "33%" as DimensionValue,
        },
        medium: {
          label: t("auth.register.passwordStrength.medium"),
          color: "#F59E0B",
          width: "66%" as DimensionValue,
        },
        strong: {
          label: t("auth.register.passwordStrength.strong"),
          color: "#22C55E",
          width: "100%" as DimensionValue,
        },
      }[passwordStrength]
    : null;

  function resetErrors() {
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setFormError(null);
  }

  function validateEmailField(value: string) {
    const normalizedEmail = value.trim();

    if (!normalizedEmail) {
      setEmailError(null);
      return;
    }

    setEmailError(
      isValidEmail(normalizedEmail)
        ? null
        : t("auth.register.errors.emailInvalid"),
    );
  }

  function validatePasswordField(value: string) {
    if (!value) {
      setPasswordError(null);
      return;
    }

    setPasswordError(
      isValidPassword(value) ? null : t("auth.register.errors.passwordWeak"),
    );
  }

  function validateConfirmPasswordField(
    value: string,
    nextPassword = password,
  ) {
    if (!value) {
      setConfirmPasswordError(null);
      return;
    }

    setConfirmPasswordError(
      value === nextPassword
        ? null
        : t("auth.register.errors.passwordMismatch"),
    );
  }

  function validate() {
    let ok = true;
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    resetErrors();

    if (
      !normalizedUsername ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      const message = t("auth.register.errors.requiredFields");

      if (!normalizedUsername) setUsernameError(message);
      if (!normalizedEmail) setEmailError(message);
      if (!password) setPasswordError(message);
      if (!confirmPassword) setConfirmPasswordError(message);
      return false;
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      setUsernameError(t("auth.register.errors.usernameLength"));
      ok = false;
    } else if (!/^[a-z0-9_.-]+$/i.test(normalizedUsername)) {
      setUsernameError(t("auth.register.errors.usernameInvalid"));
      ok = false;
    }

    if (!isValidEmail(normalizedEmail)) {
      setEmailError(t("auth.register.errors.emailInvalid"));
      ok = false;
    }

    if (!isValidPassword(password)) {
      setPasswordError(t("auth.register.errors.passwordWeak"));
      ok = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(t("auth.register.errors.passwordMismatch"));
      ok = false;
    }

    return ok;
  }

  async function handleRegister() {
    Keyboard.dismiss();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      router.replace({
        pathname: "/(auth)/login",
        params: {
          registered: "1",
          username: username.trim().toLowerCase(),
        },
      });
    } catch (error) {
      setFormError(
        getApiErrorMessage(error) ?? t("auth.register.errors.default"),
      );
    } finally {
      setLoading(false);
    }
  }

  const borderFor = (field: Exclude<FocusedField, null>, hasError: boolean) => {
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
            <Text className="text-4xl font-extrabold tracking-tight text-white">
              {t("auth.register.title")}
            </Text>

            <Text className="mt-3 max-w-[320px] text-base leading-6 text-zinc-300">
              {t("auth.register.subtitle")}
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
            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-zinc-200">
                {t("auth.register.usernameLabel")}
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
                  placeholder={t("auth.register.usernamePlaceholder")}
                  placeholderTextColor="#94A3B8"
                  className="text-base text-white"
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(value) => {
                    setUsername(value);
                    setUsernameError(null);
                    setFormError(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
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
                {t("auth.register.emailLabel")}
              </Text>

              <View
                className={[
                  "rounded-2xl border bg-black/70 px-4 py-3",
                  borderFor("email", !!emailError),
                ].join(" ")}
              >
                <TextInput
                  ref={emailRef}
                  value={email}
                  editable={!loading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder={t("auth.register.emailPlaceholder")}
                  placeholderTextColor="#94A3B8"
                  className="text-base text-white"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => {
                    setFocusedField(null);
                    validateEmailField(email);
                  }}
                  onChangeText={(value) => {
                    setEmail(value);
                    validateEmailField(value);
                    setFormError(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>

              {emailError && (
                <Text className="mt-2 text-sm text-red-400">{emailError}</Text>
              )}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-zinc-200">
                {t("auth.register.passwordLabel")}
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
                  autoCorrect={false}
                  autoComplete="new-password"
                  placeholder={t("auth.register.passwordPlaceholder")}
                  placeholderTextColor="#94A3B8"
                  className="flex-1 text-base text-white"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => {
                    setFocusedField(null);
                    validatePasswordField(password);
                  }}
                  onChangeText={(value) => {
                    setPassword(value);
                    validatePasswordField(value);
                    validateConfirmPasswordField(confirmPassword, value);
                    setFormError(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                />

                <Pressable onPress={() => setShowPassword((state) => !state)}>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: CYAN }}
                  >
                    {showPassword
                      ? t("auth.register.hide")
                      : t("auth.register.show")}
                  </Text>
                </Pressable>
              </View>

              <Text className="mt-2 text-xs leading-5 text-zinc-400">
                {t("auth.register.passwordHint")}
              </Text>

              {passwordStrengthMeta && (
                <View className="mt-3">
                  <View className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: passwordStrengthMeta.width,
                        backgroundColor: passwordStrengthMeta.color,
                      }}
                    />
                  </View>

                  <Text
                    className="mt-2 text-xs font-semibold"
                    style={{ color: passwordStrengthMeta.color }}
                  >
                    {t("auth.register.passwordStrength.label", {
                      level: passwordStrengthMeta.label,
                    })}
                  </Text>
                </View>
              )}

              {passwordError && (
                <Text className="mt-2 text-sm text-red-400">
                  {passwordError}
                </Text>
              )}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-zinc-200">
                {t("auth.register.confirmPasswordLabel")}
              </Text>

              <View
                className={[
                  "flex-row items-center rounded-2xl border bg-black/70 px-4 py-3",
                  borderFor("confirmPassword", !!confirmPasswordError),
                ].join(" ")}
              >
                <TextInput
                  ref={confirmPasswordRef}
                  value={confirmPassword}
                  editable={!loading}
                  secureTextEntry={!showConfirmPassword}
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  placeholder={t("auth.register.confirmPasswordPlaceholder")}
                  placeholderTextColor="#94A3B8"
                  className="flex-1 text-base text-white"
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => {
                    setFocusedField(null);
                    validateConfirmPasswordField(confirmPassword);
                  }}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    validateConfirmPasswordField(value);
                    setFormError(null);
                  }}
                  returnKeyType="go"
                  onSubmitEditing={handleRegister}
                />

                <Pressable
                  onPress={() => setShowConfirmPassword((state) => !state)}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: CYAN }}
                  >
                    {showConfirmPassword
                      ? t("auth.register.hide")
                      : t("auth.register.show")}
                  </Text>
                </Pressable>
              </View>

              {confirmPasswordError && (
                <Text className="mt-2 text-sm text-red-400">
                  {confirmPasswordError}
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
              onPress={handleRegister}
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
                  {t("auth.register.button")}
                </Text>
              )}
            </Pressable>

            <View className="mt-5 flex-row items-center justify-between">
              <Text className="text-sm text-zinc-300">
                {t("auth.register.haveAccount")}
              </Text>

              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text
                    className="text-sm font-extrabold"
                    style={{ color: CYAN }}
                  >
                    {t("auth.register.signIn")}
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
