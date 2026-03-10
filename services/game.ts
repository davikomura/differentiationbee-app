// services/game.ts
import type {
  DailyChallenge,
  IssueQuestionPayload,
  IssuedQuestion,
} from "@/types/game";
import api from "./api";

export async function getDailyChallenge() {
  const { data } = await api.get<DailyChallenge>("/game/daily-challenge");
  return data;
}

export async function issueQuestion(payload: IssueQuestionPayload) {
  const { data } = await api.post<IssuedQuestion>("/game/question", payload);
  return data;
}
