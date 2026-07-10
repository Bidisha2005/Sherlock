import { signalWeights } from "../config/weights";
import { FeatureExtractor } from "../domain/FeatureExtractor";
import { FeatureSignal, MeetingSnapshot } from "../domain/types";

export class EmailExtractor implements FeatureExtractor {
  readonly name = "email";

  async extract(snapshot: MeetingSnapshot): Promise<FeatureSignal[]> {
    const expected = snapshot.candidateProfile.email.toLowerCase();
    return snapshot.participants.map((participant): FeatureSignal => {
      const email = participant.email?.toLowerCase();
      if (!email) {
        return {
          participantId: participant.id,
          signal: "candidate_email",
          confidence: 0,
          weight: signalWeights.candidate_email,
          direction: "unknown",
          reason: `Email is unavailable for ${participant.displayName}.`,
          observedAtIso: snapshot.capturedAtIso
        };
      }

      const exact = email === expected;
      const invited = snapshot.candidateProfile.calendarGuestEmails.map((item) => item.toLowerCase()).includes(email);
      return {
        participantId: participant.id,
        signal: "candidate_email",
        confidence: exact ? 1 : invited ? 0.55 : 0.12,
        weight: signalWeights.candidate_email,
        direction: exact || invited ? "positive" : "negative",
        reason: exact
          ? `${participant.displayName} uses the candidate email.`
          : invited
            ? `${participant.displayName} appears in calendar guest metadata.`
            : `${participant.displayName} email does not match candidate metadata.`,
        observedAtIso: snapshot.capturedAtIso
      };
    });
  }
}
