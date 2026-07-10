import { FeatureSignal, MeetingSnapshot, ParticipantRanking, PredictionResult } from "../domain/types";

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export class ConfidenceEngine {
  score(snapshot: MeetingSnapshot, signals: FeatureSignal[]): PredictionResult {
    const ranking = snapshot.participants
      .map((participant): ParticipantRanking => {
        const participantSignals = signals.filter((signal) => signal.participantId === participant.id);
        const totalWeight = participantSignals.reduce((sum, signal) => sum + clamp01(signal.weight), 0) || 1;
        const rawScore = participantSignals.reduce((sum, signal) => {
          const weighted = clamp01(signal.confidence) * clamp01(signal.weight);
          if (signal.direction === "negative") return sum - weighted;
          if (signal.direction === "unknown") return sum;
          return sum + weighted;
        }, 0);
        const confidence = clamp01((rawScore / totalWeight + 1) / 2);
        return {
          participantId: participant.id,
          displayName: participant.displayName,
          score: Number(rawScore.toFixed(4)),
          confidence: Number(confidence.toFixed(4)),
          positiveSignals: participantSignals.filter((signal) => signal.direction === "positive"),
          negativeSignals: participantSignals.filter((signal) => signal.direction === "negative"),
          unknownSignals: participantSignals.filter((signal) => signal.direction === "unknown")
        };
      })
      .sort((left, right) => right.confidence - left.confidence);

    const winner = ranking[0];
    const candidate = winner ? snapshot.participants.find((participant) => participant.id === winner.participantId) ?? null : null;
    const winnerSignals = winner ? [...winner.positiveSignals, ...winner.negativeSignals, ...winner.unknownSignals] : [];
    const topSignals = winnerSignals
      .filter((signal) => signal.direction === "positive")
      .sort((left, right) => right.confidence * right.weight - left.confidence * left.weight)
      .slice(0, 6);
    const weakSignals = winnerSignals
      .filter((signal) => signal.direction !== "positive" || signal.confidence < 0.45)
      .slice(0, 6);
    const missingInformation = signals
      .filter((signal) => signal.direction === "unknown")
      .map((signal) => signal.reason)
      .filter((reason, index, reasons) => reasons.indexOf(reason) === index)
      .slice(0, 8);

    return {
      meetingId: snapshot.meetingId,
      candidate,
      confidence: winner?.confidence ?? 0,
      topSignals,
      weakSignals,
      reason: this.buildReason(candidate?.displayName, winner?.confidence ?? 0, topSignals, weakSignals),
      ranking,
      missingInformation,
      generatedAtIso: new Date().toISOString()
    };
  }

  private buildReason(
    displayName: string | undefined,
    confidence: number,
    topSignals: FeatureSignal[],
    weakSignals: FeatureSignal[]
  ): string {
    if (!displayName) return "No candidate can be selected because no participants are present.";
    const evidence = topSignals.map((signal) => signal.signal.replace(/_/g, " ")).join(", ");
    const caveat = weakSignals.length > 0 ? " Weak or unknown evidence is still tracked in the evidence panel." : "";
    return `Selected ${displayName} with ${(confidence * 100).toFixed(1)}% confidence from ${evidence || "available evidence"}.${caveat}`;
  }
}
