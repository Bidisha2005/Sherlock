import {
  FeatureSignal,
  MeetingSnapshot,
  ParticipantRanking,
  PredictionResult
} from "../types";

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const contribution = (signal: FeatureSignal): number => {
  const magnitude = clamp01(signal.confidence) * clamp01(signal.weight);
  if (signal.direction === "negative") return -magnitude;
  if (signal.direction === "unknown") return 0;
  return magnitude;
};

export class ConfidenceEngine {
  score(snapshot: MeetingSnapshot, signals: FeatureSignal[]): PredictionResult {
    const rankings = snapshot.participants
      .map((participant): ParticipantRanking => {
        const participantSignals = signals.filter((signal) => signal.participantId === participant.id);
        const positiveSignals = participantSignals.filter((signal) => signal.direction === "positive");
        const negativeSignals = participantSignals.filter((signal) => signal.direction === "negative");
        const unknownSignals = participantSignals.filter((signal) => signal.direction === "unknown");
        const totalWeight = participantSignals.reduce((sum, signal) => sum + clamp01(signal.weight), 0) || 1;
        const rawScore = participantSignals.reduce((sum, signal) => sum + contribution(signal), 0);
        const normalizedScore = clamp01((rawScore / totalWeight + 1) / 2);

        return {
          participantId: participant.id,
          displayName: participant.displayName,
          score: Number(rawScore.toFixed(4)),
          confidence: Number(normalizedScore.toFixed(4)),
          positiveSignals,
          negativeSignals,
          unknownSignals
        };
      })
      .sort((left, right) => right.confidence - left.confidence);

    const winner = rankings[0];
    const selectedParticipant = winner
      ? snapshot.participants.find((participant) => participant.id === winner.participantId) ?? null
      : null;

    const allWinnerSignals = winner
      ? [...winner.positiveSignals, ...winner.negativeSignals, ...winner.unknownSignals]
      : [];
    const topSignals = [...allWinnerSignals]
      .filter((signal) => signal.direction === "positive")
      .sort((left, right) => right.confidence * right.weight - left.confidence * left.weight)
      .slice(0, 5);
    const weakSignals = [...allWinnerSignals]
      .filter((signal) => signal.direction !== "positive" || signal.confidence < 0.45)
      .slice(0, 5);

    const missingInformation = this.missingInformation(signals);
    const confidence = winner?.confidence ?? 0;

    return {
      meetingId: snapshot.meetingId,
      candidate: selectedParticipant,
      confidence,
      topSignals,
      weakSignals,
      reason: this.reason(selectedParticipant?.displayName, confidence, topSignals, weakSignals),
      ranking: rankings,
      missingInformation,
      generatedAtIso: new Date().toISOString()
    };
  }

  private missingInformation(signals: FeatureSignal[]): string[] {
    return signals
      .filter((signal) => signal.direction === "unknown")
      .map((signal) => signal.reason)
      .filter((reason, index, reasons) => reasons.indexOf(reason) === index)
      .slice(0, 6);
  }

  private reason(
    name: string | undefined,
    confidence: number,
    topSignals: FeatureSignal[],
    weakSignals: FeatureSignal[]
  ): string {
    if (!name) return "No participants were available for scoring.";
    const evidence = topSignals.map((signal) => signal.signal.replace(/_/g, " ")).join(", ");
    const caveat = weakSignals.length > 0 ? " Some evidence remains weak or unavailable." : "";
    return `Selected ${name} with ${(confidence * 100).toFixed(1)}% confidence based on ${evidence || "available meeting evidence"}.${caveat}`;
  }
}
