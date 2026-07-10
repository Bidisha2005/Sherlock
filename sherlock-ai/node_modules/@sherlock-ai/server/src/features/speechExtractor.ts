import { signalWeights } from "../config/weights";
import { FeatureExtractor } from "../domain/FeatureExtractor";
import { FeatureSignal, MeetingSnapshot } from "../domain/types";

export class SpeechExtractor implements FeatureExtractor {
  readonly name = "speech";

  async extract(snapshot: MeetingSnapshot): Promise<FeatureSignal[]> {
    const totalSpeaking = snapshot.telemetry.reduce((sum, item) => sum + item.speakingMs, 0) || 1;
    return snapshot.telemetry.flatMap((item): FeatureSignal[] => {
      const participant = snapshot.participants.find((entry) => entry.id === item.participantId);
      const speakingShare = item.speakingMs / totalSpeaking;
      const answerRatio = item.answerCount / Math.max(1, item.questionCount + item.answerCount);
      return [
        {
          participantId: item.participantId,
          signal: "speaking_duration",
          confidence: speakingShare,
          weight: signalWeights.speaking_duration,
          direction: speakingShare >= 0.28 ? "positive" : speakingShare < 0.08 ? "negative" : "unknown",
          reason: `${participant?.displayName ?? item.participantId} accounts for ${(speakingShare * 100).toFixed(1)}% of speaking time.`,
          observedAtIso: snapshot.capturedAtIso
        },
        {
          participantId: item.participantId,
          signal: "question_answer_role",
          confidence: answerRatio,
          weight: signalWeights.question_answer_role,
          direction: answerRatio >= 0.6 ? "positive" : answerRatio <= 0.25 ? "negative" : "unknown",
          reason: `${participant?.displayName ?? item.participantId} has an answer-heavy conversation role.`,
          observedAtIso: snapshot.capturedAtIso
        }
      ];
    });
  }
}
