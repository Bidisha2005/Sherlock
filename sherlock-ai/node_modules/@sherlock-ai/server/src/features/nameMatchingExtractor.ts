import { signalWeights } from "../config/weights";
import { FeatureExtractor } from "../domain/FeatureExtractor";
import { FeatureSignal, MeetingSnapshot } from "../domain/types";
import { tokenSimilarity } from "../utils/text";

export class NameMatchingExtractor implements FeatureExtractor {
  readonly name = "name-matching";

  async extract(snapshot: MeetingSnapshot): Promise<FeatureSignal[]> {
    return snapshot.participants.map((participant): FeatureSignal => {
      const similarity = tokenSimilarity(participant.displayName, snapshot.candidateProfile.fullName);
      return {
        participantId: participant.id,
        signal: "display_name_similarity",
        confidence: similarity,
        weight: signalWeights.display_name_similarity,
        direction: similarity >= 0.45 ? "positive" : similarity <= 0.1 ? "negative" : "unknown",
        reason:
          similarity >= 0.45
            ? `${participant.displayName} is similar to candidate name ${snapshot.candidateProfile.fullName}.`
            : `${participant.displayName} does not strongly match candidate name ${snapshot.candidateProfile.fullName}.`,
        observedAtIso: snapshot.capturedAtIso,
        metadata: { similarity: Number(similarity.toFixed(3)) }
      };
    });
  }
}
