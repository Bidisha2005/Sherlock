import { signalWeights } from "../config/weights";
import { FeatureExtractor } from "../domain/FeatureExtractor";
import { FeatureSignal, MeetingSnapshot } from "../domain/types";

export class EventExtractor implements FeatureExtractor {
  readonly name = "events";

  async extract(snapshot: MeetingSnapshot): Promise<FeatureSignal[]> {
    const ordered = [...snapshot.participants].sort(
      (left, right) => Date.parse(left.joinedAtIso) - Date.parse(right.joinedAtIso)
    );
    return snapshot.participants.flatMap((participant): FeatureSignal[] => {
      const joinIndex = ordered.findIndex((entry) => entry.id === participant.id);
      const screenShareConfidence = participant.screenSharing ? 0.35 : 0.05;
      return [
        {
          participantId: participant.id,
          signal: "join_order",
          confidence: joinIndex <= 1 ? 0.3 : 0.55,
          weight: signalWeights.join_order,
          direction: joinIndex <= 1 ? "unknown" : "positive",
          reason: `${participant.displayName} joined at position ${joinIndex + 1}. Interviewers often join before the candidate.`,
          observedAtIso: snapshot.capturedAtIso
        },
        {
          participantId: participant.id,
          signal: "screen_share",
          confidence: screenShareConfidence,
          weight: signalWeights.screen_share,
          direction: participant.screenSharing ? "positive" : "unknown",
          reason: participant.screenSharing
            ? `${participant.displayName} is sharing screen, which may happen during candidate coding or portfolio discussion.`
            : `${participant.displayName} is not sharing screen.`,
          observedAtIso: snapshot.capturedAtIso
        },
        {
          participantId: participant.id,
          signal: "participant_events",
          confidence: participant.leftAtIso ? 0.2 : 0.6,
          weight: signalWeights.participant_events,
          direction: participant.leftAtIso ? "unknown" : "positive",
          reason: participant.leftAtIso
            ? `${participant.displayName} left the meeting before the latest snapshot.`
            : `${participant.displayName} remains active in the meeting.`,
          observedAtIso: snapshot.capturedAtIso
        }
      ];
    });
  }
}
