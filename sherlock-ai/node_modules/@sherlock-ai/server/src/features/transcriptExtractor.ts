import { signalWeights } from "../config/weights";
import { FeatureExtractor } from "../domain/FeatureExtractor";
import { FeatureSignal, MeetingSnapshot } from "../domain/types";
import { normalizeText, tokenSimilarity } from "../utils/text";

export class TranscriptExtractor implements FeatureExtractor {
  readonly name = "transcript";

  async extract(snapshot: MeetingSnapshot): Promise<FeatureSignal[]> {
    return snapshot.participants.flatMap((participant): FeatureSignal[] => {
      const text = snapshot.transcript
        .filter((segment) => segment.participantId === participant.id)
        .map((segment) => segment.text)
        .join(" ");
      const normalized = normalizeText(text);
      const candidateName = normalizeText(snapshot.candidateProfile.fullName);
      const selfIntro = normalized.includes("my name is") || normalized.includes("i am ") || normalized.includes("i'm ");
      const nameMentioned = candidateName.split(" ").some((token) => token.length > 2 && normalized.includes(token));
      const resumeSimilarity = tokenSimilarity(text, snapshot.candidateProfile.resumeText);

      return [
        {
          participantId: participant.id,
          signal: "self_introduction",
          confidence: selfIntro && nameMentioned ? 0.9 : selfIntro ? 0.55 : 0.1,
          weight: signalWeights.self_introduction,
          direction: selfIntro ? "positive" : "unknown",
          reason: selfIntro
            ? `${participant.displayName} appears to self-introduce in the transcript.`
            : `${participant.displayName} has not self-introduced yet.`,
          observedAtIso: snapshot.capturedAtIso
        },
        {
          participantId: participant.id,
          signal: "resume_matching",
          confidence: resumeSimilarity,
          weight: signalWeights.resume_matching,
          direction: resumeSimilarity >= 0.18 ? "positive" : "unknown",
          reason: `${participant.displayName} transcript overlaps with resume keywords at ${(resumeSimilarity * 100).toFixed(1)}%.`,
          observedAtIso: snapshot.capturedAtIso
        },
        {
          participantId: participant.id,
          signal: "transcript_analysis",
          confidence: Math.min(1, text.length / 600),
          weight: signalWeights.transcript_analysis,
          direction: text.length > 80 ? "positive" : "unknown",
          reason: `${participant.displayName} has ${text.length} transcript characters available for language evidence.`,
          observedAtIso: snapshot.capturedAtIso
        }
      ];
    });
  }
}
