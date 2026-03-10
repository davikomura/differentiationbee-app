// app/solo/[id].tsx
import { Latex } from "@/components/ui/Latex";
import { useFinishSession } from "@/hooks/useSessions";
import { createAttempt } from "@/services/attempts";
import { issueQuestion } from "@/services/game";
import { getSession } from "@/services/sessions";
import { useAuthStore } from "@/stores/auth";
import type { IssuedQuestion } from "@/types/game";
import type { GameSession, SessionFinishResult } from "@/types/session";
import type { AxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_SOLO_QUESTIONS = 10;
const MAX_QUESTION_ISSUE_RETRIES = 3;

type ApiErrorResponse = {
  detail?: string;
};

function getApiErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.detail ?? null;
}

function formatCountdown(ms: number) {
  const safe = Math.max(0, ms);
  const totalSeconds = safe / 1000;

  if (totalSeconds < 10) {
    return `${totalSeconds.toFixed(1)} s`;
  }

  return `${Math.ceil(totalSeconds)} s`;
}

export default function SoloScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);
  const finishMutation = useFinishSession();

  const [session, setSession] = useState<GameSession | null>(null);
  const [question, setQuestion] = useState<IssuedQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    score: number;
    solution: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const timeoutHandledRef = useRef(false);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const issuedExpressionKeysRef = useRef<Set<string>>(new Set());
  const finishingSessionRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const validSessionId = Number.isFinite(sessionId) ? sessionId : null;

  const loadSession = useCallback(async () => {
    if (!validSessionId) {
      router.back();
      return;
    }

    try {
      const data = await getSession(validSessionId);
      setSession(data);
    } catch (error) {
      Alert.alert(
        t("gameSessionScreen.errorTitle"),
        getApiErrorMessage(error) ?? t("gameSessionScreen.sessionLoadError"),
      );
      router.back();
    } finally {
      setLoading(false);
    }
  }, [router, t, validSessionId]);

  const applyFinishedSession = useCallback(
    async (
      result: SessionFinishResult,
      reason: "timeout" | "completed" | "manual" = "manual",
    ) => {
      await refreshUser();
      setSession(result.session);
      setQuestion(null);
      setFeedback(null);
      setRemainingMs(0);
      deadlineRef.current = null;
      timeoutHandledRef.current = false;
      issuedExpressionKeysRef.current.clear();
      finishingSessionRef.current = false;

      if (reason === "timeout") {
        Alert.alert(
          t("gameSessionScreen.timeoutTitle"),
          t("gameSessionScreen.timeoutMessage"),
        );
        return;
      }

      if (reason === "completed") {
        Alert.alert(
          t("gameSessionScreen.completedTitle"),
          t("gameSessionScreen.completedMessage", {
            summary: result.result_summary,
            delta: result.delta_points,
          }),
        );
        return;
      }

      Alert.alert(
        t("gameSessionScreen.finishTitle"),
        t("gameSessionScreen.finishMessage", {
          summary: result.result_summary,
          delta: result.delta_points,
        }),
      );
    },
    [refreshUser, t],
  );

  const handleFinishSession = useCallback(
    async (reason: "timeout" | "completed" | "manual" = "manual") => {
      if (!session || finishMutation.isPending || finishingSessionRef.current) {
        return;
      }

      finishingSessionRef.current = true;
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }

      try {
        const result = await finishMutation.mutateAsync(session.id);
        await applyFinishedSession(result, reason);
      } catch (error) {
        finishingSessionRef.current = false;
        Alert.alert(
          t("gameSessionScreen.errorTitle"),
          getApiErrorMessage(error) ?? t("gameSessionScreen.finishError"),
        );
      }
    },
    [applyFinishedSession, finishMutation, session, t],
  );

  const handleIssueQuestion = useCallback(
    async (baseSession?: GameSession) => {
      const currentSession = baseSession ?? session;

      if (
        !currentSession ||
        !currentSession.is_active ||
        currentSession.total_questions >= MAX_SOLO_QUESTIONS ||
        finishMutation.isPending ||
        finishingSessionRef.current
      ) {
        return;
      }

      setIssuing(true);
      setFeedback(null);
      setAnswer("");

      try {
        let nextQuestion: IssuedQuestion | null = null;

        for (let attempt = 0; attempt < MAX_QUESTION_ISSUE_RETRIES; attempt += 1) {
          const candidate = await issueQuestion({
            session_id: currentSession.id,
          });
          const expressionKey = candidate.expression_latex ?? candidate.expression_str;

          if (!issuedExpressionKeysRef.current.has(expressionKey)) {
            issuedExpressionKeysRef.current.add(expressionKey);
            nextQuestion = candidate;
            break;
          }
        }

        if (!nextQuestion) {
          throw new Error("duplicate-question");
        }

        setQuestion(nextQuestion);
        startedAtRef.current = Date.now();
        deadlineRef.current = Date.now() + nextQuestion.time_limit_ms;
        setRemainingMs(nextQuestion.time_limit_ms);
        timeoutHandledRef.current = false;
      } catch (error) {
        const duplicateQuestionError =
          error instanceof Error && error.message === "duplicate-question";
        Alert.alert(
          t("gameSessionScreen.errorTitle"),
          duplicateQuestionError
            ? t("gameSessionScreen.duplicateQuestionError")
            : getApiErrorMessage(error) ?? t("gameSessionScreen.questionError"),
        );
      } finally {
        setIssuing(false);
      }
    },
    [finishMutation.isPending, session, t],
  );

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (
      !session ||
      !session.is_active ||
      question ||
      feedback ||
      issuing ||
      submitting ||
      finishMutation.isPending
    ) {
      return;
    }

    if (session.total_questions >= MAX_SOLO_QUESTIONS) {
      void handleFinishSession("completed");
      return;
    }

    void handleIssueQuestion(session);
  }, [
    finishMutation.isPending,
    handleFinishSession,
    feedback,
    handleIssueQuestion,
    issuing,
    question,
    session,
    submitting,
  ]);

  useEffect(() => {
    if (!question || !deadlineRef.current) {
      return;
    }

    const interval = setInterval(() => {
      const nextRemaining = Math.max(0, deadlineRef.current! - Date.now());
      setRemainingMs(nextRemaining);

      if (nextRemaining === 0 && !timeoutHandledRef.current) {
        timeoutHandledRef.current = true;
        setQuestion(null);
        void handleFinishSession("timeout");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [handleFinishSession, question]);

  useEffect(() => {
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

  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmitAnswer() {
    if (!question || !answer.trim()) return;

    timeoutHandledRef.current = true;
    deadlineRef.current = null;
    setSubmitting(true);

    try {
      const timeTakenMs = Math.max(
        1,
        startedAtRef.current ? Date.now() - startedAtRef.current : 1,
      );

      const result = await createAttempt({
        question_id: question.question_id,
        user_answer: answer.trim(),
        time_taken_ms: timeTakenMs,
        use_latex: false,
      });

      setFeedback({
        correct: result.attempt.is_correct,
        score: result.attempt.score,
        solution: result.correct_derivative_latex,
      });

      const updatedSession = result.session_finish?.session
        ? result.session_finish.session
        : await getSession(question.session_id);

      setSession(updatedSession);
      if (question.expression_latex || question.expression_str) {
        issuedExpressionKeysRef.current.add(
          question.expression_latex ?? question.expression_str,
        );
      }
      setQuestion(null);
      setRemainingMs(0);
      deadlineRef.current = null;
      timeoutHandledRef.current = false;

      const reachedLimit =
        updatedSession.total_questions >= MAX_SOLO_QUESTIONS ||
        !updatedSession.is_active;

      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }

      advanceTimeoutRef.current = setTimeout(() => {
        if (finishingSessionRef.current) {
          return;
        }

        setFeedback(null);

        if (result.session_finish) {
          void applyFinishedSession(result.session_finish, "completed");
          return;
        }

        if (reachedLimit) {
          void handleFinishSession("completed");
          return;
        }

        void handleIssueQuestion(updatedSession);
      }, 900);
    } catch (error) {
      if (question) {
        const fallbackDeadline = Date.now() + Math.max(remainingMs, 1);
        deadlineRef.current = fallbackDeadline;
        timeoutHandledRef.current = false;
      }
      Alert.alert(
        t("gameSessionScreen.errorTitle"),
        getApiErrorMessage(error) ?? t("gameSessionScreen.attemptError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = Boolean(question && answer.trim() && !submitting);

  const accuracy = useMemo(() => {
    if (!session?.total_questions) return "0%";
    return `${Math.round((session.correct_answers / session.total_questions) * 100)}%`;
  }, [session]);

  const currentRound = useMemo(() => {
    const answered = session?.total_questions ?? 0;
    const inFlight = question ? 1 : 0;
    return Math.min(answered + inFlight, MAX_SOLO_QUESTIONS);
  }, [question, session]);

  const progressPercent = useMemo(() => {
    if (!question?.time_limit_ms) return 0;
    return Math.max(0, Math.min(1, remainingMs / question.time_limit_ms));
  }, [question, remainingMs]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#070B14]">
        <ActivityIndicator color="#19D3FF" />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  if (!session.is_active) {
    return (
      <View
        className="flex-1 bg-[#070B14] px-6"
        style={{
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom + 24, 32),
        }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] font-extrabold uppercase tracking-[2px] text-cyan-300">
            {session.mode === "ranked"
              ? t("gameSessionScreen.modeRanked")
              : t("gameSessionScreen.modePractice")}
          </Text>

          <Text className="text-sm font-bold text-slate-400">
            {currentRound}/{MAX_SOLO_QUESTIONS}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-[28px] font-black text-white">
            {t("gameSessionScreen.finishedState")}
          </Text>
          <Text className="mt-3 text-center text-sm leading-6 text-slate-300">
            {t("gameSessionScreen.finishedHelp")}
          </Text>

          <View className="mt-8 w-full gap-3">
            <View className="flex-row justify-between">
              <Text className="text-slate-400">
                {t("gameSessionScreen.questions")}
              </Text>
              <Text className="font-extrabold text-white">
                {session.total_questions}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-slate-400">
                {t("gameSessionScreen.correct")}
              </Text>
              <Text className="font-extrabold text-white">
                {session.correct_answers}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-slate-400">
                {t("gameSessionScreen.accuracy")}
              </Text>
              <Text className="font-extrabold text-white">{accuracy}</Text>
            </View>
          </View>

          <Pressable
            className="mt-10 h-12 w-full items-center justify-center rounded-2xl bg-[#19D3FF]"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Text className="text-[15px] font-black text-[#08111F]">
              {t("gameSessionScreen.backHome")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#070B14]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: Math.max(insets.bottom + 20, keyboardHeight + 24),
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-extrabold uppercase tracking-[2px] text-cyan-300">
              {session.mode === "ranked"
                ? t("gameSessionScreen.modeRanked")
                : t("gameSessionScreen.modePractice")}
            </Text>

            <Text className="text-sm font-bold text-slate-400">
              {currentRound}/{MAX_SOLO_QUESTIONS}
            </Text>
          </View>

          <View className="mt-5 flex-row items-end justify-between">
            <View>
              <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-500">
                {t("gameSessionScreen.timer")}
              </Text>
              <Text className="mt-1 text-[34px] font-black text-white">
                {question ? formatCountdown(remainingMs) : "--"}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-500">
                {t("gameSessionScreen.level", { level: session.level ?? "-" })}
              </Text>
              <Text className="mt-1 text-base font-extrabold text-slate-200">
                {t("gameSessionScreen.accuracy")}: {accuracy}
              </Text>
            </View>
          </View>

          <View className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <View
              className={`h-full rounded-full ${
                remainingMs < 3000 ? "bg-rose-400" : "bg-[#19D3FF]"
              }`}
              style={{
                width: `${progressPercent * 100}%`,
              }}
            />
          </View>
        </View>

        <View className="flex-1 items-center justify-center py-8">
          {question ? (
            <View className="w-full items-center">
              <Text className="mb-4 text-[11px] font-semibold uppercase tracking-[1px] text-slate-500">
                {t("gameSessionScreen.currentQuestion")}
              </Text>

              <View className="w-full items-center justify-center px-2 py-6">
                {question.expression_latex ? (
                  <Latex latex={question.expression_latex} />
                ) : (
                  <Text className="text-center text-[26px] font-bold leading-9 text-white">
                    {question.expression_str}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View className="items-center">
              <Text className="text-center text-base font-bold text-white">
                {issuing
                  ? t("gameSessionScreen.loadingQuestion")
                  : t("gameSessionScreen.preparingQuestion")}
              </Text>
            </View>
          )}
        </View>

        {feedback ? (
          <View className="mb-4">
            <Text
              className={`text-center text-base font-extrabold ${
                feedback.correct ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {feedback.correct
                ? t("gameSessionScreen.correctFeedback")
                : t("gameSessionScreen.wrongFeedback")}
            </Text>

            <Text className="mt-1 text-center text-sm text-slate-300">
              {t("gameSessionScreen.scoreFeedback", {
                score: feedback.score,
              })}
            </Text>

            <View className="mt-3 items-center justify-center px-3">
              <Latex latex={feedback.solution} />
            </View>

            <Text className="mt-2 text-center text-xs font-semibold uppercase tracking-[1px] text-slate-500">
              {t("gameSessionScreen.autoAdvance")}
            </Text>
          </View>
        ) : null}

        <View>
          <View className="mb-3 flex-row justify-between">
            <Text className="text-slate-400">
              {t("gameSessionScreen.questions")}:{" "}
              <Text className="font-extrabold text-white">
                {session.total_questions}
              </Text>
            </Text>

            <Text className="text-slate-400">
              {t("gameSessionScreen.correct")}:{" "}
              <Text className="font-extrabold text-white">
                {session.correct_answers}
              </Text>
            </Text>
          </View>

          <TextInput
            className="rounded-2xl border border-white/10 bg-[#0B1322] px-4 py-4 text-white"
            placeholder={t("gameSessionScreen.answerPlaceholder")}
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            autoCorrect={false}
            value={answer}
            onChangeText={setAnswer}
            editable={!submitting && remainingMs > 0 && !!question}
            onFocus={() => {
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              });
            }}
          />

          <Pressable
            className="mt-3 h-12 items-center justify-center rounded-2xl bg-[#19D3FF]"
            style={({ pressed }) => ({
              opacity: pressed || !canSubmit ? 0.85 : 1,
            })}
            onPress={() => void handleSubmitAnswer()}
            disabled={!canSubmit}
          >
            <Text className="text-[15px] font-black text-[#08111F]">
              {submitting
                ? t("gameSessionScreen.submitting")
                : t("gameSessionScreen.submit")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
